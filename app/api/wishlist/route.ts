import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE, extractError, getApiBase, laravelFetch } from "@/lib/server/api";

function buildWishlistPath(suffix = ""): string {
    const base = getApiBase().replace(/\/+$/, "");
    const cleanSuffix = suffix ? `/${suffix.replace(/^\/+/, "")}` : "";
    return base.endsWith("/api/v1")
        ? `/wishlist${cleanSuffix}`
        : `/api/v1/wishlist${cleanSuffix}`;
}

export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get(AUTH_COOKIE || "bazar_auth_token")?.value?.trim();

        if (!token) {
            return NextResponse.json({ message: "Unauthenticated." }, { status: 401 });
        }

        const res = await laravelFetch(buildWishlistPath(), {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
            const err = await extractError(res);
            return NextResponse.json({ message: err.message, errors: err.errors }, { status: res.status });
        }

        const data = await res.json();
        return NextResponse.json(data, { status: 200 });
    } catch (error: unknown) {
        return NextResponse.json(
            { message: error instanceof Error ? error.message : "Failed to load wishlist." },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get(AUTH_COOKIE || "bazar_auth_token")?.value?.trim();

        if (!token) {
            return NextResponse.json({ message: "Unauthenticated." }, { status: 401 });
        }

        const payload = await req.json();
        const res = await laravelFetch(buildWishlistPath(), {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            const err = await extractError(res);
            return NextResponse.json({ message: err.message, errors: err.errors }, { status: res.status });
        }

        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (error: unknown) {
        return NextResponse.json(
            { message: error instanceof Error ? error.message : "Failed to add to wishlist." },
            { status: 500 }
        );
    }
}