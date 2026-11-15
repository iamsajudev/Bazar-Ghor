"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { ProductCard } from "@/components/Products/ProductCard";
import { Product } from "@/data/products";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface BestSellingProductsProps {
    products: Product[];
}

export const BestSellingProducts = ({ products }: BestSellingProductsProps) => {
    const [visibleProducts, setVisibleProducts] = useState<Product[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);

    const loaderRef = useRef<HTMLDivElement | null>(null);
    const ITEMS_PER_PAGE = 10;

    // প্রোডাক্ট লোড করার ফাংশন
    const loadMoreProducts = useCallback(() => {
        if (loading || !hasMore) return;
        setLoading(true);

        // এখানে API কল সিমুলেট করা হচ্ছে (setTimeout)
        setTimeout(() => {
            const startIndex = (page - 1) * ITEMS_PER_PAGE;
            const endIndex = startIndex + ITEMS_PER_PAGE;
            const newProducts = products.slice(startIndex, endIndex);

            if (newProducts.length > 0) {
                setVisibleProducts((prev) => {
                    // ডুপ্লিকেট প্রোডাক্ট এড়ানোর জন্য
                    const existingIds = new Set(prev.map(p => p.id));
                    const uniqueNewProducts = newProducts.filter(p => !existingIds.has(p.id));
                    return [...prev, ...uniqueNewProducts];
                });
                setPage((prev) => prev + 1);
            } else {
                setHasMore(false);
            }
            setLoading(false);
        }, 800); // ৮০০ms লোডিং সিমুলেশন
    }, [page, products, loading, hasMore]);

    // প্রথমবার লোড করা
    useEffect(() => {
        loadMoreProducts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // শুধু একবার রান হবে

    // Intersection Observer (স্ক্রল ডিটেকশন)
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loading) {
                    loadMoreProducts();
                }
            },
            { threshold: 1.0 }
        );

        const currentLoader = loaderRef.current;
        if (currentLoader) {
            observer.observe(currentLoader);
        }

        return () => {
            if (currentLoader) {
                observer.unobserve(currentLoader);
            }
        };
    }, [hasMore, loading, loadMoreProducts]);

    return (
        <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white border-l-4 border-green-600 pl-3">
                    Best Selling Products
                </h2>
                <Link
                    href={"/products"}
                    className="text-xs md:text-sm font-semibold text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors flex items-center gap-1 group"
                >
                    <span>View All</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>

            {/* প্রোডাক্ট গ্রিড */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {visibleProducts.map((product) => (
                    <ProductCard
                        key={product.id}
                        id={product.id}
                        title={product.title}
                        price={product.price}
                        originalPrice={product.originalPrice}
                        image={product.image}
                    />
                ))}
            </div>

            {/* লোডিং ইন্ডিকেটর (স্ক্রল করলে এখানে আসবে) */}
            {hasMore && (
                <div ref={loaderRef} className="flex justify-center items-center mt-10 h-20">
                    {loading ? (
                        <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-semibold">
                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>লোড হচ্ছে...</span>
                        </div>
                    ) : (
                        <span className="text-gray-500 dark:text-gray-400 text-sm">আরও প্রোডাক্ট লোড হবে...</span>
                    )}
                </div>
            )}
        </div>
    );
};