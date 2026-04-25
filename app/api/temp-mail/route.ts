import { randomInt, randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { fetchWithTimeout, retry } from "@/lib/api";
import { rateLimit } from "@/lib/rateLimit";
import { uniqueNamesGenerator, names } from "unique-names-generator";

const MAILTM_BASE = process.env.MAIL_API_BASE ?? "";

let cachedDomain: string | null = null;
let domainCachedAt = 0;
const DOMAIN_CACHE_TTL = 60 * 60 * 1000; // 1 hour

// Helper to generate a random email local-part like "nathalie3847"
function randomEmailName() {
  const name = uniqueNamesGenerator({ dictionaries: [names], length: 1 }).toLowerCase();
  const num = randomInt(10000);
  return `${name}${num}`;
}

// Helper to generate a random password
function randomPassword(length = 16) {
  const targetLength = Math.max(1, Math.floor(length));
  let out = "";
  while (out.length < targetLength) {
    out += randomUUID().replace(/-/g, "");
  }
  return out.slice(0, targetLength);
}

export async function POST(req: NextRequest) {
  if (!MAILTM_BASE) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  const origin = req.headers.get("origin");
  const secFetchSite = req.headers.get("sec-fetch-site");
  const allowedOrigin =
    process.env.NEXT_PUBLIC_BASE_URL ??
    req.nextUrl.origin;

  if (secFetchSite === "cross-site") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (origin && origin !== allowedOrigin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const ip = req.headers.get("x-real-ip") || req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  if (!(await rateLimit(ip, 5, 10 * 60 * 1000))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    let domain = cachedDomain;
    if (!domain || Date.now() - domainCachedAt > DOMAIN_CACHE_TTL) {
      const domainsRes = await retry(() =>
        fetchWithTimeout(`${MAILTM_BASE}/domains`, { timeoutMs: 7000 })
      );
      if (!domainsRes.ok) {
        if (cachedDomain) {
          domain = cachedDomain; // use stale cache rather than fail
        } else {
          console.error("/api/temp-mail domains error", domainsRes.status);
          return NextResponse.json({ error: "Failed to load domains" }, { status: 500 });
        }
      } else {
        const domainsData = await domainsRes.json();
        domain = domainsData["hydra:member"]?.[0]?.domain ?? null;
        if (domain) {
          cachedDomain = domain;
          domainCachedAt = Date.now();
        }
      }
    }

    if (!domain) {
      return NextResponse.json({ error: "No domain available" }, { status: 500 });
    }

    let address = "";
    let password = "";
    let account: Record<string, unknown> | null = null;

    for (let attempt = 0; attempt < 3; attempt++) {
      address = `${randomEmailName()}@${domain}`;
      password = randomPassword(16);

      const accountRes = await fetchWithTimeout(`${MAILTM_BASE}/accounts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, password }),
        timeoutMs: 7000,
      });

      if (accountRes.ok) {
        account = await accountRes.json();
        break;
      }

      const details = await accountRes.text();
      if (accountRes.status === 422 && details.includes("already used")) {
        // Address collision — try again with a fresh random address
        continue;
      }
      console.error("/api/temp-mail create account error", details);
      return NextResponse.json({ error: "Failed to create account" }, { status: 500 });
    }

    if (!account) {
      return NextResponse.json({ error: "Failed to create account" }, { status: 500 });
    }

    const tokenRes = await fetchWithTimeout(`${MAILTM_BASE}/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address, password }),
      timeoutMs: 7000,
    });

    if (!tokenRes.ok) {
      const details = await tokenRes.text();
      console.error("/api/temp-mail get token error", details);
      return NextResponse.json({ error: "Failed to get token" }, { status: 500 });
    }

    const tokenData = await tokenRes.json();

    let createdAt: string | undefined = (account?.createdAt as string) ?? undefined;
    if (!createdAt) {
      const meRes = await retry(() =>
        fetchWithTimeout(`${MAILTM_BASE}/me`, {
          headers: { Authorization: `Bearer ${tokenData.token}` },
          timeoutMs: 7000,
        })
      );
      if (meRes.ok) {
        const me = await meRes.json();
        createdAt = me?.createdAt;
      }
    }

    const res = NextResponse.json({ address, createdAt });
    res.cookies.set("tmSession", tokenData.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/api/temp-mail",
      maxAge: 60 * 60,
    });
    return res;
  } catch (error) {
    console.error("/api/temp-mail error", error);
    return NextResponse.json(
      { error: "Upstream service timeout or network error" },
      { status: 502 }
    );
  }
}
