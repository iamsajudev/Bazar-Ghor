import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE, extractError, getApiBase, laravelFetch } from "@/lib/server/api";

function buildSingleOrderPath(encodedOrder: string): string {
  const base = getApiBase().replace(/\/+$/, "");
  return base.endsWith("/api/v1")
    ? `/orders/${encodedOrder}`
    : `/api/v1/orders/${encodedOrder}`;
}

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ order: string }> }
) {
  try {
    const { order } = await context.params;
    const cleanOrder = decodeURIComponent(order || "").trim();

    if (!cleanOrder) {
      return NextResponse.json(
        { message: "Invalid order reference." },
        { status: 400 }
      );
    }

    const cookieName = AUTH_COOKIE || "bazar_auth_token";
    const cookieStore = await cookies();
    const token = cookieStore.get(cookieName)?.value?.trim();

    if (!token) {
      return NextResponse.json(
        { message: "Unauthenticated." },
        { status: 401 }
      );
    }

    const apiBase = getApiBase();
    if (!apiBase) {
      return NextResponse.json(
        { message: "API base URL is not configured." },
        { status: 500 }
      );
    }

    const encodedOrder = encodeURIComponent(cleanOrder);
    const res = await laravelFetch(buildSingleOrderPath(encodedOrder), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const err = await extractError(res);
      return NextResponse.json(
        { message: err.message, errors: err.errors },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to load order details.";
    return NextResponse.json({ message }, { status: 500 });
  }
}