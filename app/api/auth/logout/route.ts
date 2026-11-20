import { NextRequest, NextResponse } from "next/server";
import { laravelFetch, AUTH_COOKIE, clearCookieOptions } from "@/lib/server/api";

export async function POST(req: NextRequest) {
    const token = req.cookies.get(AUTH_COOKIE)?.value;

    if (token) {
        try {
            await laravelFetch("/auth/logout", {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
            });
        } catch {
            // ব্যাকএন্ডে পৌঁছাতে না পারলেও ক্লায়েন্টের কুকি মুছে দেব
        }
    }

    const response = NextResponse.json({ message: "Logged out" });
    response.cookies.set(AUTH_COOKIE, "", clearCookieOptions); // ✅ একমাত্র এখানেই ইচ্ছাকৃত ডিলিট
    return response;
}