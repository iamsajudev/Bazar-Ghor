"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    User, Package, Heart, MapPin, LogOut, Settings, ChevronRight,
    Mail, Phone, Calendar, ShoppingBag, CheckCircle2, ShieldCheck, ArrowUpRight
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useCartStore } from "@/store/useCartStore";

export default function AccountPage() {
    const router = useRouter();
    const { user, isAuthenticated, logout, isHydrated } = useAuthStore();
    const { items: wishlistItems } = useWishlistStore();
    const { items: cartItems, toggleCart } = useCartStore();
    const [activeTab, setActiveTab] = useState("profile");

    // ✅ প্রোটেক্টেড রুট: লগইন না করলে /login-এ রিডাইরেক্ট
    useEffect(() => {
        if (isHydrated && !isAuthenticated) {
            router.push("/login");
        }
    }, [isHydrated, isAuthenticated, router]);

    if (!isHydrated || !isAuthenticated || !user) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#f76b1c]"></div>
            </div>
        );
    }

    const handleLogout = () => {
        logout();
        router.push("/");
    };

    // ডেমো অর্ডার ডেটা (টাকার সাইন ৳ যুক্ত করা হয়েছে)
    const mockOrders = [
        {
            id: "ORD-2026-001",
            date: "2026-10-15",
            total: 2499,
            status: "Delivered",
            items: ["Sundarban Honey 1kg"],
        },
        {
            id: "ORD-2026-002",
            date: "2026-10-20",
            total: 4550,
            status: "In Transit",
            items: ["Gawa Ghee 1kg", "Premium Almonds 500g"],
        },
    ];

    return (
        <div className="container mx-auto px-4 py-10 ">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                <Link href="/" className="hover:text-[#f76b1c] transition-colors">Home</Link>
                <ChevronRight className="h-4 w-4" />
                <span className="text-gray-800 dark:text-gray-200 font-medium">My Account</span>
            </nav>

            {/* Profile Header Banner */}
            <div className="relative overflow-hidden bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-3xl p-6 md:p-8 shadow-xl mb-8 border border-gray-800 text-white">
                <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-[#f76b1c]/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="relative z-10 flex flex-col md:flex-row items-center md:items-center justify-between gap-6">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-5 text-center md:text-left">
                        <div className="relative">
                            <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-[#f76b1c] to-orange-600 rounded-2xl flex items-center justify-center shadow-lg border-2 border-white/20 shrink-0">
                                <User className="h-10 w-10 md:h-12 md:w-12 text-white" />
                            </div>
                            <span className="absolute -bottom-1 -right-1 bg-green-500 w-5 h-5 rounded-full border-4 border-gray-900 flex items-center justify-center" title="Active User"></span>
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-extrabold mb-1 tracking-tight">
                                {user.name}
                            </h1>
                            <p className="text-gray-400 text-sm mb-3">{user.email}</p>
                            <div className="flex flex-wrap justify-center md:justify-start gap-2">
                                <span className="bg-white/10 backdrop-blur-md text-emerald-400 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1 border border-white/5">
                                    <CheckCircle2 className="h-3 w-3" /> {user.role === "admin" ? "Admin" : "Verified Customer"}
                                </span>
                                <span className="bg-white/10 backdrop-blur-md text-gray-300 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1 border border-white/5">
                                    <Phone className="h-3 w-3" /> {user.phone || "+880 17XXXXXXXX"}
                                </span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="bg-white/10 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30 backdrop-blur-md text-gray-200 border border-white/10 px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all cursor-pointer"
                    >
                        <LogOut className="h-4 w-4" /> Logout
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Sidebar (4 Cols) */}
                <aside className="lg:col-span-4 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-4 shadow-xs">
                    <nav className="space-y-1.5">
                        <button
                            onClick={() => setActiveTab("profile")}
                            className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all cursor-pointer ${activeTab === "profile"
                                    ? "bg-orange-50 dark:bg-orange-950/20 text-[#f76b1c]"
                                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <User className="h-4 w-4" /> Profile Overview
                            </div>
                            <ChevronRight className="h-4 w-4 opacity-60" />
                        </button>

                        <button
                            onClick={() => setActiveTab("orders")}
                            className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all cursor-pointer ${activeTab === "orders"
                                    ? "bg-orange-50 dark:bg-orange-950/20 text-[#f76b1c]"
                                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <Package className="h-4 w-4" /> My Orders
                            </div>
                            <span className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs px-2 py-0.5 rounded-full font-bold">
                                {mockOrders.length}
                            </span>
                        </button>

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
                            onClick={() => toggleCart()}
                            className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all"
                        >
                            <div className="flex items-center gap-3">
                                <ShoppingBag className="h-4 w-4" /> Cart Items
                            </div>
                            <span className="bg-orange-50 dark:bg-orange-950/30 text-[#f76b1c] text-xs px-2 py-0.5 rounded-full font-bold">
                                {cartItems.length}
                            </span>
                        </button>

                        <button
                            onClick={() => setActiveTab("settings")}
                            className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all cursor-pointer ${activeTab === "settings"
                                    ? "bg-orange-50 dark:bg-orange-950/20 text-[#f76b1c]"
                                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <Settings className="h-4 w-4" /> Account Settings
                            </div>
                            <ChevronRight className="h-4 w-4 opacity-60" />
                        </button>
                    </nav>
                </aside>

                {/* Main Content (8 Cols) */}
                <main className="lg:col-span-8">
                    {/* Profile Tab */}
                    {activeTab === "profile" && (
                        <div className="space-y-6">
                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-5 shadow-xs">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="p-3 bg-orange-50 dark:bg-orange-950/30 text-[#f76b1c] rounded-2xl">
                                            <Package className="h-5 w-5" />
                                        </div>
                                        <span className="text-xs font-bold text-gray-400 uppercase">Orders</span>
                                    </div>
                                    <p className="text-2xl font-black text-gray-900 dark:text-white">{mockOrders.length}</p>
                                    <p className="text-xs text-gray-500 mt-1">Total placed orders</p>
                                </div>

                                <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-5 shadow-xs">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="p-3 bg-red-50 dark:bg-red-950/30 text-red-500 rounded-2xl">
                                            <Heart className="h-5 w-5" />
                                        </div>
                                        <span className="text-xs font-bold text-gray-400 uppercase">Wishlist</span>
                                    </div>
                                    <p className="text-2xl font-black text-gray-900 dark:text-white">{wishlistItems.length}</p>
                                    <p className="text-xs text-gray-500 mt-1">Saved favorites</p>
                                </div>

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

                            {/* Detailed Info Card */}
                            <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 shadow-xs">
                                <div className="flex items-center justify-between mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
                                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Personal Information</h2>
                                    <button
                                        onClick={() => setActiveTab("settings")}
                                        className="text-xs font-bold text-[#f76b1c] hover:underline"
                                    >
                                        Edit Details
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-gray-50/50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
                                        <User className="h-5 w-5 text-[#f76b1c] mt-0.5" />
                                        <div>
                                            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-0.5">Full Name</span>
                                            <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{user.name}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-gray-50/50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
                                        <Mail className="h-5 w-5 text-[#f76b1c] mt-0.5" />
                                        <div>
                                            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-0.5">Email Address</span>
                                            <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{user.email}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-gray-50/50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
                                        <Phone className="h-5 w-5 text-[#f76b1c] mt-0.5" />
                                        <div>
                                            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-0.5">Phone Number</span>
                                            <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{user.phone || "Not provided"}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-gray-50/50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
                                        <ShieldCheck className="h-5 w-5 text-green-600 mt-0.5" />
                                        <div>
                                            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-0.5">Account Privilege</span>
                                            <span className="text-sm font-bold text-gray-800 dark:text-gray-200 capitalize">{user.role || "Customer"}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Orders Tab */}
                    {activeTab === "orders" && (
                        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 shadow-xs">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
                                Order History
                            </h2>
                            {mockOrders.length === 0 ? (
                                <div className="text-center py-12">
                                    <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-sm text-gray-500 font-medium">You haven&apos;t placed any orders yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {mockOrders.map((order) => (
                                        <div key={order.id} className="border border-gray-100 dark:border-gray-800 rounded-2xl p-5 hover:border-[#f76b1c]/30 transition-all bg-gray-50/30 dark:bg-gray-800/20">
                                            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                                                <div>
                                                    <span className="text-sm font-extrabold text-gray-900 dark:text-white">{order.id}</span>
                                                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                                                        <Calendar className="h-3 w-3" /> {order.date}
                                                    </p>
                                                </div>
                                                <span className={`text-xs font-bold px-3 py-1 rounded-full ${order.status === "Delivered"
                                                        ? "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400"
                                                        : "bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400"
                                                    }`}>
                                                    {order.status}
                                                </span>
                                            </div>

                                            <p className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-4 bg-white dark:bg-gray-900 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
                                                📦 {order.items.join(", ")}
                                            </p>

                                            <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800/60">
                                                <div>
                                                    <span className="text-xs text-gray-400 mr-2">Total Amount:</span>
                                                    <span className="text-base font-black text-[#f76b1c]">৳{order.total}</span>
                                                </div>
                                                <button className="text-xs font-bold text-[#f76b1c] hover:underline flex items-center gap-1 cursor-pointer">
                                                    View Details <ArrowUpRight className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Settings Tab */}
                    {activeTab === "settings" && (
                        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 shadow-xs">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
                                Account Settings
                            </h2>
                            <div className="space-y-3">
                                <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                                    <div className="text-left">
                                        <span className="text-sm font-bold text-gray-800 dark:text-gray-200 block">Change Password</span>
                                        <span className="text-xs text-gray-400">Update your account password securely</span>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-gray-400" />
                                </button>

                                <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                                    <div className="text-left">
                                        <span className="text-sm font-bold text-gray-800 dark:text-gray-200 block">Manage Addresses</span>
                                        <span className="text-xs text-gray-400">Add or edit your shipping addresses</span>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-gray-400" />
                                </button>

                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 font-bold text-sm hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors cursor-pointer mt-4"
                                >
                                    <LogOut className="h-4 w-4" /> Sign Out of All Sessions
                                </button>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}