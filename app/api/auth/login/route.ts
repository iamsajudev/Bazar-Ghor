import { NextRequest, NextResponse } from "next/server";
import { laravelFetch, extractError, AUTH_COOKIE, authCookieOptions } from "@/lib/server/api";

export async function POST(req: NextRequest) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json(
                { message: "Email and password are required." },
                { status: 422 }
            );
        }

        const res = await laravelFetch("/auth/login", {
            method: "POST",
            body: JSON.stringify({ email, password }),
        });

        if (!res.ok) {
            const err = await extractError(res);
            return NextResponse.json(err, { status: res.status });
        }

        const body = await res.json();
        const token: string | undefined = body.token;

        if (!token) {
            return NextResponse.json(
                { message: "Login response did not include a token." },
                { status: 502 }
            );
        }

        const response = NextResponse.json({ data: body.data ?? null });
        response.cookies.set(AUTH_COOKIE, token, authCookieOptions); // ✅ ৩ দিনের persistent cookie
        return response;
    } catch {
        return NextResponse.json(
            { message: "Could not reach the authentication server." },
            { status: 502 }
        );
    }
}