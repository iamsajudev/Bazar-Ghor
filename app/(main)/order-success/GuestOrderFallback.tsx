"use client";

import { useEffect, useState } from "react";

export interface OrderDetailsData {
  order_number?: string;
  status?: string;
  total_minor?: number;
  subtotal_minor?: number;
  shipping_minor?: number;
  currency_code?: string;
  recipient_name?: string;
  guest_email?: string;
}

function formatMoney(minor: number | undefined, currency?: string): string {
  const amount = ((Number(minor) || 0) / 100).toFixed(2);
  return currency === "USD" ? `$${amount}` : `৳${amount}`;
}

export default function GuestOrderFallback({
  orderId,
  initialOrder = null,
}: {
  orderId: string;
  initialOrder?: OrderDetailsData | null;
}) {
  const [sessionOrder, setSessionOrder] = useState<OrderDetailsData | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(`order_summary_${orderId}`);
      if (raw) {
        setSessionOrder(JSON.parse(raw) as OrderDetailsData);
      }
    } catch {
      // Ignore storage access or parse failures
    } finally {
      setChecked(true);
    }
  }, [orderId]);

  if (!checked && !initialOrder) return null;

  const order: OrderDetailsData = {
    ...sessionOrder,
    ...initialOrder,
    recipient_name: initialOrder?.recipient_name || sessionOrder?.recipient_name,
  };

  return (
    <div className="max-w-md w-full mb-8">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100 dark:border-gray-800">
          <span className="text-sm text-gray-500">Order Number</span>
          <span className="font-bold text-gray-900 dark:text-white">
            #{order.order_number || orderId}
          </span>
        </div>

        <div className="space-y-2 text-left">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Status</span>
            <span className="font-medium text-orange-600 capitalize">
              {order.status || "Confirmed"}
            </span>
          </div>

          {order.recipient_name && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Recipient</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {order.recipient_name}
              </span>
            </div>
          )}

          {typeof order.total_minor === "number" && order.total_minor > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Total Payable (COD)</span>
              <span className="font-bold text-gray-900 dark:text-white">
                {formatMoney(order.total_minor, order.currency_code)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}