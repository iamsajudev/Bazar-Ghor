import { NextRequest, NextResponse } from "next/server";
import { laravelFetch, extractError, AUTH_COOKIE, authCookieOptions } from "@/lib/server/api";

export async function POST(req: NextRequest) {
    try {
        const { name, email, password, password_confirmation } = await req.json();

        if (!name || !email || !password || !password_confirmation) {
            return NextResponse.json({ message: "All fields are required." }, { status: 422 });
        }

        const regRes = await laravelFetch("/auth/register", {
            method: "POST",
            body: JSON.stringify({ name, email, password, password_confirmation }),
        });

        if (!regRes.ok) {
            const err = await extractError(regRes);
            return NextResponse.json(err, { status: regRes.status });
        }

        // অটো-লগইন (register টোকেন দেয় না)
        const loginRes = await laravelFetch("/auth/login", {
            method: "POST",
            body: JSON.stringify({ email, password }),
        });

        if (!loginRes.ok) {
            return NextResponse.json(
                { message: "Account created! Please sign in.", redirect: "/login" },
                { status: 201 }
            );
        }

        const body = await loginRes.json();
        const token: string | undefined = body.token;

        if (!token) {
            return NextResponse.json(
                { message: "Account created! Please sign in.", redirect: "/login" },
                { status: 201 }
            );
        }

        const response = NextResponse.json({ data: body.data ?? null }, { status: 201 });
        response.cookies.set(AUTH_COOKIE, token, authCookieOptions); // ✅ ৩ দিন
        return response;
    } catch {
        return NextResponse.json(
            { message: "Could not reach the authentication server." },
            { status: 502 }
        );
    }
}