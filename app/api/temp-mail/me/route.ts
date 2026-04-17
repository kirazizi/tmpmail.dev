import { NextResponse } from "next/server";
import { fetchWithTimeout, retry } from "@/lib/api";

if (!process.env.MAIL_API_BASE) {
    throw new Error("MAIL_API_BASE is not defined");
}

const MAILTM_BASE = process.env.MAIL_API_BASE;

export async function GET(request: Request) {
    const authHeader = request.headers.get("Authorization");

    if (!authHeader) {
        return NextResponse.json({ error: "Missing Authorization header" }, { status: 401 });
    }

    try {
        const res = await retry(() =>
            fetchWithTimeout(`${MAILTM_BASE}/me`, {
                headers: { Authorization: authHeader },
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
