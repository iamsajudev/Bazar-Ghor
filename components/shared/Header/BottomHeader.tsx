"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
    Menu,
    ChevronDown,
    ChevronRight,
    Flame,
    Sparkles,
    PhoneCall,
    ArrowRight,
    Star,
} from "lucide-react";

const MEGA_CATEGORIES = [
    {
        name: "Organic Food",
        href: "/category/organic",
        subItems: [
            { name: "Organic Miniket Rice", href: "/category/organic/rice" },
            { name: "Organic Red Lentils", href: "/category/organic/lentils" },
            { name: "Organic Brown Sugar", href: "/category/organic/sugar" },
            { name: "Organic Chia Seeds", href: "/category/organic/chia" },
            { name: "Organic Oats & Grains", href: "/category/organic/oats" },
        ],
        banner: {
            badge: "100% Certified Organic",
            title: "Pure & Chemical-Free Organic Essentials",
            subtitle: "Sourced directly from trusted local farmers.",
            ctaText: "Shop Organic",
            ctaHref: "/category/organic",
            bgColor: "bg-emerald-900 text-white",
        },
        products: [
            {
                id: 1,
                name: "Organic Nazirshail Rice (5kg)",
                price: "৳ 480",
                oldPrice: "৳ 550",
                image: "/images/rice.png",
                rating: 4.9,
                href: "/product/organic-rice",
            },
            {
                id: 2,
                name: "Organic Red Lentils (1kg)",
                price: "৳ 165",
                oldPrice: "৳ 190",
                image: "/images/lentils.png",
                rating: 4.8,
                href: "/product/organic-lentils",
            },
        ],
    },
    {
        name: "Pure Honey",
        href: "/category/honey",
        subItems: [
            { name: "Sundarban Natural Honey", href: "/category/honey/sundarban" },
            { name: "Litchi Flower Honey", href: "/category/honey/litchi" },
            { name: "Black Seed (Kalojira) Honey", href: "/category/honey/black-seed" },
            { name: "Mustard Flower Honey", href: "/category/honey/mustard" },
        ],
        banner: {
            badge: "Raw & Unprocessed",
            title: "Authentic Sundarban & Flower Honey",
            subtitle: "Lab-tested purity in every single drop.",
            ctaText: "Explore Honey",
            ctaHref: "/category/honey",
            bgColor: "bg-amber-900 text-white",
        },
        products: [
            {
                id: 3,
                name: "Sundarban Raw Honey (500g)",
                price: "৳ 650",
                oldPrice: "৳ 800",
                image: "/images/honey.png",
                rating: 5.0,
                href: "/product/sundarban-honey",
            },
            {
                id: 4,
                name: "Kalojira Flower Honey (500g)",
                price: "৳ 720",
                oldPrice: "৳ 850",
                image: "/images/kalojira-honey.png",
                rating: 4.9,
                href: "/product/kalojira-honey",
            },
        ],
    },
    {
        name: "Ghee & Oil",
        href: "/category/ghee",
        subItems: [
            { name: "Pure Cow Ghee (Gaowa)", href: "/category/ghee/cow-ghee" },
            { name: "Cold-Pressed Mustard Oil", href: "/category/oil/mustard" },
            { name: "Extra Virgin Olive Oil", href: "/category/oil/olive" },
            { name: "Fortified Soybean Oil", href: "/category/oil/soybean" },
        ],
        banner: {
            badge: "Traditional Wood-Pressed",
            title: "Aromatic Cow Ghee & Pure Mustard Oil",
            subtitle: "Healthy cooking starts with unrefined oils.",
            ctaText: "Shop Ghee & Oil",
            ctaHref: "/category/ghee",
            bgColor: "bg-green-900 text-white",
        },
        products: [
            {
                id: 5,
                name: "Premium Gaowa Ghee (400g)",
                price: "৳ 680",
                oldPrice: "৳ 750",
                image: "/images/ghee.png",
                rating: 4.9,
                href: "/product/cow-ghee",
            },
            {
                id: 6,
                name: "Wood-Pressed Mustard Oil (1L)",
                price: "৳ 260",
                oldPrice: "৳ 300",
                image: "/images/oil.png",
                rating: 4.8,
                href: "/product/mustard-oil",
            },
        ],
    },
    {
        name: "Spices",
        href: "/category/spices",
        subItems: [
            { name: "Organic Chili Powder", href: "/category/spices/chili" },
            { name: "Pure Turmeric Powder", href: "/category/spices/turmeric" },
            { name: "Roasted Cumin Powder", href: "/category/spices/cumin" },
            { name: "Whole Garam Masala", href: "/category/spices/garam-masala" },
        ],
        banner: {
            badge: "Freshly Ground",
            title: "Aromatic & Pure Kitchen Spices",
            subtitle: "No artificial colors or preservatives added.",
            ctaText: "Browse Spices",
            ctaHref: "/category/spices",
            bgColor: "bg-red-900 text-white",
        },
        products: [
            {
                id: 7,
                name: "Pure Turmeric Powder (200g)",
                price: "৳ 110",
                oldPrice: "৳ 135",
                image: "/images/turmeric.png",
                rating: 4.7,
                href: "/product/turmeric",
            },
            {
                id: 8,
                name: "Premium Chili Powder (200g)",
                price: "৳ 130",
                oldPrice: "৳ 150",
                image: "/images/chili.png",
                rating: 4.8,
                href: "/product/chili",
            },
        ],
    },
    {
        name: "Nuts & Seeds",
        href: "/category/nuts",
        subItems: [
            { name: "California Almonds", href: "/category/nuts/almonds" },
            { name: "Roasted Cashew Nuts", href: "/category/nuts/cashews" },
            { name: "Ajwa & Medjool Dates", href: "/category/nuts/dates" },
            { name: "Pumpkin & Sunflower Seeds", href: "/category/nuts/seeds" },
        ],
        banner: {
            badge: "Healthy Snacking",
            title: "Crunchy Premium Nuts & Super Seeds",
            subtitle: "Boost your daily energy naturally.",
            ctaText: "Shop Nuts & Seeds",
            ctaHref: "/category/nuts",
            bgColor: "bg-stone-900 text-white",
        },
        products: [
            {
                id: 9,
                name: "Raw California Almonds (250g)",
                price: "৳ 340",
                oldPrice: "৳ 400",
                image: "/images/almonds.png",
                rating: 4.9,
                href: "/product/almonds",
            },
            {
                id: 10,
                name: "Premium Cashew Nuts (250g)",
                price: "৳ 380",
                oldPrice: "৳ 440",
                image: "/images/cashews.png",
                rating: 4.8,
                href: "/product/cashews",
            },
        ],
    },
];

