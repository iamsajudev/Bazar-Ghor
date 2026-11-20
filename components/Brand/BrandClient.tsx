"use client";

import { useState } from "react";
import Link from "next/link";
import {
    ChevronRight,
    ChevronLeft,
    Grid,
    List,
    X,
    ChevronDown,
    Loader2,
    PackageSearch,
    SlidersHorizontal,
    RotateCcw,
} from "lucide-react";
import { useBrandProducts, ProductSort, ApiProduct } from "@/hook/useCategoryProducts";
import { formatPrice } from "@/utils/format";

interface BrandClientProps {
    brand: {
        id: number;
        name: string;
        slug: string;
        description?: string | null;
    };
}

const PLACEHOLDER_IMAGE = "/images/product-not-found.webp";
const PER_PAGE = 12;

function getEffectivePrice(p: ApiProduct): number {
    return p.price_minor; // ডক: prices in minor units (পয়সা)
}

export function BrandClient({ brand }: BrandClientProps) {
    // ✅ ফিল্টার স্টেট — সব সার্ভারে যাবে
    const [minTaka, setMinTaka] = useState<number>(0);
    const [maxTaka, setMaxTaka] = useState<number>(0);
    const [sort, setSort] = useState<ProductSort | "">("");
    const [page, setPage] = useState(1);

    // UI স্টেট
    const [view, setView] = useState<"grid" | "list">("grid");
    const [showFilters, setShowFilters] = useState(false);

    // ✅ হুক কম্পোনেন্টের ভেতরে, নতুন সিগনেচারে
    const { products, meta, isLoading, error } = useBrandProducts(brand.slug, {
        minPriceTaka: minTaka || undefined,
        maxPriceTaka: maxTaka || undefined,
        sort: sort || undefined,
        page,
        perPage: PER_PAGE,
    });

    const hasActiveFilters = minTaka > 0 || maxTaka > 0 || sort !== "";

    const clearFilters = () => {
        setMinTaka(0);
        setMaxTaka(0);
        setSort("");
        setPage(1);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                <Link href="/" className="hover:text-green-600">Home</Link>
                <ChevronRight className="h-4 w-4" />
                <span className="text-gray-800 dark:text-gray-200 font-medium">{brand.name}</span>
            </nav>

            {/* হেডার */}
            <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-2">
                    {brand.name}
                </h1>
                {brand.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 max-w-2xl">
                        {brand.description}
                    </p>
                )}
                <p className="text-sm text-gray-500">
                    {isLoading ? "Loading..." : `${meta.total} products found`}
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* ফিল্টার সাইডবার */}
                <aside className={`lg:col-span-1 ${showFilters ? "block" : "hidden lg:block"}`}>
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 sticky top-24">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Filters</h2>
                            {hasActiveFilters && (
                                <button onClick={clearFilters} className="text-xs text-red-500 hover:underline cursor-pointer">
                                    Clear all
                                </button>
                            )}
                        </div>

                        {/* দাম — টাকায় ইনপুট, হুক নিজে পয়সায় কনভার্ট করে API-তে পাঠায় */}
                        <div>
                            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-3">
                                Price Range ($)
                            </h3>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    min={0}
                                    value={minTaka || ""}
                                    onChange={(e) => {
                                        setMinTaka(Number(e.target.value));
                                        setPage(1);
                                    }}
                                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-green-500"
                                    placeholder="Min"
                                />
                                <span className="text-gray-400">-</span>
                                <input
                                    type="number"
                                    min={0}
                                    value={maxTaka || ""}
                                    onChange={(e) => {
                                        setMaxTaka(Number(e.target.value));
                                        setPage(1);
                                    }}
                                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-green-500"
                                    placeholder="Max"
                                />
                            </div>
                        </div>
                    </div>
                </aside>

                {/* মেইন কন্টেন্ট */}
                <div className="lg:col-span-3">
                    {/* টুলবার */}
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="lg:hidden flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-semibold"
                            >
                                <SlidersHorizontal className="h-4 w-4" />
                                Filters
                            </button>
                            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                                <button
                                    onClick={() => setView("grid")}
                                    aria-label="Grid view"
                                    className={`p-2 rounded-md transition-colors cursor-pointer ${view === "grid" ? "bg-white dark:bg-gray-700 shadow-sm" : ""}`}
                                >
                                    <Grid className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => setView("list")}
                                    aria-label="List view"
                                    className={`p-2 rounded-md transition-colors cursor-pointer ${view === "list" ? "bg-white dark:bg-gray-700 shadow-sm" : ""}`}
                                >
                                    <List className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500 hidden sm:block">Sort by:</span>
                            <div className="relative">
                                <select
                                    value={sort}
                                    onChange={(e) => {
                                        setSort(e.target.value as ProductSort | "");
                                        setPage(1);
                                    }}
                                    className="appearance-none pl-3 pr-8 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-semibold bg-transparent focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer"
                                >
                                    {/* ✅ ডকের sort ভ্যালু */}
                                    <option value="">Relevance</option>
                                    <option value="newest">Newest</option>
                                    <option value="name_asc">Name: A to Z</option>
                                    <option value="name_desc">Name: Z to A</option>
                                    <option value="price_asc">Price: Low to High</option>
                                    <option value="price_desc">Price: High to Low</option>
                                </select>
                                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    {/* এরর স্টেট */}
                    {error && (
                        <div className="flex flex-col items-center justify-center py-16 text-red-500">
                            <X className="h-10 w-10 mb-2" />
                            <p className="font-semibold">Error loading products</p>
                            <p className="text-sm">{error}</p>
                        </div>
                    )}

                    {/* লোডিং স্টেট */}
                    {isLoading && !error && (
                        <div className="flex items-center justify-center py-24">
                            <Loader2 className="h-8 w-8 animate-spin text-green-600" />
                            <span className="ml-2 text-gray-600">Loading products...</span>
                        </div>
                    )}

                    {/* প্রোডাক্ট গ্রিড */}
                    {!isLoading && !error && products.length > 0 && (
                        <>
                            <div className={`grid gap-4 md:gap-6 ${view === "grid" ? "grid-cols-2 md:grid-cols-3" : "grid-cols-1"}`}>
                                {products.map((product) => {
                                    const hasDiscount =
                                        product.compare_at_price_minor != null &&
                                        product.compare_at_price_minor > product.price_minor;

                                    return (
                                        <Link
                                            key={product.id}
                                            href={`/products/${product.slug}`}
                                            className={`group border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:border-green-500 transition-all bg-white dark:bg-gray-900 ${view === "list" ? "flex items-center gap-4 p-4" : "p-4"}`}
                                        >
                                            <div className={`bg-green-50 dark:bg-green-900/20 rounded-lg overflow-hidden flex items-center justify-center ${view === "list" ? "w-28 h-28 shrink-0" : "w-full h-40 mb-3"}`}>
                                                <img
                                                    src={product.thumbnail_url ?? product.image_url ?? PLACEHOLDER_IMAGE}
                                                    alt={product.name}
                                                    className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
                                                    }}
                                                />
                                            </div>
                                            <div className={view === "list" ? "flex-1" : ""}>
                                                <h3 className="font-bold text-base md:text-lg text-gray-900 dark:text-white group-hover:text-green-700 dark:group-hover:text-green-400 transition-colors line-clamp-2">
                                                    {product.name}
                                                </h3>
                                                <div className="flex items-center gap-2 mt-1.5">
                                                    {/* ✅ minor units → টাকা */}
                                                    <span className="text-green-600 dark:text-green-400 font-bold">
                                                        {formatPrice(getEffectivePrice(product), product.currency_code)}
                                                    </span>
                                                    {hasDiscount && (
                                                        <span className="text-xs text-gray-400 line-through">
                                                            {formatPrice(product.compare_at_price_minor!, product.currency_code)}
                                                        </span>
                                                    )}
                                                </div>
                                                {product.in_stock === false && (
                                                    <span className="inline-block mt-1.5 text-[11px] font-semibold text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded-full">
                                                        Out of stock
                                                    </span>
                                                )}
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>

                            {/* ✅ পেজিনেশন — সার্ভারের meta থেকে */}
                            {meta.last_page > 1 && (
                                <div className="flex items-center justify-center gap-2 mt-10">
                                    <button
                                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                                        disabled={meta.current_page <= 1}
                                        className="h-9 w-9 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center disabled:opacity-40 hover:bg-green-600 hover:text-white hover:border-green-600 transition-all cursor-pointer disabled:cursor-not-allowed"
                                        aria-label="Previous page"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </button>
                                    <span className="text-sm text-gray-600 dark:text-gray-400 px-2">
                                        Page {meta.current_page} of {meta.last_page}
                                    </span>
                                    <button
                                        onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
                                        disabled={meta.current_page >= meta.last_page}
                                        className="h-9 w-9 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center disabled:opacity-40 hover:bg-green-600 hover:text-white hover:border-green-600 transition-all cursor-pointer disabled:cursor-not-allowed"
                                        aria-label="Next page"
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </button>
                                </div>
                            )}
                        </>
                    )}

                    {/* ✅ খালি স্টেট — আপনার কাস্টম ডিজাইন 그대로 রাখা হলো */}
                    {!isLoading && !error && products.length === 0 && (
                        <div className="flex flex-col items-center justify-center text-center py-16 px-4">
                            {/* Combined Image + Floating Badge */}
                            <div className="relative mb-7 group">
                                {/* Main Rounded Image */}
                                <div className="w-full h-full sm:w-full sm:h-full rounded-3xl overflow-hidden bg-transparent dark:bg-gray-800">
                                    <img
                                        src="/images/no-product-found.png"
                                        alt="No products found"
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                </div>

                                {/* Corner Animated Radar Icon Badge */}
                                <div className="absolute -bottom-3 -right-3 flex items-center justify-center">
                                    <span className="absolute inline-flex h-12 w-12 animate-ping rounded-full bg-green-400/30 duration-1000" />
                                    <div className="relative h-12 w-12 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-lg rounded-full flex items-center justify-center">
                                        <PackageSearch className="h-5 w-5 text-green-600 dark:text-green-400 transition-transform duration-300 group-hover:rotate-12" />
                                    </div>
                                </div>
                            </div>

                            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                                No products found for this brand
                            </h2>
                            <p className="text-sm text-gray-500 mb-6">
                                {hasActiveFilters
                                    ? "Try adjusting your filters."
                                    : "Products will appear here once they are added."}
                            </p>

                            {hasActiveFilters && (
                                <button
                                    onClick={clearFilters}
                                    className="group inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 active:scale-95 text-white px-6 py-2.5 rounded-xl font-semibold shadow-sm shadow-green-600/20 hover:shadow-md hover:shadow-green-600/30 transition-all duration-200 cursor-pointer"
                                >
                                    <RotateCcw className="h-4 w-4 transition-transform duration-500 group-hover:-rotate-180" />
                                    Clear Filters
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}