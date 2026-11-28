// components/NewArrivals/NewArrivalsClient.tsx
"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
    ChevronRight,
    SlidersHorizontal,
    Grid,
    List,
    X,
    Star,
    ChevronDown,
    Sparkles,
} from "lucide-react";
import { ProductCard } from "@/components/Products/ProductCard";

export interface NewArrivalProductItem {
    id: number;
    title: string;
    slug: string;
    price: number;
    originalPrice?: number;
    image: string;
    rating: number;
}

interface NewArrivalsClientProps {
    initialProducts: NewArrivalProductItem[];
}

export default function NewArrivalsClient({
    initialProducts,
}: NewArrivalsClientProps) {
    const [view, setView] = useState<"grid" | "list">("grid");
    const [sortBy, setSortBy] = useState("newest");
    const [showFilters, setShowFilters] = useState(false);
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);
    const [minRating, setMinRating] = useState(0);

    // ✅ ফিল্টার ও সর্টিং
    const filteredProducts = useMemo(() => {
        let result = [...initialProducts];

        result = result.filter(
            (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
        );
        if (minRating > 0) {
            result = result.filter((p) => p.rating >= minRating);
        }

        switch (sortBy) {
            case "price-low":
                result.sort((a, b) => a.price - b.price);
                break;
            case "price-high":
                result.sort((a, b) => b.price - a.price);
                break;
            case "rating":
                result.sort((a, b) => b.rating - a.rating);
                break;
            case "newest":
            default:
                result.sort((a, b) => b.id - a.id);
                break;
        }
        return result;
    }, [initialProducts, priceRange, minRating, sortBy]);

    const clearFilters = () => {
        setPriceRange([0, 50000]);
        setMinRating(0);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                <Link href="/" className="hover:text-green-600">
                    Home
                </Link>
                <ChevronRight className="h-4 w-4" />
                <span className="text-gray-800 dark:text-gray-200 font-medium">
                    New Arrivals
                </span>
            </nav>

            {/* হেডার */}
            <div className="mb-8 flex items-start gap-4">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-green-50 dark:bg-green-950/30 text-green-600 shrink-0">
                    <Sparkles className="h-7 w-7" />
                </div>
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-1">
                        New Arrivals
                    </h1>
                    <p className="text-sm text-gray-500">
                        Discover our latest organic products, fresh from local farms.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* ফিল্টার সাইডবার */}
                <aside
                    className={`lg:col-span-1 ${showFilters ? "block" : "hidden lg:block"
                        }`}
                >
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 sticky top-32">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                                Filters
                            </h2>
                            <button
                                type="button"
                                onClick={clearFilters}
                                className="text-xs text-red-500 hover:underline cursor-pointer"
                            >
                                Clear all
                            </button>
                        </div>

                        {/* দাম ফিল্টার */}
                        <div className="mb-6 pb-6 border-b border-gray-100 dark:border-gray-800">
                            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-3">
                                Price Range
                            </h3>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    value={priceRange[0]}
                                    onChange={(e) =>
                                        setPriceRange([
                                            Number(e.target.value),
                                            priceRange[1],
                                        ])
                                    }
                                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-transparent"
                                    placeholder="Min"
                                />
                                <span className="text-gray-400">-</span>
                                <input
                                    type="number"
                                    value={priceRange[1]}
                                    onChange={(e) =>
                                        setPriceRange([
                                            priceRange[0],
                                            Number(e.target.value),
                                        ])
                                    }
                                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-transparent"
                                    placeholder="Max"
                                />
                            </div>
                        </div>

                        {/* রেটিং ফিল্টার */}
                        <div>
                            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-3">
                                Rating
                            </h3>
                            <div className="space-y-2">
                                {[4, 3, 2, 1].map((rating) => (
                                    <label
                                        key={rating}
                                        className="flex items-center gap-2 cursor-pointer group"
                                    >
                                        <input
                                            type="radio"
                                            name="rating"
                                            checked={minRating === rating}
                                            onChange={() => setMinRating(rating)}
                                            className="w-4 h-4 accent-green-600"
                                        />
                                        <div className="flex items-center gap-1">
                                            <div className="flex">
                                                {[1, 2, 3, 4, 5].map((s) => (
                                                    <Star
                                                        key={s}
                                                        className={`h-3 w-3 ${s <= rating
                                                                ? "fill-amber-400 text-amber-400"
                                                                : "text-gray-300"
                                                            }`}
                                                    />
                                                ))}
                                            </div>
                                            <span className="text-xs text-gray-500">
                                                &amp; up
                                            </span>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </aside>

                {/* প্রোডাক্ট সেকশন */}
                <div className="lg:col-span-3">
                    {/* টুলবার */}
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setShowFilters(!showFilters)}
                                className="lg:hidden flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-semibold cursor-pointer"
                            >
                                <SlidersHorizontal className="h-4 w-4" />
                                Filters
                            </button>
                            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                                <button
                                    type="button"
                                    onClick={() => setView("grid")}
                                    aria-label="Grid view"
                                    className={`p-2 rounded-md transition-colors cursor-pointer ${view === "grid"
                                            ? "bg-white dark:bg-gray-700 shadow-sm"
                                            : ""
                                        }`}
                                >
                                    <Grid className="h-4 w-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setView("list")}
                                    aria-label="List view"
                                    className={`p-2 rounded-md transition-colors cursor-pointer ${view === "list"
                                            ? "bg-white dark:bg-gray-700 shadow-sm"
                                            : ""
                                        }`}
                                >
                                    <List className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500 hidden sm:block">
                                Sort by:
                            </span>
                            <div className="relative">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="appearance-none pl-3 pr-8 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-semibold bg-transparent focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer"
                                >
                                    <option value="newest">Newest First</option>
                                    <option value="price-low">
                                        Price: Low to High
                                    </option>
                                    <option value="price-high">
                                        Price: High to Low
                                    </option>
                                    <option value="rating">Top Rated</option>
                                </select>
                                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    {/* প্রোডাক্ট গ্রিড */}
                    {filteredProducts.length > 0 ? (
                        <div
                            className={`grid gap-4 md:gap-6 ${view === "grid"
                                    ? "grid-cols-2 md:grid-cols-3"
                                    : "grid-cols-1"
                                }`}
                        >
                            {filteredProducts.map((product) => (
                                <ProductCard
                                    key={product.id}
                                    id={product.id}
                                    title={product.title}
                                    price={product.price}
                                    originalPrice={product.originalPrice}
                                    image={product.image}
                                    slug={product.slug}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20">
                            <div className="h-20 w-20 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                                <X className="h-10 w-10 text-gray-400" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                                No products found
                            </h2>
                            <p className="text-sm text-gray-500 mb-6">
                                Try adjusting your filters.
                            </p>
                            <button
                                type="button"
                                onClick={clearFilters}
                                className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg font-semibold transition-colors cursor-pointer"
                            >
                                Clear Filters
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}