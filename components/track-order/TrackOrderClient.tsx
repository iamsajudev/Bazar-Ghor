// components/track-order/TrackOrderClient.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ChevronRight,
  PackageSearch,
  Search,
  CheckCircle2,
  Clock,
  MapPin,
  Receipt,
  Loader2,
  XCircle,
  KeyRound,
  ShoppingBag,
} from "lucide-react";
import { buildApiUrl } from "@/lib/api-url";
import { formatPrice } from "@/utils/format";
import type {
  TrackOrderDetail,
  TrackOrderStatusHistoryItem,
} from "./types";

const GUEST_TOKEN_STORAGE_KEYS = [
  "guest_cart_token",
  "x_guest_cart_token",
  "guestCartToken",
];

const BEARER_TOKEN_STORAGE_KEYS = [
  "auth_token",
  "access_token",
  "token",
  "bearer_token",
];

function readStoredToken(keys: string[]): string {
  if (typeof window === "undefined") return "";
  for (const key of keys) {
    const localVal = window.localStorage.getItem(key)?.trim();
    if (localVal) return localVal;
    const sessionVal = window.sessionStorage.getItem(key)?.trim();
    if (sessionVal) return sessionVal;
  }
  return "";
}

function formatStatusLabel(status?: string | null): string {
  if (!status) return "Unknown";
  return status
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getStatusBadgeClasses(status?: string | null): string {
  const normalized = (status || "").toLowerCase();
  if (
    normalized.includes("delivered") ||
    normalized.includes("completed") ||
    normalized.includes("paid")
  ) {
    return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";
  }
  if (normalized.includes("cancel") || normalized.includes("fail")) {
    return "bg-red-100 text-red-800 dark:bg-red-950/70 dark:text-red-300 border-red-200 dark:border-red-800";
  }
  if (
    normalized.includes("ship") ||
    normalized.includes("process") ||
    normalized.includes("placed")
  ) {
    return "bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border-amber-200 dark:border-amber-800";
  }
  return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700";
}

export default function TrackOrderClient() {
  const [orderNumber, setOrderNumber] = useState("");
  const [guestToken, setGuestToken] = useState("");
  const [bearerToken, setBearerToken] = useState("");

  const [order, setOrder] = useState<TrackOrderDetail | null>(null);
  const [myOrders, setMyOrders] = useState<TrackOrderDetail[]>([]);
  const [myOrdersLoading, setMyOrdersLoading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const savedGuest = readStoredToken(GUEST_TOKEN_STORAGE_KEYS);
    const savedBearer = readStoredToken(BEARER_TOKEN_STORAGE_KEYS);
    if (savedGuest) setGuestToken(savedGuest);
    if (savedBearer) setBearerToken(savedBearer);
  }, []);

  // Load recent orders if user has Bearer token
  useEffect(() => {
    if (!bearerToken) return;
    const controller = new AbortController();
    let active = true;

    async function loadUserOrders() {
      setMyOrdersLoading(true);
      try {
        const res = await fetch(buildApiUrl("/api/v1/orders?page=1"), {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${bearerToken}`,
          },
          cache: "no-store",
          signal: controller.signal,
        });

        if (!res.ok) return;
        const json = await res.json();
        const list = Array.isArray(json?.data?.data)
          ? json.data.data
          : Array.isArray(json?.data)
            ? json.data
            : [];

        if (active && !controller.signal.aborted) {
          setMyOrders(list);
        }
      } catch {
        // Ignore silent background load error
      } finally {
        if (active && !controller.signal.aborted) {
          setMyOrdersLoading(false);
        }
      }
    }

    loadUserOrders();
    return () => {
      active = false;
      controller.abort();
    };
  }, [bearerToken]);

  const fetchGuestOrder = useCallback(
    async (targetOrderNumber: string, tokenToUse: string) => {
      const cleanNumber = targetOrderNumber.trim();
      if (!cleanNumber) {
        setError("Please enter an order number (e.g. ORD-2026-0001).");
        return;
      }

      setLoading(true);
      setError(null);
      setNotice(null);

      try {
        const headers: Record<string, string> = {
          Accept: "application/json",
        };
        if (tokenToUse.trim()) {
          headers["X-Guest-Cart-Token"] = tokenToUse.trim();
        }

        const res = await fetch(
          buildApiUrl(
            `/api/v1/guest/orders/${encodeURIComponent(cleanNumber)}`
          ),
          {
            method: "GET",
            headers,
            cache: "no-store",
          }
        );

        const json = await res.json().catch(() => null);

        if (!res.ok) {
          const apiMsg =
            json?.message ||
            (res.status === 404
              ? "Order not found or missing valid X-Guest-Cart-Token."
              : `Unable to fetch order (${res.status}).`);
          throw new Error(apiMsg);
        }

        const detail: TrackOrderDetail = json?.data ?? json;
        setOrder(detail);
      } catch (err) {
        setOrder(null);
        setError(
          err instanceof Error
            ? err.message
            : "Could not find order details."
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchAuthenticatedOrderDetail = useCallback(
    async (orderIdOrNumber: number | string) => {
      if (!bearerToken) return;
      setLoading(true);
      setError(null);
      setNotice(null);

      try {
        const res = await fetch(
          buildApiUrl(`/api/v1/orders/${encodeURIComponent(String(orderIdOrNumber))}`),
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${bearerToken}`,
            },
            cache: "no-store",
          }
        );

        const json = await res.json().catch(() => null);
        if (!res.ok) {
          throw new Error(json?.message || `Failed to load order (${res.status})`);
        }

        const detail: TrackOrderDetail = json?.data ?? json;
        setOrder(detail);
        setOrderNumber(detail.order_number || String(orderIdOrNumber));
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load order details."
        );
      } finally {
        setLoading(false);
      }
    },
    [bearerToken]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchGuestOrder(orderNumber, guestToken);
  };

  const handleCancelOrder = async () => {
    if (!order || !bearerToken) return;
    setCanceling(true);
    setError(null);
    setNotice(null);

    try {
      const res = await fetch(
        buildApiUrl(`/api/v1/orders/${encodeURIComponent(String(order.id))}/cancel`),
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${bearerToken}`,
          },
          cache: "no-store",
        }
      );

      const json = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(
          json?.message || `Unable to cancel order (${res.status}).`
        );
      }

      const updated: TrackOrderDetail = json?.data ?? {
        ...order,
        status: "canceled",
      };
      setOrder(updated);
      setMyOrders((prev) =>
        prev.map((item) =>
          String(item.id) === String(order.id)
            ? { ...item, status: updated.status }
            : item
        )
      );
      setNotice("Order has been canceled successfully.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to cancel this order."
      );
    } finally {
      setCanceling(false);
    }
  };

  const currency = order?.currency_code || "BDT";
  const historyList: TrackOrderStatusHistoryItem[] =
    order?.statusHistory || order?.status_history || [];
  const itemsList = order?.items || [];
  const addressesList = order?.addresses || [];
  const canCancelOrder =
    Boolean(bearerToken) &&
    order &&
    ["placed", "pending_payment"].includes((order.status || "").toLowerCase()) &&
    (order.payment_status || "").toLowerCase() !== "paid";

  return (
    <div className="min-h-screen bg-gray-50/60 dark:bg-gray-950">
      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-900 text-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -right-24 h-80 w-80 rounded-full bg-emerald-500/15 blur-3xl"
        />

        <div className="container mx-auto px-4 py-14 md:py-18 relative z-10">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center justify-center gap-2 text-xs md:text-sm text-emerald-200/80 mb-5"
          >
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <ChevronRight className="h-4 w-4 text-emerald-300/60" />
            <span className="font-semibold text-white">Track Order</span>
          </nav>

          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-4 py-1.5 text-xs font-semibold tracking-wider uppercase text-emerald-200 mb-4">
              <PackageSearch className="h-3.5 w-3.5 text-emerald-300" />
              <span>Real-Time Order Status</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-3">
              Track Your Order
            </h1>

            <p className="text-sm sm:text-base text-slate-200/90 leading-relaxed max-w-2xl mx-auto">
              Enter your order number to check live fulfillment status, items,
              shipping address, and status history.
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-10 md:py-14 max-w-5xl space-y-10">
        {/* Lookup Form Card */}
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 md:p-8 shadow-xs space-y-5"
        >
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-5">
              <label
                htmlFor="track-order-number"
                className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5"
              >
                Order Number *
              </label>
              <div className="relative">
                <Search className="h-4 w-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="track-order-number"
                  type="text"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder="e.g. ORD-2026-0001"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="md:col-span-4">
              <label
                htmlFor="track-guest-token"
                className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5"
              >
                Guest Cart Token (X-Guest-Cart-Token)
              </label>
              <div className="relative">
                <KeyRound className="h-4 w-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="track-guest-token"
                  type="text"
                  value={guestToken}
                  onChange={(e) => setGuestToken(e.target.value)}
                  placeholder="Auto-filled if available"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="md:col-span-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-bold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Tracking...</span>
                  </>
                ) : (
                  <>
                    <PackageSearch className="h-4 w-4" />
                    <span>Track Order</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400">
            Guest orders use{" "}
            <code className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
              /api/v1/guest/orders/{"{orderNumber}"}
            </code>{" "}
            with your original{" "}
            <code className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
              X-Guest-Cart-Token
            </code>
            .
          </p>
        </form>

        {/* Error / Notice Banners */}
        {error && (
          <div
            role="alert"
            className="rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 p-4 text-sm text-red-700 dark:text-red-300 flex items-center gap-2.5"
          >
            <XCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {notice && (
          <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-4 text-sm text-emerald-700 dark:text-emerald-300 flex items-center gap-2.5">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            <span>{notice}</span>
          </div>
        )}

        {/* Order Result Breakdown */}
        {order && (
          <section className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 md:p-8 shadow-xs space-y-8">
            <div className="flex flex-wrap items-start justify-between gap-4 pb-6 border-b border-gray-100 dark:border-gray-800">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                  Order Details
                </span>
                <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mt-0.5">
                  #{order.order_number}
                </h2>
                {order.created_at && (
                  <p className="text-xs text-gray-500 mt-1">
                    Placed on: {order.created_at}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadgeClasses(
                    order.status
                  )}`}
                >
                  Status: {formatStatusLabel(order.status)}
                </span>

                {order.payment_status && (
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadgeClasses(
                      order.payment_status
                    )}`}
                  >
                    Payment: {formatStatusLabel(order.payment_status)}
                  </span>
                )}

                {canCancelOrder && (
                  <button
                    type="button"
                    disabled={canceling}
                    onClick={handleCancelOrder}
                    className="px-3.5 py-1 rounded-full text-xs font-bold bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white transition-colors cursor-pointer"
                  >
                    {canceling ? "Canceling..." : "Cancel Order"}
                  </button>
                )}
              </div>
            </div>

            {/* Summary & Address */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-2xl bg-gray-50 dark:bg-gray-800/60 p-5 space-y-2.5 text-sm">
                <div className="flex items-center gap-2 font-bold text-gray-900 dark:text-white mb-2">
                  <Receipt className="h-4 w-4 text-emerald-600" />
                  <span>Payment Summary</span>
                </div>

                {typeof order.subtotal_minor === "number" && (
                  <div className="flex justify-between text-gray-600 dark:text-gray-300">
                    <span>Subtotal</span>
                    <span>{formatPrice(order.subtotal_minor, currency)}</span>
                  </div>
                )}
                {typeof order.discount_minor === "number" &&
                  order.discount_minor > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Discount</span>
                      <span>
                        -{formatPrice(order.discount_minor, currency)}
                      </span>
                    </div>
                  )}
                {typeof order.shipping_minor === "number" && (
                  <div className="flex justify-between text-gray-600 dark:text-gray-300">
                    <span>Shipping</span>
                    <span>{formatPrice(order.shipping_minor, currency)}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-gray-200 dark:border-gray-700 flex justify-between font-extrabold text-base text-gray-900 dark:text-white">
                  <span>Total</span>
                  <span className="text-emerald-600 dark:text-emerald-400">
                    {formatPrice(order.total_minor ?? 0, currency)}
                  </span>
                </div>
              </div>

              <div className="rounded-2xl bg-gray-50 dark:bg-gray-800/60 p-5 space-y-2 text-sm">
                <div className="flex items-center gap-2 font-bold text-gray-900 dark:text-white mb-2">
                  <MapPin className="h-4 w-4 text-emerald-600" />
                  <span>Delivery Address</span>
                </div>

                {addressesList.length > 0 ? (
                  addressesList.map((addr, idx) => (
                    <div
                      key={addr.id ?? idx}
                      className="text-gray-600 dark:text-gray-300 space-y-0.5"
                    >
                      {addr.recipient_name && (
                        <p className="font-semibold text-gray-800 dark:text-gray-100">
                          {addr.recipient_name}
                        </p>
                      )}
                      {addr.line1 && <p>{addr.line1}</p>}
                      {addr.line2 && <p>{addr.line2}</p>}
                      <p>
                        {[addr.area, addr.city, addr.region, addr.postal_code]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                      {addr.phone && (
                        <p className="text-xs text-gray-500">
                          Phone: {addr.phone}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-500">
                    Address details are not attached to this summary.
                  </p>
                )}
              </div>
            </div>

            {/* Items */}
            {itemsList.length > 0 && (
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4 text-emerald-600" />
                  <span>Order Items ({itemsList.length})</span>
                </h3>
                <div className="divide-y divide-gray-100 dark:divide-gray-800 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden">
                  {itemsList.map((item, idx) => {
                    const title =
                      item.name || item.product_name || `Item #${idx + 1}`;
                    const lineMinor =
                      item.total_minor ??
                      item.line_total_minor ??
                      (item.unit_price_minor ?? item.price_minor ?? 0) *
                        item.quantity;

                    return (
                      <div
                        key={item.id ?? item.order_item_id ?? idx}
                        className="p-4 flex items-center justify-between gap-4 text-sm bg-white dark:bg-gray-900"
                      >
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {title}
                          </p>
                          <p className="text-xs text-gray-500">
                            Qty: {item.quantity}
                            {item.variant_name
                              ? ` • ${item.variant_name}`
                              : ""}
                          </p>
                        </div>
                        <span className="font-bold text-gray-900 dark:text-white shrink-0">
                          {formatPrice(lineMinor, item.currency_code || currency)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Status History */}
            {historyList.length > 0 && (
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-emerald-600" />
                  <span>Status History</span>
                </h3>
                <div className="space-y-3">
                  {historyList.map((entry, idx) => (
                    <div
                      key={entry.id ?? idx}
                      className="flex items-start justify-between gap-4 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 text-sm"
                    >
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">
                          {formatStatusLabel(entry.status)}
                        </p>
                        {(entry.note || entry.comment) && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                            {entry.note || entry.comment}
                          </p>
                        )}
                      </div>
                      {(entry.created_at || entry.timestamp) && (
                        <span className="text-xs text-gray-400 shrink-0">
                          {entry.created_at || entry.timestamp}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* Recent Account Orders (when signed in) */}
        {bearerToken && (
          <section className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 md:p-8 shadow-xs">
            <h2 className="text-xl font-extrabold text-gray-900 dark:text-white mb-4">
              Your Recent Orders
            </h2>

            {myOrdersLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
              </div>
            ) : myOrders.length > 0 ? (
              <div className="space-y-3">
                {myOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 text-sm"
                  >
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">
                        #{ord.order_number}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatStatusLabel(ord.status)} •{" "}
                        {formatPrice(
                          ord.total_minor ?? 0,
                          ord.currency_code || "BDT"
                        )}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => fetchAuthenticatedOrderDetail(ord.id)}
                      className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-bold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors cursor-pointer"
                    >
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                No orders found on your account yet.
              </p>
            )}
          </section>
        )}
      </div>
    </div>
  );
}