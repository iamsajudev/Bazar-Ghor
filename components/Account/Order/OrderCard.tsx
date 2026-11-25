"use client";

import React from "react";
import Link from "next/link";
import { Calendar, ArrowUpRight } from "lucide-react";
import { formatPrice } from "@/utils/format";

export interface OrderItemSummary {
    name?: string;
    product_name?: string;
    quantity?: number;
}

export interface CustomerOrder {
    id: number | string;
    order_number?: string;
    status?: string;
    total_minor?: number;
    currency_code?: string;
    created_at?: string;
    user_id?: number | string;
    customer_id?: number | string;
    email?: string;
    guest_email?: string;
    customer_email?: string;
    items?: OrderItemSummary[];
}

interface OrderCardProps {
    order: CustomerOrder;
}

export default function OrderCard({ order }: OrderCardProps) {
    const orderNo = order.order_number ?? `ORD-${order.id}`;
    const date = order.created_at?.slice(0, 10) ?? "";
    const status = order.status ?? "pending";
    const itemNames = (Array.isArray(order.items) ? order.items : [])
        .map((it) => it.name ?? it.product_name ?? "")
        .filter(Boolean);
    const isDelivered = status.toLowerCase() === "delivered";

    return (
        <div className="border border-gray-100 dark:border-gray-800 rounded-2xl p-5 hover:border-[#f76b1c]/30 transition-all bg-gray-50/30 dark:bg-gray-800/20">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div>
                    <span className="text-sm font-extrabold text-gray-900 dark:text-white">
                        {orderNo}
                    </span>
                    {date && (
                        <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                            <Calendar className="h-3 w-3" /> {date}
                        </p>
                    )}
                </div>
                <span
                    className={`text-xs font-bold px-3 py-1 rounded-full capitalize ${isDelivered
                            ? "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400"
                            : "bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400"
                        }`}
                >
                    {status.replace(/_/g, " ")}
                </span>
            </div>

            {itemNames.length > 0 && (
                <p className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-4 bg-white dark:bg-gray-900 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
                    📦 {itemNames.join(", ")}
                </p>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800/60">
                <div>
                    <span className="text-xs text-gray-400 mr-2">Total Amount:</span>
                    <span className="text-base font-black text-[#f76b1c]">
                        {order.total_minor != null
                            ? formatPrice(order.total_minor, order.currency_code)
                            : "—"}
                    </span>
                </div>
                <Link
                    href={`/account/orders/${encodeURIComponent(String(order.id))}`}
                    className="text-xs font-bold text-[#f76b1c] hover:underline flex items-center gap-1 cursor-pointer"
                >
                    View Details <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
            </div>
        </div>
    );
}