export const BottomHeader = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const activeCategory = MEGA_CATEGORIES[activeIndex];

    return (
        <nav className="hidden md:block bg-gradient-to-r from-emerald-800 via-green-700 to-emerald-900 text-white text-xs border-b border-green-600/30 shadow-md relative z-30">
            <div className="container mx-auto px-4 relative flex items-center justify-between py-2 text-sm ">

                {/* Left Side: All Categories Button + Main Links */}
                <div className="flex items-center gap-8">

                    {/* Mega Menu Trigger & Full-Width Container */}
                    <div className="group">
                        <button
                            type="button"
                            onMouseEnter={() => setActiveIndex(0)}
                            className="cursor-pointer flex items-center gap-2.5 bg-white/15 hover:bg-white/25 border border-white/20 text-white px-4 py-2 rounded-xl transition-all shadow-sm backdrop-blur-md"
                        >
                            <Menu className="h-4 w-4" />
                            <span className="text-xs md:text-sm">All Categories</span>
                            <ChevronDown className="h-4 w-4 transition-transform duration-200 group-hover:rotate-180" />
                        </button>

                        {/* Full-Width Mega Menu Dropdown Wrapper */}
                        <div className="absolute left-4 right-4 top-full pt-2.5 opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-200 z-50 text-gray-800 dark:text-gray-200">
                            <div className="bg-white dark:bg-gray-200 border-2 border-gray-200 dark:border-gray-200 shadow-2xl rounded-2xl overflow-hidden flex">

                                {/* Left Sidebar: Main Categories List */}
                                <div className="w-64 shrink-0 border-r-2 border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 py-3">
                                    <ul>
                                        {MEGA_CATEGORIES.map((category, idx) => {
                                            const isActive = idx === activeIndex;
                                            return (
                                                <li
                                                    key={category.name}
                                                    onMouseEnter={() => setActiveIndex(idx)}
                                                >
                                                    <Link
                                                        href={category.href}
                                                        className={`flex items-center justify-between px-5 py-3 text-sm transition-all ${isActive
                                                            ? "bg-white dark:bg-gray-950 text-green-700 dark:text-green-400 border-l-4 border-green-600 shadow-xs"
                                                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-200/70 dark:hover:bg-gray-800 hover:text-green-600"
                                                            }`}
                                                    >
                                                        <span>{category.name}</span>
                                                        <ChevronRight
                                                            className={`h-4 w-4 transition-transform ${isActive
                                                                ? "text-green-600 translate-x-0.5"
                                                                : "text-gray-400"
                                                                }`}
                                                        />
                                                    </Link>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>

                                {/* Right Panel: 3-Column Grid */}
                                <div className="flex-1 p-6 grid grid-cols-12 gap-6 items-stretch bg-white dark:bg-gray-900">

                                    {/* Column 1 (Small - 3 cols): Sub-menu Items */}
                                    <div className="col-span-3 flex flex-col justify-between border-r-2 border-gray-200 dark:border-gray-800 pr-5">
                                        <div>
                                            <h4 className="text-xs uppercase tracking-wider text-gray-900 dark:text-gray-100 mb-3.5 pb-2 border-b-2 border-gray-200 dark:border-gray-800">
                                                {activeCategory.name}
                                            </h4>
                                            <ul className="space-y-1.5">
                                                {activeCategory.subItems.map((sub) => (
                                                    <li key={sub.name}>
                                                        <Link
                                                            href={sub.href}
                                                            className="block py-2 px-3 rounded-lg text-sm  text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-gray-800 hover:text-green-600 transition-colors"
                                                        >
                                                            {sub.name}
                                                        </Link>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <Link
                                            href={activeCategory.href}
                                            className="inline-flex items-center gap-1.5 text-xs text-green-600 hover:text-green-700 mt-4 pt-3 border-t-2 border-gray-200 dark:border-gray-800 transition-colors"
                                        >
                                            <span>View All {activeCategory.name}</span>
                                            <ArrowRight className="h-3.5 w-3.5" />
                                        </Link>
                                    </div>

                                    {/* Column 2 (Big - 5 cols): Solid Color Promotional Banner */}
                                    <div
                                        className={`col-span-5 relative ${activeCategory.banner.bgColor} rounded-2xl p-6 flex flex-col justify-between overflow-hidden shadow-md`}
                                    >
                                        <div className="absolute -right-8 -bottom-8 w-44 h-44 bg-white/10 rounded-full blur-xl pointer-events-none" />

                                        <div className="z-10">
                                            <span className="inline-block bg-white/20 text-white px-3 py-1 rounded-full text-[11px] mb-3">
                                                {activeCategory.banner.badge}
                                            </span>
                                            <h3 className="text-xl font-extrabold leading-snug mb-2">
                                                {activeCategory.banner.title}
                                            </h3>
                                            <p className="text-xs text-white/90 leading-relaxed font-medium">
                                                {activeCategory.banner.subtitle}
                                            </p>
                                        </div>

                                        <div className="z-10 mt-6">
                                            <Link
                                                href={activeCategory.banner.ctaHref}
                                                className="inline-flex items-center gap-1.5 bg-white text-gray-900 hover:bg-gray-100 px-4.5 py-2.5 rounded-xl text-xs transition-all shadow-md active:scale-95"
                                            >
                                                <span>{activeCategory.banner.ctaText}</span>
                                                <ArrowRight className="h-3.5 w-3.5" />
                                            </Link>
                                        </div>
                                    </div>

                                    {/* Column 3 (Small - 4 cols): Featured Products */}
                                    <div className="col-span-4 flex flex-col justify-between border-l-2 border-gray-200 dark:border-gray-800 pl-5">
                                        <div>
                                            <div className="flex items-center justify-between mb-3.5 pb-2 border-b-2 border-gray-200 dark:border-gray-800">
                                                <h4 className="text-xs uppercase tracking-wider text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                                    <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                                    Top Picks
                                                </h4>
                                                <Link
                                                    href={activeCategory.href}
                                                    className="text-[11px] text-green-600 hover:underline"
                                                >
                                                    See All
                                                </Link>
                                            </div>

                                            <div className="space-y-3">
                                                {activeCategory.products.map((prod) => (
                                                    <Link
                                                        key={prod.id}
                                                        href={prod.href}
                                                        className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-green-50 dark:hover:bg-gray-750 border-2 border-gray-200 dark:border-gray-700 transition-all group/prod shadow-2xs"
                                                    >
                                                        <div className="relative h-14 w-14 bg-white dark:bg-gray-900 rounded-lg overflow-hidden shrink-0 border border-gray-200 dark:border-gray-700">
                                                            <Image
                                                                src={prod.image}
                                                                alt={prod.name}
                                                                fill
                                                                className="object-contain p-1 group-hover/prod:scale-105 transition-transform"
                                                            />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-1 text-[10px] text-amber-500 mb-0.5">
                                                                <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                                                                <span>{prod.rating}</span>
                                                            </div>
                                                            <h5 className="text-xs text-gray-900 dark:text-gray-100 truncate group-hover/prod:text-green-600 transition-colors">
                                                                {prod.name}
                                                            </h5>
                                                            <div className="flex items-center gap-2 mt-0.5">
                                                                <span className="text-xs font-extrabold text-green-600">
                                                                    {prod.price}
                                                                </span>
                                                                <span className="text-[10px] text-gray-400 line-through">
                                                                    {prod.oldPrice}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="mt-4 pt-3 border-t-2 border-gray-200 dark:border-gray-800 text-center">
                                            <p className="text-[11px] text-gray-700 dark:text-gray-300">
                                                🚚 Free delivery on orders over 1000 TK
                                            </p>
                                        </div>
                                    </div>

                                </div>

                            </div>
                        </div>
                    </div>

                    {/* Main Navigation Links */}
                    <div className="flex items-center gap-6 text-xs md:text-sm">
                        <Link href="/" className="text-white hover:text-emerald-200 transition-colors py-1">
                            Home
                        </Link>
                        <Link href="/offers" className="flex items-center gap-1 text-white hover:text-emerald-200 transition-colors py-1">
                            <Flame className="h-4 w-4 animate-bounce text-red-400" />
                            <span>Offer Zone</span>
                        </Link>
                        <Link href="/new-arrivals" className="flex items-center gap-1 text-white hover:text-emerald-200 transition-colors py-1">
                            <Sparkles className="h-3.5 w-3.5 text-yellow-300" />
                            <span>New Arrivals</span>
                        </Link>
                        <Link href="/about" className="text-white hover:text-emerald-200 transition-colors py-1">
                            About Us
                        </Link>
                    </div>
                </div>

                {/* Right Side: Quick Support Banner */}
                <div className="hidden xl:flex items-center gap-2 text-xs text-white bg-white/10 px-3.5 py-2 rounded-xl border border-white/20 shadow-xs backdrop-blur-md">
                    <PhoneCall className="h-3.5 w-3.5 text-emerald-300" />
                    <span>Need Help? Call: <strong className="text-white font-extrabold">09612-338833</strong></span>
                </div>

            </div>
        </nav>
    );
};