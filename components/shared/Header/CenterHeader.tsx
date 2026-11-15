"use client";

import Link from "next/link";
import Image from "next/image";
import {
    ShoppingCart,
    User,
    Heart,
    Menu,
    HelpCircle,
    UserCircle,
    PhoneCall,
    MessageCircle,
    ChevronDown,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { SearchBar } from "./SearchBar";
import { useCartStore } from "@/store/useCartStore"; // ১. কার্ট স্টোর ইমপোর্ট করুন
import { useWishlistStore } from "@/store/useWishlistStore";
import { useAuthStore } from "@/store/useAuthStore";

export const CenterHeader = () => {
    // ২. স্টোর থেকে প্রয়োজনীয় ফাংশন ও ডেটা নিন
    const { toggleCart, items } = useCartStore();

    // ৩. কার্টে মোট কতটি আইটেম আছে তা ক্যালকুলেট করুন
    const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

    const { items: wishlistItems } = useWishlistStore();
    const { user, isAuthenticated, isHydrated } = useAuthStore();

    const wishlistCount = wishlistItems.length;
    const showUser = isHydrated && isAuthenticated;

    return (
        <header className="bg-white dark:bg-gray-950 sticky top-0 z-40 shadow-xs transition-colors">
            <div className="container mx-auto px-4  flex items-center justify-between gap-4">

                {/* বাম দিকের অংশ: মোবাইল মেনু এবং লোগো একসাথে */}
                <div className="flex items-center gap-3">
                    {/* মোবাইল মেনু আইকন */}
                    <button
                        className="md:hidden text-gray-700 dark:text-gray-300 hover:text-green-600 transition-colors"
                        aria-label="Open Menu"
                    >
                        <Menu className="h-6 w-6" />
                    </button>

                    {/* লোগো (এখন একদম বামে ফিক্সড থাকবে) */}
                    <Link href="/" className="flex items-center shrink-0 group">
                        <div className="relative h-20 w-40 md:h-24 md:w-48">
                            <Image
                                src="/images/logo-main.png"
                                alt="BazarGhor Logo"
                                fill
                                priority
                                className="object-contain object-left group-hover:scale-105 transition-transform duration-200"
                            />
                        </div>
                    </Link>
                </div>

                {/* ডেস্কটপ সার্চ বার কম্পোনেন্ট */}
                <div className="hidden md:flex flex-1 max-w-2xl mx-4">
                    <SearchBar />
                </div>

                {/* ডান দিকের আইকনসমূহ */}
                <div className="flex items-center gap-3 md:gap-5 text-gray-700 dark:text-gray-300">
                    <ThemeToggle />

                    {showUser ? (
                        <Link
                            href="/account"
                            className="flex flex-col items-center gap-0.5 hover:text-green-600 transition-colors group"
                        >
                            <div className="p-1 rounded-full bg-green-50 dark:bg-gray-800">
                                <User className="h-5 w-5 text-green-600" />
                            </div>
                            <span className="text-[10px] md:text-xs font-medium truncate max-w-[60px]">
                                {user?.name.split(" ")[0]}
                            </span>
                        </Link>
                    ) : (
                        <Link
                            href="/login"
                            className="flex flex-col items-center gap-0.5 hover:text-green-600 transition-colors group"
                        >
                            <div className="p-1 rounded-full group-hover:bg-green-50 transition-colors">
                                <User className="h-5 w-5" />
                            </div>
                            <span className="text-[10px] md:text-xs font-medium">Sign In</span>
                        </Link>
                    )}

                    <Link
                        href="/wishlist"
                        className="hidden sm:flex flex-col items-center gap-0.5 hover:text-green-600 transition-colors group"
                    >
                        <div id="wishlist-icon-target" className="relative p-1 rounded-full group-hover:bg-green-50 transition-colors">
                            <Heart className="h-5 w-5" />
                            {wishlistCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full ring-2 ring-white">
                                    {wishlistCount}
                                </span>
                            )}
                        </div>
                        <span className="text-[10px] md:text-xs font-medium">Wishlist</span>
                    </Link>

                    <button
                        onClick={toggleCart}
                        className="flex flex-col items-center gap-0.5 hover:text-green-600 transition-colors group cursor-pointer"
                    >
                        {/* এখানে id="cart-icon-target" যোগ করুন */}
                        <div id="cart-icon-target" className="relative p-1 rounded-full group-hover:bg-green-50 transition-colors">
                            <ShoppingCart className="h-5 w-5" />
                            <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full ring-2 ring-white">
                                {totalItems}
                            </span>
                        </div>
                        <span className="text-[10px] md:text-xs font-medium">Cart</span>
                    </button>

                    {/* More বাটন এবং Hover ড্রপডাউন */}
                    <div className="relative hidden md:block group">
                        <button
                            type="button"
                            className="flex flex-col items-center gap-0.5 text-gray-700 dark:text-gray-300 group-hover:text-green-600 dark:group-hover:text-green-500 transition-colors p-1 rounded-full group-hover:bg-green-50 dark:group-hover:bg-gray-900"
                            aria-label="More options"
                        >
                            <Menu className="h-5 w-5" />
                            <span className="text-[10px] mt-1.5 md:text-xs flex items-center gap-0.5">
                                More
                                <ChevronDown className="h-3 w-3 transition-transform duration-200 group-hover:rotate-180" />
                            </span>
                        </button>

                        {/* ড্রপডাউন র‍্যাপার */}
                        <div className="absolute right-0 top-full pt-2 w-60 opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-200 z-50">
                            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xl rounded-xl py-2 backdrop-blur-md">
                                <Link
                                    href="/wishlist"
                                    className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/60 hover:text-green-600 transition-colors"
                                >
                                    <Heart className="h-4 w-4 text-green-600 dark:text-green-500" />
                                    Wishlists
                                </Link>
                                <Link
                                    href="/faqs"
                                    className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/60 hover:text-green-600 transition-colors"
                                >
                                    <HelpCircle className="h-4 w-4 text-green-600 dark:text-green-500" />
                                    FAQs
                                </Link>
                                <Link
                                    href="/about"
                                    className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/60 hover:text-green-600 transition-colors"
                                >
                                    <UserCircle className="h-4 w-4 text-green-600 dark:text-green-500" />
                                    About Us
                                </Link>

                                <div className="h-px bg-gray-100 dark:bg-gray-800 my-1" />

                                <Link
                                    href="tel:+8809612338833"
                                    className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/60 hover:text-green-600 transition-colors"
                                >
                                    <PhoneCall className="h-4 w-4 text-green-600 dark:text-green-500" />
                                    Call Us
                                </Link>
                                <Link
                                    href="https://wa.me/8809612338833"
                                    target="_blank"
                                    className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors"
                                >
                                    <MessageCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                    WhatsApp Support
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* মোবাইলের জন্য সার্চ বার কম্পোনেন্ট */}
            <div className="md:hidden px-4 pb-3 pt-1 bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-900">
                <SearchBar isMobile />
            </div>
        </header>
    );
};