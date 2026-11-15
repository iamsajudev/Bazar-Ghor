"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, X, SlidersHorizontal, ChevronDown } from "lucide-react";
import { ProductCard } from "@/components/Products/ProductCard";
import { MOCK_PRODUCTS, Product } from "@/data/products";
import { useSearchStore } from "@/store/useSearchStore";

function SearchContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const query = searchParams.get("q") || "";
    const { setQuery } = useSearchStore();

    const [results, setResults] = useState<Product[]>([]);
    const [sortBy, setSortBy] = useState("relevance");
    const [showFilters, setShowFilters] = useState(false);
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);

    // ✅ সার্চ রেজাল্ট ফিল্টার
    useEffect(() => {
        setQuery(query);
        if (!query) {
            setResults([]);
            return;
        }

        const lowerQuery = query.toLowerCase();
        let matches = MOCK_PRODUCTS.filter((product) =>
            product.title.toLowerCase().includes(lowerQuery) ||
            product.category.name.toLowerCase().includes(lowerQuery) ||
            product.description.toLowerCase().includes(lowerQuery) ||
            product.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery))
        );

        // ✅ সর্টিং
        if (sortBy === "price-low") {
            matches.sort((a, b) => a.price - b.price);
        } else if (sortBy === "price-high") {
            matches.sort((a, b) => b.price - a.price);
        } else if (sortBy === "rating") {
            matches.sort((a, b) => b.rating - a.rating);
        }

        // ✅ দাম ফিল্টার
        matches = matches.filter(
            (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
        );

        setResults(matches);
    }, [query, sortBy, priceRange, setQuery]);

    return (
        <div className="container mx-auto px-4 py-8">
            {/* হেডার */}
            <div className="mb-8">
                <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white mb-2">
                    {query ? `Search Results for "${query}"` : "Search Products"}
                </h1>
                <p className="text-sm text-gray-500">
                    {results.length} {results.length === 1 ? "product" : "products"} found
                </p>
            </div>

            {/* ফিল্টার ও সর্টিং বার */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100 dark:border-gray-800">
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                    <SlidersHorizontal className="h-4 w-4" />
                    Filters
                </button>

                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Sort by:</span>
                    <div className="relative">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="appearance-none pl-3 pr-8 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-semibold bg-transparent focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer"
                        >
                            <option value="relevance">Relevance</option>
                            <option value="price-low">Price: Low to High</option>
                            <option value="price-high">Price: High to Low</option>
                            <option value="rating">Top Rated</option>
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* ফিল্টার সাইডবার */}
            {showFilters && (
                <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-6 mb-6">
                    <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-3">Price Range</h3>
                    <div className="flex items-center gap-4">
                        <input
                            type="number"
                            placeholder="Min"
                            value={priceRange[0]}
                            onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                            className="w-24 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
                        />
                        <span className="text-gray-400">-</span>
                        <input
                            type="number"
                            placeholder="Max"
                            value={priceRange[1]}
                            onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                            className="w-24 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
                        />
                        <button
                            onClick={() => setPriceRange([0, 1000])}
                            className="text-xs text-gray-500 hover:text-red-500 flex items-center gap-1"
                        >
                            <X className="h-3 w-3" /> Reset
                        </button>
                    </div>
                </div>
            )}

            {/* রেজাল্ট গ্রিড */}
            {results.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {results.map((product) => (
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
                        <Search className="h-10 w-10 text-gray-400" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                        No products found
                    </h2>
                    <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
                        {query
                            ? `We couldn't find any products matching "${query}". Try different keywords.`
                            : "Enter a search term to find products."}
                    </p>
                    <button
                        onClick={() => router.push("/")}
                        className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg font-semibold transition-colors"
                    >
                        Browse All Products
                    </button>
                </div>
            )}
        </div>
    );
}

// ✅ Suspense র্যাপার (useSearchParams()-এর জন্য)
export default function SearchPage() {
    return (
        <Suspense fallback={
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
            </div>
        }>
            <SearchContent />
        </Suspense>
    );
}