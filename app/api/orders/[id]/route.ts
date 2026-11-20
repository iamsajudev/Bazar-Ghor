// app/api/orders/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { laravelFetch, AUTH_COOKIE } from "@/lib/server/api";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const token = req.cookies.get(AUTH_COOKIE)?.value;

  if (!token) {
    // গেস্ট ইউজারদের জন্য যদি আলাদা এন্ডপয়েন্ট থাকে (যেমন /guest/orders/{id})
    // তাহলে সেটা ব্যবহার করবেন। আপাতত সাধারণ /orders/{id} দিচ্ছি
    return NextResponse.json({ message: "Unauthenticated." }, { status: 401 });
  }

  try {
    const res = await laravelFetch(`/orders/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      return NextResponse.json(
        { message: "Order not found or unauthorized." },
        { status: res.status }
      );
    }

    const body = await res.json();
    return NextResponse.json(body);
  } catch {
    return NextResponse.json({ message: "Server unreachable." }, { status: 502 });
  }
}