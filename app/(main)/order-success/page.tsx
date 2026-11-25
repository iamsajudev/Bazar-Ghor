import { Suspense } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { laravelFetch, AUTH_COOKIE } from "@/lib/server/api";
import { CheckCircle2, ShoppingBag, Package } from "lucide-react";
import GuestOrderFallback, { OrderDetailsData } from "./GuestOrderFallback";

interface OrderSuccessProps {
  searchParams: Promise<{ id?: string }>;
}

interface OrderApiResponse {
  data?: OrderDetailsData | null;
}

async function fetchOrderRecord(
  orderId: string,
  token?: string
): Promise<OrderDetailsData | null> {
  const encodedId = encodeURIComponent(orderId);

  if (token) {
    try {
      const authRes = await laravelFetch(`/orders/${encodedId}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });

      if (authRes.ok) {
        const json = (await authRes.json()) as OrderApiResponse & OrderDetailsData;
        return json?.data ?? json;
      }
    } catch {
      // Fallback to guest order endpoint below
    }
  }

  try {
    const guestRes = await laravelFetch(`/guest/orders/${encodedId}`, {
      cache: "no-store",
    });

    if (guestRes.ok) {
      const json = (await guestRes.json()) as OrderApiResponse & OrderDetailsData;
      return json?.data ?? json;
    }
  } catch {
    // Client-side sessionStorage fallback handles display
  }

  return null;
}

async function OrderSuccessContent({ searchParams }: OrderSuccessProps) {
  const params = await searchParams;
  const orderId = params.id?.trim();

  if (!orderId) {
    redirect("/");
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;
  const orderDetails = await fetchOrderRecord(orderId, token);

  return (
    <div className="container mx-auto px-4 py-16 min-h-[70vh] flex flex-col items-center justify-center text-center">
      <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6 animate-in zoom-in duration-500">
        <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
      </div>

      <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
        Order Placed Successfully!
      </h1>

      <p className="text-lg text-gray-600 dark:text-gray-300 max-w-xl mb-8">
        Thank you for your purchase. Your order has been confirmed and is being processed.
      </p>

      <GuestOrderFallback orderId={orderId} initialOrder={orderDetails} />

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
            href="/account/orders"
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

export default function OrderSuccessPage(props: OrderSuccessProps) {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-20 text-center min-h-[70vh] flex items-center justify-center">
          <p className="text-gray-500 animate-pulse">Loading order confirmation...</p>
        </div>
      }
    >
      <OrderSuccessContent {...props} />
    </Suspense>
  );
}