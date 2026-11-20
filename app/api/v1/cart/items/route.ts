// app/api/v1/cart/route.ts
import { NextRequest, NextResponse } from "next/server";

const BACKEND_BASE =
  (process.env.NEXT_PUBLIC_API_BASE_URL || "https://ecommerce.flixzaglobal.com/api/v1").replace(
    /\/+$/,
    ""
  );

export async function GET(req: NextRequest) {
  try {
    const incomingToken = req.headers.get("x-guest-cart-token");
    const authHeader = req.headers.get("authorization");

    const res = await fetch(`${BACKEND_BASE}/cart`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        ...(incomingToken ? { "X-Guest-Cart-Token": incomingToken } : {}),
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      cache: "no-store",
    });

    const data = await res.json().catch(() => ({}));
    const response = NextResponse.json(data, { status: res.status });

    const returnedToken =
      res.headers.get("x-guest-cart-token") ||
      data?.guest_cart_token ||
      data?.guest_token ||
      data?.data?.guest_cart_token;

    if (returnedToken) {
      response.headers.set("X-Guest-Cart-Token", returnedToken);
    }

    return response;
  } catch (error) {
    console.error("Cart proxy error:", error);
    return NextResponse.json(
      { message: "Failed to connect to cart service" },
      { status: 502 }
    );
  }
}