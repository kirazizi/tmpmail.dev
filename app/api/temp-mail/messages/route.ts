import { NextRequest, NextResponse } from "next/server";
import { fetchWithTimeout, retry } from "@/lib/api";

if (!process.env.MAIL_API_BASE) {
  throw new Error("MAIL_API_BASE is not defined");
}

const MAILTM_BASE = process.env.MAIL_API_BASE;

export async function GET(req: NextRequest) {
  try {
    const auth = req.headers.get("authorization") || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    if (!token) {
      return NextResponse.json({ error: "Missing Bearer token" }, { status: 401 });
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
