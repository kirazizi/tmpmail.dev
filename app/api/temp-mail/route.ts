import { randomInt, randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { fetchWithTimeout, retry } from "@/lib/api";
import { rateLimit } from "@/lib/rateLimit";
import { uniqueNamesGenerator, names } from "unique-names-generator";

const MAILTM_BASE = process.env.MAIL_API_BASE ?? "";

let cachedDomain: string | null = null;
let domainCachedAt = 0;
const DOMAIN_CACHE_TTL = 60 * 60 * 1000; // 1 hour

// Helper to generate a random email local-part like "nathalie38"
function randomEmailName() {
  const name = uniqueNamesGenerator({ dictionaries: [names], length: 1 }).toLowerCase();
  const num = randomInt(100);
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
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
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

    const address = `${randomEmailName()}@${domain}`;
    const password = randomPassword(16);

    const accountRes = await retry(() =>
      fetchWithTimeout(`${MAILTM_BASE}/accounts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, password }),
        timeoutMs: 7000,
      })
    );

    if (!accountRes.ok) {
      const details = await accountRes.text();
      console.error("/api/temp-mail create account error", details);
      return NextResponse.json({ error: "Failed to create account" }, { status: 500 });
    }
    const account = await accountRes.json();

    const tokenRes = await retry(() =>
      fetchWithTimeout(`${MAILTM_BASE}/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, password }),
        timeoutMs: 7000,
      })
    );

    if (!tokenRes.ok) {
      const details = await tokenRes.text();
      console.error("/api/temp-mail get token error", details);
      return NextResponse.json({ error: "Failed to get token" }, { status: 500 });
    }

    const tokenData = await tokenRes.json();

    let createdAt: string | undefined = account?.createdAt;
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

    return NextResponse.json({
      address,
      token: tokenData.token,
      createdAt,
    });
  } catch (error) {
    console.error("/api/temp-mail error", error);
    return NextResponse.json(
      { error: "Upstream service timeout or network error" },
      { status: 502 }
    );
  }
}
