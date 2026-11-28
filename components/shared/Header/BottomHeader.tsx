// components/layout/BottomHeader.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
    Menu,
    ChevronDown,
    ChevronRight,
    Flame,
    Sparkles,
    PhoneCall,
    ArrowRight,
    Loader2,
} from "lucide-react";
import { ApiProduct } from "@/hook/useCategoryProducts";
import { useCategories } from "@/hook/useCategories";
import { formatPrice } from "@/utils/format";
import { buildApiUrl } from "@/lib/api-url";

const PLACEHOLDER_IMAGE = "/images/no-product-found.png";
const DEFAULT_HELPLINE = "+1 (800) 555-0194";

// Cache top picks per category slug (max 2 items)
const picksCache = new Map<string, ApiProduct[]>();

// Cache site-information helpline across re-renders
let cachedHelpline: string | null = null;

function getTopPickImage(prod: ApiProduct): string {
    const raw = prod as unknown as {
        thumbnail_url?: string | null;
        image_url?: string | null;
        image?: string | null;
        primary_image?: { url?: string | null } | null;
        images?: Array<{ url?: string | null } | string>;
        media?: Array<{ url?: string | null } | string>;
    };

    const firstArrayImg = (arr?: Array<{ url?: string | null } | string>) => {
        if (!Array.isArray(arr) || arr.length === 0) return "";
        const first = arr[0];
        return typeof first === "string" ? first.trim() : first?.url?.trim() || "";
    };

    return (
        raw.primary_image?.url?.trim() ||
        raw.thumbnail_url?.trim() ||
        raw.image_url?.trim() ||
        raw.image?.trim() ||
        firstArrayImg(raw.images) ||
        firstArrayImg(raw.media) ||
        PLACEHOLDER_IMAGE
    );
}

function getTopPickPriceMinor(prod: ApiProduct): {
    priceMinor: number;
    compareMinor: number | null;
} {
    const raw = prod as unknown as {
        price_minor?: number | null;
        sale_price_minor?: number | null;
        regular_price_minor?: number | null;
        compare_at_price_minor?: number | null;
        variants?: Array<{
            effective_price_minor?: number | null;
            sale_price_minor?: number | null;
            regular_price_minor?: number | null;
            price_minor?: number | null;
            compare_at_price_minor?: number | null;
        }>;
    };

    const variant = raw.variants?.[0];
    const priceMinor =
        raw.price_minor ??
        raw.sale_price_minor ??
        variant?.effective_price_minor ??
        variant?.sale_price_minor ??
        variant?.price_minor ??
        raw.regular_price_minor ??
        variant?.regular_price_minor ??
        0;

    const compareMinor =
        raw.compare_at_price_minor ??
        variant?.compare_at_price_minor ??
        null;

    return {
        priceMinor: typeof priceMinor === "number" ? priceMinor : 0,
        compareMinor: typeof compareMinor === "number" ? compareMinor : null,
    };
}

