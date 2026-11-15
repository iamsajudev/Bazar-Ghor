"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, X, ArrowRight } from "lucide-react";
import { useSearchStore } from "@/store/useSearchStore";
import { MOCK_PRODUCTS } from "@/data/products";

export const SearchSuggestions = () => {
    const { query, setQuery, clearQuery } = useSearchStore();
    const [isOpen, setIsOpen] = useState(false);
    const [filteredProducts, setFilteredProducts] = useState<typeof MOCK_PRODUCTS>([]);
    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // ✅ লাইভ সার্চ ফিল্টার
    useEffect(() => {
        if (query.trim().length < 2) {
            setFilteredProducts([]);
            return;
        }

        const lowerQuery = query.toLowerCase();
        const matches = MOCK_PRODUCTS.filter((product) =>
            product.title.toLowerCase().includes(lowerQuery) ||
            product.category.name.toLowerCase().includes(lowerQuery) ||
            product.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery))
        ).slice(0, 6); // সর্বোচ্চ ৬টি সাজেশন

        setFilteredProducts(matches);
    }, [query]);

    // ✅ বাইরে ক্লিক করলে ড্রপডাউন বন্ধ
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

    return (
        <div className="relative w-full">
            {/* সার্চ ইনপুট */}
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
                    className="w-full pl-10 pr-10 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-green-500 outline-none text-sm"
                />
                {query && (
                    <button
                        onClick={() => {
                            clearQuery();
                            inputRef.current?.focus();
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>

            {/* ✅ লাইভ সাজেশন ড্রপডাউন */}
            {isOpen && query.trim().length >= 2 && (
                <div
                    ref={dropdownRef}
                    className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-2xl z-50 max-h-[400px] overflow-y-auto"
                >
                    {filteredProducts.length > 0 ? (
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
                                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                >
                                    <div className="relative w-12 h-12 bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden shrink-0">
                                        <Image
                                            src={product.image}
                                            alt={product.title}
                                            fill
                                            className="object-contain p-1"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
                                            {product.title}
                                        </p>
                                        <p className="text-xs font-bold text-[#f76b1c]">${product.price}</p>
                                    </div>
                                    <ArrowRight className="h-4 w-4 text-gray-400" />
                                </Link>
                            ))}

                            {/* ✅ সব রেজাল্ট দেখার বাটন */}
                            <Link
                                href={`/search?q=${encodeURIComponent(query)}`}
                                onClick={() => {
                                    setIsOpen(false);
                                }}
                                className="flex items-center justify-center gap-2 px-4 py-3 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 text-sm font-bold border-t border-gray-100 dark:border-gray-800 hover:bg-green-100 dark:hover:bg-green-950/50 transition-colors"
                            >
                                <Search className="h-4 w-4" />
                                See all results for &quot;{query}&quot;
                            </Link>
                        </div>
                    ) : (
                        <div className="p-6 text-center">
                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">
                                No products found
                            </p>
                            <p className="text-xs text-gray-500">
                                Try a different keyword or browse our categories.
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};