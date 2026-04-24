import { NextRequest, NextResponse } from "next/server";
import { fetchWithTimeout, retry } from "@/lib/api";

const MAILTM_BASE = process.env.MAIL_API_BASE ?? "";

export async function GET(req: NextRequest) {
  if (!MAILTM_BASE) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }
  try {
    const token = req.cookies.get("tmSession")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const messagesRes = await retry(() =>
      fetchWithTimeout(`${MAILTM_BASE}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
        timeoutMs: 7000,
      })
    );

    if (!messagesRes.ok) {
      const details = await messagesRes.text();
      console.error("/api/temp-mail/messages error", details);
      return NextResponse.json({ error: "Failed to load messages" }, { status: 500 });
    }

    const messagesData = await messagesRes.json();

    return NextResponse.json(messagesData);
  } catch (error) {
    console.error("/api/temp-mail/messages error", error);
    return NextResponse.json({ error: "Upstream service timeout or network error" }, { status: 502 });
  }
}
