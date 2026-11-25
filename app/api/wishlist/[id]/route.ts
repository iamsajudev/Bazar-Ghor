import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE, extractError, getApiBase, laravelFetch } from "@/lib/server/api";

function buildWishlistItemPath(encodedId: string): string {
    const base = getApiBase().replace(/\/+$/, "");
    return base.endsWith("/api/v1")
        ? `/wishlist/${encodedId}`
        : `/api/v1/wishlist/${encodedId}`;
}

export async function DELETE(
    _req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const cleanId = decodeURIComponent(id || "").trim();

        if (!cleanId) {
            return NextResponse.json({ message: "Invalid item ID." }, { status: 400 });
        }

        const cookieStore = await cookies();
        const token = cookieStore.get(AUTH_COOKIE || "bazar_auth_token")?.value?.trim();

        if (!token) {
            return NextResponse.json({ message: "Unauthenticated." }, { status: 401 });
        }

        const res = await laravelFetch(buildWishlistItemPath(encodeURIComponent(cleanId)), {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
            const err = await extractError(res);
            return NextResponse.json({ message: err.message, errors: err.errors }, { status: res.status });
        }

        const data = await res.json().catch(() => ({ success: true }));
        return NextResponse.json(data, { status: 200 });
    } catch (error: unknown) {
        return NextResponse.json(
            { message: error instanceof Error ? error.message : "Failed to remove item." },
            { status: 500 }
        );
    }
}