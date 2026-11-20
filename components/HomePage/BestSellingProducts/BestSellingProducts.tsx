"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { ArrowRight, Loader2 } from "lucide-react";
import { ProductCard } from "@/components/Products/ProductCard";

export interface BestSellingVariant {
    id: number;
    regular_price_minor?: number | null;
    sale_price_minor?: number | null;
    effective_price_minor?: number | null;
    in_stock?: boolean;
    image_url?: string | null;
}

export interface BestSellingApiProduct {
    id: number;
    name?: string;
    title?: string;
    slug?: string;
    price?: number;
    originalPrice?: number;
    image?: string;
    thumbnail_url?: string | null;
    image_url?: string | null;
    primary_image?: { url?: string | null; alt?: string | null } | null;
    variants?: BestSellingVariant[];
}

interface BestSellingProductsProps {
    products: BestSellingApiProduct[];
}

const PLACEHOLDER_IMAGE = "/images/product-not-found.webp";
const ITEMS_PER_PAGE = 8;

function cleanText(text?: string | null): string {
    if (!text) return "";
    return text
        .replace(/<[^>]*>?/gm, "")
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'");
}

function normalizeProductForCard(product: BestSellingApiProduct) {
    const variant = product.variants?.[0];

    const regularRaw =
        variant?.regular_price_minor ??
        product.originalPrice ??
        product.price ??
        0;

    const effectiveRaw =
        variant?.effective_price_minor ??
        variant?.sale_price_minor ??
        product.price ??
        regularRaw;

    const price = Number.isFinite(Number(effectiveRaw)) ? Number(effectiveRaw) : 0;
    const regular = Number.isFinite(Number(regularRaw)) ? Number(regularRaw) : price;
    const originalPrice = regular > price ? regular : undefined;

    const image =
        product.primary_image?.url?.trim() ||
        variant?.image_url?.trim() ||
        product.thumbnail_url?.trim() ||
        product.image_url?.trim() ||
        product.image?.trim() ||
        PLACEHOLDER_IMAGE;

    const title = cleanText(product.name || product.title || "Untitled Product");

    return {
        id: product.id,
        title,
        price,
        originalPrice,
        image,
        slug: product.slug,
    };
}

export const BestSellingProducts = ({ products }: BestSellingProductsProps) => {
    const [visibleProducts, setVisibleProducts] = useState<BestSellingApiProduct[]>([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);

    const loaderRef = useRef<HTMLDivElement | null>(null);

    // `products` এ ডেটা এলে বা বদলালে রিসেট করে প্রথম পেজ লোড করা
    useEffect(() => {
        if (!Array.isArray(products) || products.length === 0) {
            setVisibleProducts([]);
            setPage(1);
            return;
        }

        const firstBatch = products.slice(0, ITEMS_PER_PAGE);
        setVisibleProducts(firstBatch);
        setPage(2);
    }, [products]);

    const hasMore = visibleProducts.length < products.length;

    const loadMoreProducts = useCallback(() => {
        if (loading || !hasMore) return;
        setLoading(true);

        const timer = setTimeout(() => {
            const startIndex = (page - 1) * ITEMS_PER_PAGE;
            const endIndex = startIndex + ITEMS_PER_PAGE;
            const nextSlice = products.slice(startIndex, endIndex);

            if (nextSlice.length > 0) {
                setVisibleProducts((prev) => {
                    const existingIds = new Set(prev.map((item) => item.id));
                    const uniqueNext = nextSlice.filter(
                        (item) => !existingIds.has(item.id)
                    );
                    return [...prev, ...uniqueNext];
                });
                setPage((prev) => prev + 1);
            }

            setLoading(false);
        }, 400);

        return () => clearTimeout(timer);
    }, [page, products, loading, hasMore]);

    useEffect(() => {
        const currentLoader = loaderRef.current;
        if (!currentLoader || !hasMore) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0]?.isIntersecting && hasMore && !loading) {
                    loadMoreProducts();
                }
            },
            { threshold: 0.2 }
        );

        observer.observe(currentLoader);
        return () => observer.disconnect();
    }, [hasMore, loading, loadMoreProducts]);

    if (!products || products.length === 0) {
        return null;
    }

    return (
        <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white border-l-4 border-green-600 pl-3">
                    Best Selling Products
                </h2>
                <Link
                    href="/products"
                    className="text-xs md:text-sm font-semibold text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors flex items-center gap-1 group"
                >
                    <span>View All</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {visibleProducts.map((product) => {
                    const mapped = normalizeProductForCard(product);
                    return (
                        <ProductCard
                            key={mapped.id}
                            id={mapped.id}
                            title={mapped.title}
                            price={mapped.price}
                            originalPrice={mapped.originalPrice}
                            image={mapped.image}
                            {...({ slug: mapped.slug } as Record<string, unknown>)}
                        />
                    );
                })}
            </div>

            {hasMore && (
                <div
                    ref={loaderRef}
                    className="flex justify-center items-center mt-10 h-16"
                >
                    {loading ? (
                        <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-semibold text-sm">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span>Loading more products...</span>
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={loadMoreProducts}
                            className="text-xs font-semibold text-gray-500 hover:text-green-600 dark:text-gray-400 cursor-pointer"
                        >
                            Scroll down to load more
                        </button>
                    )}
                </div>
            )}
        </section>
    );
};