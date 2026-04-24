import { NextRequest, NextResponse } from "next/server";
import { fetchWithTimeout, retry } from "@/lib/api";

const MAILTM_BASE = process.env.MAIL_API_BASE ?? "";

export async function GET(request: NextRequest) {
  if (!MAILTM_BASE) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }
  const token = request.cookies.get("tmSession")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const res = await retry(() =>
      fetchWithTimeout(`${MAILTM_BASE}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
    );

    if (!res.ok) {
      if (res.status === 401) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      return NextResponse.json({ error: "Failed to fetch account" }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("/api/temp-mail/me error", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
