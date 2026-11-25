"use client";

import React from "react";
import { Package, Loader2, RefreshCw } from "lucide-react";
import { useOrders } from "@/hook/useOrders";
import OrderCard from "./OrderCard";

export default function OrdersList() {
    const { orders, loading, error, refetch } = useOrders(true);

    return (
        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    Order History
                </h2>
                <button
                    type="button"
                    onClick={() => void refetch()}
                    disabled={loading}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 dark:text-gray-300 hover:text-[#f76b1c] disabled:opacity-50 cursor-pointer"
                >
                    <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
                    Refresh
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-[#f76b1c]" />
                </div>
            ) : error ? (
                <p className="text-sm text-red-500 text-center py-12">{error}</p>
            ) : orders.length === 0 ? (
                <div className="text-center py-12">
                    <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500 font-medium">
                        You haven&apos;t placed any orders yet.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <OrderCard key={order.id} order={order} />
                    ))}
                </div>
            )}
        </div>
    );
}