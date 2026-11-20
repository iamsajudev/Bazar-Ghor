"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, X, ArrowRight, Loader2 } from "lucide-react";
import { useSearchStore } from "@/store/useSearchStore";

// ✅ API Product Type Definition
interface ApiProduct {
    id: number;
    name: string;
    slug: string;
    price_minor: number;
    compare_at_price_minor?: number | null;
    currency_code?: string;
    image_url?: string | null;
    thumbnail_url?: string | null;
}

export const SearchSuggestions = () => {
    const { query, setQuery, clearQuery } = useSearchStore();
    const [isOpen, setIsOpen] = useState(false);
    const [filteredProducts, setFilteredProducts] = useState<ApiProduct[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    
    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // ✅ Live Search with API Debounce
    useEffect(() => {
        if (query.trim().length < 2) {
            setFilteredProducts([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        const timer = setTimeout(async () => {
            try {
                const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "");
                // Laravel API usually uses 'search' or 'q' parameter
                const res = await fetch(`${baseUrl}/products?search=${encodeURIComponent(query)}&per_page=6`, {
                    headers: { Accept: "application/json" },
                });

                if (res.ok) {
                    const json = await res.json();
                    setFilteredProducts(json.data ?? []);
                } else {
                    setFilteredProducts([]);
                }
            } catch (error) {
                console.error("Search error:", error);
                setFilteredProducts([]);
            } finally {
                setIsLoading(false);
            }
        }, 300); // 300ms debounce to avoid spamming API

        return () => clearTimeout(timer);
    }, [query]);

    // ✅ Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target as Node) &&
                inputRef.current &&
                !inputRef.current.contains(e.target as Node)
            ) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Helper to format minor units safely
    const formatPrice = (minor: number, currency?: string) => {
        const amount = minor / 100;
        return currency === "BDT" ? `৳${amount}` : `${currency || "$"} ${amount.toFixed(2)}`;
    };

    return (
        <div className="relative w-full">
            {/* Search Input */}
            <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    placeholder="Search products..."
                    className="w-full pl-10 pr-10 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-green-500 outline-none text-sm transition-all"
                />
                {query && (
                    <button
                        onClick={() => {
                            clearQuery();
                            setFilteredProducts([]);
                            inputRef.current?.focus();
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>

            {/* ✅ Live Suggestions Dropdown */}
            {isOpen && query.trim().length >= 2 && (
                <div
                    ref={dropdownRef}
                    className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-2xl z-50 max-h-[400px] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200"
                >
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-green-600" />
                        </div>
                    ) : filteredProducts.length > 0 ? (
                        <div className="py-2">
                            <p className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                Products ({filteredProducts.length})
                            </p>
                            {filteredProducts.map((product) => (
                                <Link
                                    key={product.id}
                                    href={`/products/${product.slug}`}
                                    onClick={() => {
                                        setIsOpen(false);
                                        clearQuery();
                                    }}
                                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
                                >
                                    <div className="relative w-12 h-12 bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden shrink-0 border border-gray-100 dark:border-gray-700">
                                        <Image
                                            src={product.thumbnail_url || product.image_url || "/images/placeholder-category.png"}
                                            alt={product.name}
                                            fill
                                            className="object-contain p-1 group-hover:scale-105 transition-transform"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
                                            {product.name}
                                        </p>
                                        <p className="text-xs font-bold text-[#f76b1c]">
                                            {formatPrice(product.price_minor, product.currency_code)}
                                        </p>
                                    </div>
                                    <ArrowRight className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </Link>
                            ))}

                            {/* See All Results Button */}
                            <Link
                                href={`/search?q=${encodeURIComponent(query)}`}
                                onClick={() => setIsOpen(false)}
                                className="flex items-center justify-center gap-2 px-4 py-3 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 text-sm font-bold border-t border-gray-100 dark:border-gray-800 hover:bg-green-100 dark:hover:bg-green-950/50 transition-colors"
                            >
                                <Search className="h-4 w-4" />
                                See all results for &quot;{query}&quot;
                            </Link>
                        </div>
                    ) : (
                        <div className="p-8 text-center">
                            <div className="w-12 h-12 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">
                                No products found
                            </p>
                            <p className="text-xs text-gray-500">
                                Try a different keyword or check spelling.
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};