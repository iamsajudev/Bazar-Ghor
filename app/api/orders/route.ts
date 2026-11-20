import { NextRequest, NextResponse } from "next/server";
import { laravelFetch, AUTH_COOKIE } from "@/lib/server/api";

export async function GET(req: NextRequest) {
    const token = req.cookies.get(AUTH_COOKIE)?.value;
    if (!token) {
        return NextResponse.json({ message: "Unauthenticated." }, { status: 401 });
    }

    const page = req.nextUrl.searchParams.get("page") ?? "1";

    try {
        const res = await laravelFetch(`/orders?page=${encodeURIComponent(page)}`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
            const response = NextResponse.json(
                { message: "Unauthenticated." },
                { status: res.status }
            );
            if (res.status === 401) {
                response.cookies.set(AUTH_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
            }
            return response;
        }

        const body = await res.json();
        // Laravel paginator 그대로 পাস: { data: [...], meta: { total, ... }, links }
        return NextResponse.json(body);
    } catch {
        return NextResponse.json({ message: "Server unreachable." }, { status: 502 });
    }
}