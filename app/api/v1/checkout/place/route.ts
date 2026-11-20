// app/api/v1/checkout/place/route.ts
import { NextRequest, NextResponse } from "next/server";
import { laravelFetch, AUTH_COOKIE } from "@/lib/server/api";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const guestToken = req.headers.get("x-guest-cart-token");
    const authToken = req.headers.get("authorization");

    // Laravel-এ রিকোয়েস্ট পাঠানো
    const res = await laravelFetch("/checkout/place", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(guestToken ? { "X-Guest-Cart-Token": guestToken } : {}),
        ...(authToken ? { Authorization: authToken } : {}),
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { message: "Checkout service unavailable" },
      { status: 502 }
    );
  }
}