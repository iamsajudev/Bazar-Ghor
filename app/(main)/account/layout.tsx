"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    User,
    Package,
    Heart,
    LogOut,
    Settings,
    ChevronRight,
    Phone,
    ShoppingBag,
    CheckCircle2,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useCartStore } from "@/store/useCartStore";

interface OrdersCountResponse {
    data?: unknown[] | { data?: unknown[] };
    orders?: unknown[];
    meta?: { total?: number };
}

function getOrdersCount(payload: OrdersCountResponse | null | undefined): number {
    if (!payload) return 0;
    if (typeof payload.meta?.total === "number") return payload.meta.total;
    if (Array.isArray(payload.data)) return payload.data.length;
    if (payload.data && !Array.isArray(payload.data) && Array.isArray(payload.data.data)) {
        return payload.data.data.length;
    }
    if (Array.isArray(payload.orders)) return payload.orders.length;
    return 0;
}

function AccountLayoutFallback() {
    return (
        <div className="min-h-[70vh] flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#f76b1c]" />
        </div>
    );
}

function AccountShell({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const { user, isAuthenticated, logout, isHydrated } = useAuthStore();
    const { items: wishlistItems } = useWishlistStore();
    const { items: cartItems, toggleCart } = useCartStore();
    const [ordersCount, setOrdersCount] = useState(0);

    useEffect(() => {
        if (isHydrated && !isAuthenticated) {
            router.push("/login?redirect=/account");
        }
    }, [isHydrated, isAuthenticated, router]);

    useEffect(() => {
        if (!isHydrated || !isAuthenticated) return;
        const controller = new AbortController();

        fetch("/api/orders", { signal: controller.signal, cache: "no-store" })
            .then(async (res) => {
                if (!res.ok) return;
                const body = (await res.json()) as OrdersCountResponse;
                setOrdersCount(getOrdersCount(body));
            })
            .catch(() => {
                // Keep sidebar badge safe on error
            });

        return () => controller.abort();
    }, [isHydrated, isAuthenticated]);

    if (!isHydrated || !isAuthenticated || !user) {
        return <AccountLayoutFallback />;
    }

    const handleLogout = async () => {
        await logout();
        router.push("/");
        router.refresh();
    };

    const isVerified = Boolean(user.email_verified_at);
    const isOverview = pathname === "/account";
    const isOrders = pathname.startsWith("/account/orders");
    const isSettings = pathname.startsWith("/account/settings");

    return (
        <div className="container mx-auto px-4 py-10">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                <Link href="/" className="hover:text-[#f76b1c] transition-colors">
                    Home
                </Link>
                <ChevronRight className="h-4 w-4" />
                <Link href="/account" className="hover:text-[#f76b1c] transition-colors font-medium">
                    My Account
                </Link>
                {isOrders && (
                    <>
                        <ChevronRight className="h-4 w-4" />
                        <span className="text-gray-800 dark:text-gray-200 font-medium">My Orders</span>
                    </>
                )}
                {isSettings && (
                    <>
                        <ChevronRight className="h-4 w-4" />
                        <span className="text-gray-800 dark:text-gray-200 font-medium">Settings</span>
                    </>
                )}
            </nav>

            {/* Profile Header Banner */}
            <div className="relative overflow-hidden bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-3xl p-6 md:p-8 shadow-xl mb-8 border border-gray-800 text-white">
                <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-[#f76b1c]/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row items-center md:items-center justify-between gap-6">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-5 text-center md:text-left">
                        <div className="relative">
                            <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-[#f76b1c] to-orange-600 rounded-2xl flex items-center justify-center shadow-lg border-2 border-white/20 shrink-0">
                                <User className="h-10 w-10 md:h-12 md:w-12 text-white" />
                            </div>
                            <span
                                className="absolute -bottom-1 -right-1 bg-green-500 w-5 h-5 rounded-full border-4 border-gray-900 flex items-center justify-center"
                                title="Active User"
                            />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-extrabold mb-1 tracking-tight">
                                {user.name}
                            </h1>
                            <p className="text-gray-400 text-sm mb-3">{user.email}</p>
                            <div className="flex flex-wrap justify-center md:justify-start gap-2">
                                <span className="bg-white/10 backdrop-blur-md text-emerald-400 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1 border border-white/5">
                                    <CheckCircle2 className="h-3 w-3" />{" "}
                                    {isVerified ? "Verified Customer" : "Email Not Verified"}
                                </span>
                                <span className="bg-white/10 backdrop-blur-md text-gray-300 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1 border border-white/5">
                                    <Phone className="h-3 w-3" /> {user.phone || "Not provided"}
                                </span>
                            </div>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleLogout}
                        className="bg-white/10 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30 backdrop-blur-md text-gray-200 border border-white/10 px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all cursor-pointer"
                    >
                        <LogOut className="h-4 w-4" /> Logout
                    </button>
                </div>
            </div>

            {/* Sidebar + Page Content */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <aside className="lg:col-span-4 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-4 shadow-xs">
                    <nav className="space-y-1.5">
                        <Link
                            href="/account"
                            className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all ${isOverview
                                    ? "bg-orange-50 dark:bg-orange-950/20 text-[#f76b1c]"
                                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <User className="h-4 w-4" /> Profile Overview
                            </div>
                            <ChevronRight className="h-4 w-4 opacity-60" />
                        </Link>

                        <Link
                            href="/account/orders"
                            className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all ${isOrders
                                    ? "bg-orange-50 dark:bg-orange-950/20 text-[#f76b1c]"
                                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <Package className="h-4 w-4" /> My Orders
                            </div>
                            <span className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs px-2 py-0.5 rounded-full font-bold">
                                {ordersCount}
                            </span>
                        </Link>

                        <Link
                            href="/wishlist"
                            className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all"
                        >
                            <div className="flex items-center gap-3">
                                <Heart className="h-4 w-4" /> Wishlist
                            </div>
                            <span className="bg-red-50 dark:bg-red-950/30 text-red-500 text-xs px-2 py-0.5 rounded-full font-bold">
                                {wishlistItems.length}
                            </span>
                        </Link>

                        <button
                            type="button"
                            onClick={() => toggleCart()}
                            className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all cursor-pointer"
                        >
                            <div className="flex items-center gap-3">
                                <ShoppingBag className="h-4 w-4" /> Cart Items
                            </div>
                            <span className="bg-orange-50 dark:bg-orange-950/30 text-[#f76b1c] text-xs px-2 py-0.5 rounded-full font-bold">
                                {cartItems.length}
                            </span>
                        </button>

                        <Link
                            href="/account/settings"
                            className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all ${isSettings
                                    ? "bg-orange-50 dark:bg-orange-950/20 text-[#f76b1c]"
                                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <Settings className="h-4 w-4" /> Account Settings
                            </div>
                            <ChevronRight className="h-4 w-4 opacity-60" />
                        </Link>
                    </nav>
                </aside>

                <main className="lg:col-span-8">{children}</main>
            </div>
        </div>
    );
}

export default function AccountLayout({ children }: { children: React.ReactNode }) {
    return (
        <Suspense fallback={<AccountLayoutFallback />}>
            <AccountShell>{children}</AccountShell>
        </Suspense>
    );
}