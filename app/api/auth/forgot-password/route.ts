// app/api/auth/forgot-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import { laravelFetch, extractError } from "@/lib/server/api";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { message: "Email address is required." },
        { status: 422 }
      );
    }

    // Laravel API-তে রিকোয়েস্ট পাঠানো
    const res = await laravelFetch("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });

    // ✅ Security: Account Enumeration Prevented
    // ইমেইল ভুল হলেও Laravel সাধারণত 200 OK + Success Message দেয়।
    // আমরা সেই মেসেজটিই ফরোয়ার্ড করছি।
    const data = await res.json();
    
    return NextResponse.json({ 
      message: data.message ?? "If this email exists, a reset link has been sent.",
      success: true 
    });

  } catch (error) {
    // নেটওয়ার্ক বা সার্ভার ডাউন থাকলে ইউজারকে জানানো
    return NextResponse.json(
      { message: "Unable to process request. Please try again later." },
      { status: 502 }
    );
  }
}