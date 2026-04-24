import { NextRequest, NextResponse } from "next/server";
import { fetchWithTimeout, retry } from "@/lib/api";

const MAILTM_BASE = process.env.MAIL_API_BASE ?? "";

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  if (!MAILTM_BASE) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }
  try {
    const token = req.cookies.get("tmSession")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await ctx.params;
    if (!id || !/^[A-Za-z0-9_-]+$/.test(id)) {
      return NextResponse.json({ error: "Invalid message id" }, { status: 400 });
    }

    const safeId = encodeURIComponent(id);
    const detailRes = await retry(() =>
      fetchWithTimeout(`${MAILTM_BASE}/messages/${safeId}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
        timeoutMs: 7000,
      })
    );

    if (!detailRes.ok) {
      const details = await detailRes.text();
      console.error("/api/temp-mail/messages/[id] error", details);
      return NextResponse.json({ error: "Failed to load message" }, { status: 500 });
    }

    const detail = await detailRes.json();

    return NextResponse.json(detail);
  } catch (error) {
    console.error("/api/temp-mail/messages/[id] error", error);
    return NextResponse.json({ error: "Upstream service timeout or network error" }, { status: 502 });
  }
}

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  if (!MAILTM_BASE) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }
  try {
    const token = req.cookies.get("tmSession")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await ctx.params;
    if (!id || !/^[A-Za-z0-9_-]+$/.test(id)) {
      return NextResponse.json({ error: "Invalid message id" }, { status: 400 });
    }

    const safeId = encodeURIComponent(id);
    const res = await fetchWithTimeout(`${MAILTM_BASE}/messages/${safeId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/merge-patch+json",
      },
      body: JSON.stringify({ seen: true }),
      timeoutMs: 7000,
    });

    if (!res.ok) {
      const details = await res.text();
      console.error("/api/temp-mail/messages/[id] PATCH error", details);
      return NextResponse.json({ error: "Failed to mark message as seen" }, { status: 500 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("/api/temp-mail/messages/[id] PATCH error", error);
    return NextResponse.json({ error: "Upstream service timeout or network error" }, { status: 502 });
  }
}
