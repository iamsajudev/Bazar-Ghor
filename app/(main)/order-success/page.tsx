// app/order-success/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { laravelFetch, AUTH_COOKIE } from "@/lib/server/api";
import { CheckCircle2, ShoppingBag, ArrowRight, Package } from "lucide-react";

interface OrderSuccessProps {
  searchParams: Promise<{ id?: string }>;
}

export default async function OrderSuccessPage({ searchParams }: OrderSuccessProps) {
  const params = await searchParams;
  const orderId = params.id;

  // যদি কোনো অর্ডার আইডি না থাকে, তবে হোমপেজে পাঠিয়ে দিন
  if (!orderId) {
    redirect("/");
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;

  let orderData: any = null;
  let error: string | null = null;

  try {
    // ✅ অর্ডার ডাটা ফেচ করা (Guest বা Customer উভয়ের জন্য)
    // যদি লগইন করা থাকে তবে /orders/{id}, না থাকলে guest endpoint ব্যবহার করুন
    // আপাতত আমরা /api/orders/{id} প্রক্সি করেছি, সেটাই ব্যবহার করছি
    const res = await laravelFetch(`/orders/${orderId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    if (res.ok) {
      orderData = await res.json();
    } else {
      // যদি অর্ডার না পাওয়া যায়, তবে শুধু কনফার্মেশন মেসেজ দেখাবো
      error = "Could not load order details, but your order was placed successfully.";
    }
  } catch {
    error = "Network error while loading order details.";
  }

  return (
    <div className="container mx-auto px-4 py-16 min-h-[70vh] flex flex-col items-center justify-center text-center">
      
      {/* Success Icon */}
      <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6 animate-in zoom-in duration-500">
        <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
      </div>

      <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
        Order Placed Successfully!
      </h1>
      
      <p className="text-lg text-gray-600 dark:text-gray-300 max-w-xl mb-8">
        Thank you for your purchase. Your order has been confirmed and is being processed.
      </p>

      {/* Order Details Card */}
      {orderData?.data && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm max-w-md w-full mb-8">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100 dark:border-gray-800">
            <span className="text-sm text-gray-500">Order Number</span>
            <span className="font-bold text-gray-900 dark:text-white">
              #{orderData.data.order_number || orderId}
            </span>
          </div>
          
          <div className="space-y-2 text-left">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Status</span>
              <span className="font-medium text-orange-600 capitalize">
                {orderData.data.status || "Processing"}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Total Amount</span>
              <span className="font-bold text-gray-900 dark:text-white">
                ${(orderData.data.total_minor / 100).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm text-yellow-600 dark:text-yellow-400 mb-8 bg-yellow-50 dark:bg-yellow-900/20 px-4 py-2 rounded-lg">
          {error}
        </p>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
        <Link
          href="/"
          className="flex-1 flex items-center justify-center gap-2 bg-[#f76b1c] hover:bg-[#e05a12] text-white py-3.5 rounded-xl font-bold transition-all shadow-md cursor-pointer"
        >
          <ShoppingBag className="h-5 w-5" />
          Continue Shopping
        </Link>
        
        {token && (
          <Link
            href="/account?tab=orders"
            className="flex-1 flex items-center justify-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 py-3.5 rounded-xl font-bold transition-all cursor-pointer"
          >
            <Package className="h-5 w-5" />
            View My Orders
          </Link>
        )}
      </div>
    </div>
  );
}