"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ChevronRight, Flame, Tag, Star, ChevronDown, X } from "lucide-react";
import { ProductCard } from "@/components/Products/ProductCard";
import { Product } from "@/data/products";

interface OffersClientProps {
    initialProducts: Product[];
}

export default function OffersClient({ initialProducts }: OffersClientProps) {
    const [sortBy, setSortBy] = useState("discount-high");
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000]);
    const [minDiscount, setMinDiscount] = useState(0);

    const filteredProducts = useMemo(() => {
        let result = [...initialProducts];

        // ✅ দাম ফিল্টার
        result = result.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1]);

        // ✅ ডিসকাউন্ট ফিল্টার
        if (minDiscount > 0) {
            result = result.filter((p) => {
                const discount = p.originalPrice
                    ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)
                    : 0;
                return discount >= minDiscount;
            });
        }

        // ✅ সর্টিং
        switch (sortBy) {
            case "discount-high":
                result.sort((a, b) => {
                    const discA = a.originalPrice ? (a.originalPrice - a.price) / a.originalPrice : 0;
                    const discB = b.originalPrice ? (b.originalPrice - b.price) / b.originalPrice : 0;
                    return discB - discA;
                });
                break;
            case "price-low":
                result.sort((a, b) => a.price - b.price);
                break;
            case "price-high":
                result.sort((a, b) => b.price - a.price);
                break;
            case "rating":
                result.sort((a, b) => b.rating - a.rating);
                break;
        }
        return result;
    }, [initialProducts, priceRange, minDiscount, sortBy]);

    const clearFilters = () => {
        setPriceRange([0, 2000]);
        setMinDiscount(0);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                <Link href="/" className="hover:text-green-600">Home</Link>
                <ChevronRight className="h-4 w-4" />
                <span className="text-gray-800 dark:text-gray-200 font-medium">Offer Zone</span>
            </nav>

            {/* হেডার */}
            <div className="relative bg-gradient-to-r from-red-500 via-orange-500 to-red-500 rounded-3xl p-8 md:p-12 mb-8 overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20" />
                <div className="relative z-10 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
                        <Flame className="h-8 w-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-1">
                            Offer Zone
                        </h1>
                        <p className="text-white/90 text-sm md:text-base">
                            Grab the best deals and save up to 70% on your favorite products!
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* ফিল্টার সাইডবার */}
                <aside className="lg:col-span-1">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 sticky top-32">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Filters</h2>
                            <button onClick={clearFilters} className="text-xs text-red-500 hover:underline">
                                Clear all
                            </button>
                        </div>

                        {/* দাম ফিল্টার */}
                        <div className="mb-6 pb-6 border-b border-gray-100 dark:border-gray-800">
                            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-3">Price Range</h3>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    value={priceRange[0]}
                                    onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-transparent"
                                    placeholder="Min"
                                />
                                <span className="text-gray-400">-</span>
                                <input
                                    type="number"
                                    value={priceRange[1]}
                                    onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-transparent"
                                    placeholder="Max"
                                />
                            </div>
                        </div>

                        {/* ডিসকাউন্ট ফিল্টার */}
                        <div>
                            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-3">Minimum Discount</h3>
                            <div className="space-y-2">
                                {[10, 20, 30, 50].map((discount) => (
                                    <label key={discount} className="flex items-center gap-2 cursor-pointer group">
                                        <input
                                            type="radio"
                                            name="discount"
                                            checked={minDiscount === discount}
                                            onChange={() => setMinDiscount(discount)}
                                            className="w-4 h-4 accent-green-600"
                                        />
                                        <div className="flex items-center gap-1">
                                            <Tag className="h-3 w-3 text-green-600" />
                                            <span className="text-xs text-gray-600 dark:text-gray-400">
                                                {discount}% or more
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
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            <span className="font-bold text-gray-900 dark:text-white">{filteredProducts.length}</span> products with discounts
                        </p>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500 hidden sm:block">Sort by:</span>
                            <div className="relative">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="appearance-none pl-3 pr-8 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-semibold bg-transparent focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer"
                                >
                                    <option value="discount-high">Highest Discount</option>
                                    <option value="price-low">Price: Low to High</option>
                                    <option value="price-high">Price: High to Low</option>
                                    <option value="rating">Top Rated</option>
                                </select>
                                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    {/* প্রোডাক্ট গ্রিড */}
                    {filteredProducts.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
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
                                No offers found
                            </h2>
                            <p className="text-sm text-gray-500 mb-6">
                                Try adjusting your filters.
                            </p>
                            <button
                                onClick={clearFilters}
                                className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg font-semibold transition-colors"
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