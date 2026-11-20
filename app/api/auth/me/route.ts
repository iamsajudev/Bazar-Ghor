import { NextRequest, NextResponse } from "next/server";
import { laravelFetch, AUTH_COOKIE, clearCookieOptions } from "@/lib/server/api";

export async function GET(req: NextRequest) {
    const token = req.cookies.get(AUTH_COOKIE)?.value;
    if (!token) {
        return NextResponse.json({ message: "Unauthenticated." }, { status: 401 });
    }

    try {
        const res = await laravelFetch("/auth/me", {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
            const response = NextResponse.json(
                { message: "Unauthenticated." },
                { status: 401 }
            );
            // শুধু সার্ভার নিশ্চিতভাবে reject করলেই কুকি মুছি
            if (res.status === 401) {
                response.cookies.set(AUTH_COOKIE, "", clearCookieOptions);
            }
            return response;
        }

        const body = await res.json();
        return NextResponse.json({ data: body.data });
    } catch {
        // নেটওয়ার্ক এরর ≠ logout — কুকি অক্ষত থাকে
        return NextResponse.json({ message: "Server unreachable." }, { status: 502 });
    }
}