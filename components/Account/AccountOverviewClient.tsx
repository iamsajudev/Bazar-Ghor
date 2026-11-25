"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { User, Package, Heart, ShoppingBag, Mail, Phone, ShieldCheck } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useCartStore } from "@/store/useCartStore";

interface OrdersSummaryResponse {
    data?: unknown[] | { data?: unknown[] };
    orders?: unknown[];
    meta?: { total?: number };
}

function getOrdersTotal(payload: OrdersSummaryResponse | null | undefined): number {
    if (!payload) return 0;
    if (typeof payload.meta?.total === "number") return payload.meta.total;
    if (Array.isArray(payload.data)) return payload.data.length;
    if (payload.data && !Array.isArray(payload.data) && Array.isArray(payload.data.data)) {
        return payload.data.data.length;
    }
    if (Array.isArray(payload.orders)) return payload.orders.length;
    return 0;
}

export default function AccountOverviewClient() {
    const { user, isAuthenticated, isHydrated } = useAuthStore();
    const { items: wishlistItems } = useWishlistStore();
    const { items: cartItems } = useCartStore();
    const [ordersTotal, setOrdersTotal] = useState(0);

    useEffect(() => {
        if (!isHydrated || !isAuthenticated) return;
        const controller = new AbortController();

        fetch("/api/orders", { signal: controller.signal, cache: "no-store" })
            .then(async (res) => {
                if (!res.ok) return;
                const body = (await res.json()) as OrdersSummaryResponse;
                setOrdersTotal(getOrdersTotal(body));
            })
            .catch(() => {
                // Keep overview stats safe on error
            });

        return () => controller.abort();
    }, [isHydrated, isAuthenticated]);

    if (!user) return null;

    const isVerified = Boolean(user.email_verified_at);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Link
                    href="/account/orders"
                    className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-5 shadow-xs hover:border-[#f76b1c]/40 transition-all"
                >
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-3 bg-orange-50 dark:bg-orange-950/30 text-[#f76b1c] rounded-2xl">
                            <Package className="h-5 w-5" />
                        </div>
                        <span className="text-xs font-bold text-gray-400 uppercase">Orders</span>
                    </div>
                    <p className="text-2xl font-black text-gray-900 dark:text-white">{ordersTotal}</p>
                    <p className="text-xs text-gray-500 mt-1">Total placed orders</p>
                </Link>

                <Link
                    href="/wishlist"
                    className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-5 shadow-xs hover:border-[#f76b1c]/40 transition-all"
                >
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-3 bg-red-50 dark:bg-red-950/30 text-red-500 rounded-2xl">
                            <Heart className="h-5 w-5" />
                        </div>
                        <span className="text-xs font-bold text-gray-400 uppercase">Wishlist</span>
                    </div>
                    <p className="text-2xl font-black text-gray-900 dark:text-white">
                        {wishlistItems.length}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Saved favorites</p>
                </Link>

                <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-5 shadow-xs">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-3 bg-green-50 dark:bg-green-950/30 text-green-600 rounded-2xl">
                            <ShoppingBag className="h-5 w-5" />
                        </div>
                        <span className="text-xs font-bold text-gray-400 uppercase">Cart</span>
                    </div>
                    <p className="text-2xl font-black text-gray-900 dark:text-white">{cartItems.length}</p>
                    <p className="text-xs text-gray-500 mt-1">Items in cart</p>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 shadow-xs">
                <div className="flex items-center justify-between mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                        Personal Information
                    </h2>
                    <Link
                        href="/account/settings"
                        className="text-xs font-bold text-[#f76b1c] hover:underline"
                    >
                        Edit Details
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-gray-50/50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
                        <User className="h-5 w-5 text-[#f76b1c] mt-0.5" />
                        <div>
                            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-0.5">
                                Full Name
                            </span>
                            <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
                                {user.name}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-gray-50/50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
                        <Mail className="h-5 w-5 text-[#f76b1c] mt-0.5" />
                        <div>
                            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-0.5">
                                Email Address
                            </span>
                            <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
                                {user.email}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-gray-50/50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
                        <Phone className="h-5 w-5 text-[#f76b1c] mt-0.5" />
                        <div>
                            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-0.5">
                                Phone Number
                            </span>
                            <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
                                {user.phone || "Not provided"}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-gray-50/50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
                        <ShieldCheck className="h-5 w-5 text-green-600 mt-0.5" />
                        <div>
                            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-0.5">
                                Email Status
                            </span>
                            <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
                                {isVerified ? "Verified" : "Not verified"}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}