export const BottomHeader = () => {
    const { categories, isLoading: categoriesLoading } = useCategories();
    const [activeIndex, setActiveIndex] = useState(0);
    const [helpline, setHelpline] = useState<string>(
        cachedHelpline || DEFAULT_HELPLINE
    );

    // Fetch helpline from /api/v1/site-information
    useEffect(() => {
        if (cachedHelpline) {
            setHelpline(cachedHelpline);
            return;
        }

        const siteInfoUrl = buildApiUrl("/api/v1/site-information");
        if (!siteInfoUrl) return;

        const controller = new AbortController();

        fetch(siteInfoUrl, {
            method: "GET",
            headers: { Accept: "application/json" },
            cache: "no-store",
            signal: controller.signal,
        })
            .then(async (res) => {
                if (!res.ok) throw new Error("Failed to fetch site info");
                return res.json();
            })
            .then((json) => {
                const phones: Array<{ phone?: string; title?: string }> =
                    json?.settings?.contact?.phones ||
                    json?.data?.settings?.contact?.phones ||
                    [];
                const primaryPhone = phones
                    .find((p) => p?.phone?.trim())
                    ?.phone?.trim();
                if (primaryPhone) {
                    cachedHelpline = primaryPhone;
                    setHelpline(primaryPhone);
                }
            })
            .catch(() => {
                // Keep fallback helpline on error/abort
            });

        return () => controller.abort();
    }, []);

    // Top-level categories only
    const topCategories = useMemo(
        () => categories.filter((c) => c.parent_id === null),
        [categories]
    );

    const activeCategory = topCategories[activeIndex] ?? topCategories[0];
    const activeSlug = activeCategory?.slug;

    // Sub-categories of active top category
    const subCategories = useMemo(() => {
        if (!activeCategory) return [];
        return categories.filter((c) => c.parent_id === activeCategory.id);
    }, [categories, activeCategory]);

    // Lazy fetch top 2 newest products for hovered category
    const [topPicks, setTopPicks] = useState<ApiProduct[]>([]);
    const [picksLoading, setPicksLoading] = useState(false);

    useEffect(() => {
        if (!activeSlug) {
            setTopPicks([]);
            return;
        }

        const cached = picksCache.get(activeSlug);
        if (cached) {
            setTopPicks(cached);
            setPicksLoading(false);
            return;
        }

        const controller = new AbortController();
        setTopPicks([]);
        setPicksLoading(true);

        const url = buildApiUrl(
            `/api/v1/categories/${encodeURIComponent(activeSlug)}/products?sort=newest&per_page=2`
        );

        fetch(url, {
            method: "GET",
            headers: { Accept: "application/json" },
            cache: "no-store",
            signal: controller.signal,
        })
            .then(async (res) => {
                if (!res.ok) throw new Error("Failed");
                const json = await res.json();
                const list: ApiProduct[] = Array.isArray(json?.data)
                    ? json.data
                    : Array.isArray(json?.data?.data)
                        ? json.data.data
                        : [];
                const topTwo = list.slice(0, 2);
                picksCache.set(activeSlug, topTwo);
                if (!controller.signal.aborted) {
                    setTopPicks(topTwo);
                    setPicksLoading(false);
                }
            })
            .catch(() => {
                if (!controller.signal.aborted) {
                    setTopPicks([]);
                    setPicksLoading(false);
                }
            });

        return () => controller.abort();
    }, [activeSlug]);

    // Reset active index when top categories change
    useEffect(() => {
        if (topCategories.length === 0) {
            setActiveIndex(0);
        } else if (activeIndex >= topCategories.length) {
            setActiveIndex(0);
        }
    }, [topCategories.length, activeIndex]);

    const telHref = `tel:${helpline.replace(/[^+\d]/g, "")}`;

    return (
        <nav
            aria-label="Primary category and store navigation"
            className="hidden md:block bg-gradient-to-r from-emerald-800 via-green-700 to-emerald-900 text-white text-xs border-b border-green-600/30 shadow-md relative z-30"
        >
            <div className="container mx-auto px-4 relative flex items-center justify-between text-sm">
                {/* Left Side */}
                <div className="flex items-center gap-8">
                    <div className="group">
                        <button
                            type="button"
                            onMouseEnter={() => setActiveIndex(0)}
                            className="cursor-pointer flex items-center gap-2.5 bg-white/15 hover:bg-white/25 text-white px-4 py-2.5 transition-all shadow-sm backdrop-blur-md"
                        >
                            <Menu className="h-4 w-4" />
                            <span className="text-xs md:text-sm font-semibold">
                                All Categories
                            </span>
                            <ChevronDown className="h-4 w-4 transition-transform duration-200 group-hover:rotate-180" />
                        </button>

                        {/* Mega Menu Dropdown */}
                        <div className="absolute left-4 right-4 top-full pt-2.5 opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 group-focus-within:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 transition-all duration-200 z-50 text-gray-800 dark:text-gray-200">
                            <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 shadow-2xl rounded-2xl overflow-hidden flex min-h-[320px]">
                                {/* Left Sidebar: Top Categories */}
                                <div className="w-64 shrink-0 border-r-2 border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 py-3 max-h-[70vh] overflow-y-auto">
                                    {categoriesLoading ? (
                                        <div className="flex items-center justify-center py-10">
                                            <Loader2 className="h-5 w-5 animate-spin text-green-600" />
                                        </div>
                                    ) : topCategories.length === 0 ? (
                                        <p className="px-5 py-4 text-sm text-gray-500">
                                            No categories available
                                        </p>
                                    ) : (
                                        <ul>
                                            {topCategories.map((category, idx) => {
                                                const isActive = idx === activeIndex;
                                                return (
                                                    <li
                                                        key={category.id}
                                                        onMouseEnter={() =>
                                                            setActiveIndex(idx)
                                                        }
                                                    >
                                                        <Link
                                                            href={`/category/${category.slug}`}
                                                            onFocus={() =>
                                                                setActiveIndex(idx)
                                                            }
                                                            className={`flex items-center justify-between px-5 py-3 text-sm transition-all ${isActive
                                                                    ? "bg-white dark:bg-gray-900 text-green-700 dark:text-green-400 font-semibold border-l-4 border-green-600 shadow-2xs"
                                                                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-200/70 dark:hover:bg-gray-800 hover:text-green-600"
                                                                }`}
                                                        >
                                                            <span className="truncate">
                                                                {category.name}
                                                            </span>
                                                            <ChevronRight
                                                                className={`h-4 w-4 shrink-0 transition-transform ${isActive
                                                                        ? "text-green-600 translate-x-0.5"
                                                                        : "text-gray-400"
                                                                    }`}
                                                            />
                                                        </Link>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    )}
                                </div>

                                {/* Right Panel */}
                                {activeCategory && (
                                    <div className="flex-1 p-6 grid grid-cols-12 gap-6 items-stretch bg-white dark:bg-gray-900">
                                        {/* Column 1: Sub-categories */}
                                        <div className="col-span-3 flex flex-col justify-between border-r-2 border-gray-200 dark:border-gray-800 pr-5">
                                            <div>
                                                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-gray-100 mb-3.5 pb-2 border-b-2 border-gray-200 dark:border-gray-800">
                                                    {activeCategory.name}
                                                </h4>
                                                <ul className="space-y-1.5">
                                                    {subCategories.length > 0 ? (
                                                        subCategories.map((sub) => (
                                                            <li key={sub.id}>
                                                                <Link
                                                                    href={`/category/${sub.slug}`}
                                                                    className="block py-2 px-3 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-gray-800 hover:text-green-600 transition-colors line-clamp-1"
                                                                >
                                                                    {sub.name}
                                                                </Link>
                                                            </li>
                                                        ))
                                                    ) : (
                                                        <li>
                                                            <Link
                                                                href={`/category/${activeCategory.slug}`}
                                                                className="block py-2 px-3 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-gray-800 hover:text-green-600 transition-colors"
                                                            >
                                                                All {activeCategory.name}
                                                            </Link>
                                                        </li>
                                                    )}
                                                </ul>
                                            </div>

                                            <Link
                                                href={`/category/${activeCategory.slug}`}
                                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-600 hover:text-green-700 mt-4 pt-3 border-t-2 border-gray-200 dark:border-gray-800 transition-colors"
                                            >
                                                <span>View All {activeCategory.name}</span>
                                                <ArrowRight className="h-3.5 w-3.5" />
                                            </Link>
                                        </div>

                                        {/* Column 2: Featured Category Banner */}
                                        <div className="col-span-5 relative bg-green-900 text-white rounded-2xl p-6 flex flex-col justify-between overflow-hidden shadow-md">
                                            {activeCategory.banner_url && (
                                                <img
                                                    src={activeCategory.banner_url}
                                                    alt={activeCategory.name}
                                                    className="absolute inset-0 w-full h-full object-cover opacity-30 pointer-events-none"
                                                />
                                            )}
                                            <div className="absolute -right-8 -bottom-8 w-44 h-44 bg-white/10 rounded-full blur-xl pointer-events-none" />

                                            <div className="relative z-10">
                                                <span className="inline-block bg-white/20 text-white px-3 py-1 rounded-full text-[11px] font-semibold mb-3">
                                                    Shop {activeCategory.name}
                                                </span>
                                                <h3 className="text-xl font-extrabold leading-snug mb-2">
                                                    Pure {activeCategory.name} Selection
                                                </h3>
                                                <p className="text-xs text-white/90 leading-relaxed font-medium">
                                                    Explore alcohol-free body oils, scents, and care essentials from Bismillah Body Oils.
                                                </p>
                                            </div>

                                            <div className="relative z-10 mt-6">
                                                <Link
                                                    href={`/category/${activeCategory.slug}`}
                                                    className="inline-flex items-center gap-1.5 bg-white text-gray-900 hover:bg-gray-100 font-semibold px-4 py-2.5 rounded-xl text-xs transition-all shadow-md active:scale-95"
                                                >
                                                    <span>Browse {activeCategory.name}</span>
                                                    <ArrowRight className="h-3.5 w-3.5" />
                                                </Link>
                                            </div>
                                        </div>

                                        {/* Column 3: Top Picks */}
                                        <div className="col-span-4 flex flex-col justify-between border-l-2 border-gray-200 dark:border-gray-800 pl-5">
                                            <div>
                                                <div className="flex items-center justify-between mb-3.5 pb-2 border-b-2 border-gray-200 dark:border-gray-800">
                                                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                                        <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                                        Top Picks
                                                    </h4>
                                                    <Link
                                                        href={`/category/${activeCategory.slug}`}
                                                        className="text-[11px] font-semibold text-green-600 hover:underline"
                                                    >
                                                        See All
                                                    </Link>
                                                </div>

                                                {picksLoading ? (
                                                    <div className="flex items-center justify-center py-8">
                                                        <Loader2 className="h-5 w-5 animate-spin text-green-600" />
                                                    </div>
                                                ) : topPicks.length > 0 ? (
                                                    <div className="space-y-3">
                                                        {topPicks.map((prod) => {
                                                            const { priceMinor, compareMinor } =
                                                                getTopPickPriceMinor(prod);
                                                            const hasDiscount =
                                                                compareMinor != null &&
                                                                compareMinor > priceMinor;
                                                            const imgSrc = getTopPickImage(prod);

                                                            return (
                                                                <Link
                                                                    key={prod.id}
                                                                    href={`/products/${prod.slug}`}
                                                                    className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-green-50 dark:hover:bg-gray-800/80 border-2 border-gray-200 dark:border-gray-700 transition-all group/prod shadow-2xs"
                                                                >
                                                                    <div className="relative h-14 w-14 bg-white dark:bg-gray-900 rounded-lg overflow-hidden shrink-0 border border-gray-200 dark:border-gray-700 flex items-center justify-center">
                                                                        <img
                                                                            src={imgSrc}
                                                                            alt={prod.name}
                                                                            className="w-full h-full object-contain p-1 group-hover/prod:scale-105 transition-transform"
                                                                            onError={(e) => {
                                                                                const img = e.currentTarget;
                                                                                if (img.dataset.fallbackApplied) return;
                                                                                img.dataset.fallbackApplied = "true";
                                                                                img.src = PLACEHOLDER_IMAGE;
                                                                            }}
                                                                        />
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <h5 className="text-xs font-semibold text-gray-900 dark:text-gray-100 truncate group-hover/prod:text-green-600 transition-colors">
                                                                            {prod.name}
                                                                        </h5>
                                                                        <div className="flex items-center gap-2 mt-0.5">
                                                                            <span className="text-xs font-extrabold text-green-600">
                                                                                {formatPrice(
                                                                                    priceMinor,
                                                                                    prod.currency_code || "USD"
                                                                                )}
                                                                            </span>
                                                                            {hasDiscount && (
                                                                                <span className="text-[10px] text-gray-400 line-through">
                                                                                    {formatPrice(
                                                                                        compareMinor,
                                                                                        prod.currency_code || "USD"
                                                                                    )}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        {prod.in_stock === false && (
                                                                            <span className="text-[10px] text-red-500 font-semibold">
                                                                                Out of stock
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </Link>
                                                            );
                                                        })}
                                                    </div>
                                                ) : (
                                                    <p className="text-xs text-gray-500 py-6 text-center">
                                                        Products coming soon in this category.
                                                    </p>
                                                )}
                                            </div>

                                            <div className="mt-4 pt-3 border-t-2 border-gray-200 dark:border-gray-800 text-center">
                                                <p className="text-[11px] font-medium text-gray-700 dark:text-gray-300">
                                                    100% Alcohol-Free • U.S. Retail &amp; Wholesale
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Main Navigation Links */}
                    <div className="flex items-center gap-6 text-xs md:text-sm font-medium">
                        <Link
                            href="/"
                            className="text-white hover:text-emerald-200 transition-colors py-1"
                        >
                            Home
                        </Link>
                        <Link
                            href="/shop"
                            className="flex items-center gap-1 text-white hover:text-emerald-200 transition-colors py-1"
                        >
                            <Flame className="h-4 w-4 text-amber-300" />
                            <span>Shop</span>
                        </Link>
                        <Link
                            href="/offers"
                            className="flex items-center gap-1 text-white hover:text-emerald-200 transition-colors py-1"
                        >
                            <Flame className="h-4 w-4 text-amber-300" />
                            <span>Offer Zone</span>
                        </Link>
                        <Link
                            href="/brands"
                            className="flex items-center gap-1 text-white hover:text-emerald-200 transition-colors py-1"
                        >
                            <span>Brands</span>
                        </Link>
                        <Link
                            href="/new-arrivals"
                            className="flex items-center gap-1 text-white hover:text-emerald-200 transition-colors py-1"
                        >
                            <Sparkles className="h-3.5 w-3.5 text-yellow-300" />
                            <span>New Arrivals</span>
                        </Link>
                        <Link
                            href="/about"
                            className="text-white hover:text-emerald-200 transition-colors py-1"
                        >
                            About Us
                        </Link>
                    </div>
                </div>

                {/* Right Side Helpline */}
                <a
                    href={telHref}
                    className="hidden xl:flex items-center gap-2 text-xs text-white bg-white/10 hover:bg-white/15 px-3.5 py-3 shadow-2xs backdrop-blur-md transition-colors"
                >
                    <PhoneCall className="h-3.5 w-3.5 text-emerald-300" />
                    <span>
                        Need Help? Call:{" "}
                        <strong className="text-white font-extrabold">
                            {helpline}
                        </strong>
                    </span>
                </a>
            </div>
        </nav>
    );
};