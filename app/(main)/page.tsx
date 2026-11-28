"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";
import { BestSellingProducts } from "@/components/HomePage/BestSellingProducts/BestSellingProducts";
import { BrandSection } from "@/components/HomePage/BrandSection/BrandSection";
import { CallToAction } from "@/components/HomePage/CallToAction/CallToAction";
import { FullBgCTA } from "@/components/HomePage/CallToAction/FullBgCTA";
import { FeaturedCategories } from "@/components/HomePage/Category/FeaturedCategories";
import { CategoryProductSection } from "@/components/HomePage/CategoryProducts/CategoryProductSection";
import { CategoryProductSliderSection } from "@/components/HomePage/CategoryProducts/CategoryProductSliderSection";
import { HeroSlider } from "@/components/HomePage/HeroSection/HeroSlider";
import {
    TopSellingCard,
    TopSellingCardSkeleton,
    type TopSellingCardProps,
} from "@/components/HomePage/TopSellingCard/TopSellingCard";

// ==========================================
// 1. Types & Helpers
// ==========================================
export interface ApiVariant {
    id: number;
    sku?: string | null;
    regular_price_minor: number;
    sale_price_minor?: number | null;
    effective_price_minor: number;
    in_stock: boolean;
    image_url?: string | null;
}

export interface ApiPrimaryImage {
    id?: number;
    url: string;
    alt?: string | null;
    sort_order?: number;
}

export interface ApiBrand {
    id: number;
    name: string;
    slug: string;
}

export interface ApiCategory {
    id: number;
    parent_id?: number | null;
    name: string;
    slug: string;
}

export interface ApiProductItem {
    id: number;
    name: string;
    slug: string;
    type?: string;
    short_description?: string | null;
    description_html?: string | null;
    is_featured?: boolean | number | string | null;
    primary_category_id?: number | null;
    badges?: string[];
    brand?: ApiBrand | null;
    categories?: { id: number; name: string; slug: string }[];
    variants?: ApiVariant[];
    primary_image?: ApiPrimaryImage | null;
    gallery?: ApiPrimaryImage[];
}

const DEFAULT_API_BASE = "https://ecommerce.goflixza.com/api/v1";
const MAX_VISIBLE_CATEGORIES = 4;

function getApiBaseUrl(): string {
    const raw =
        process.env.NEXT_PUBLIC_API_BASE_URL?.trim() ||
        process.env.NEXT_PUBLIC_API_URL?.trim() ||
        DEFAULT_API_BASE;
    const clean = raw.replace(/\/+$/, "");
    return clean.endsWith("/api/v1") ? clean : `${clean}/api/v1`;
}

function getProductsApiUrl(): string {
    return `${getApiBaseUrl()}/products?per_page=20&page=1`;
}

function getCategoriesApiUrl(): string {
    return `${getApiBaseUrl()}/categories?per_page=30&page=1`;
}

function extractList<T>(payload: unknown): T[] {
    if (!payload || typeof payload !== "object") return [];
    const obj = payload as { data?: unknown };
    if (Array.isArray(obj.data)) return obj.data as T[];
    if (
        obj.data &&
        typeof obj.data === "object" &&
        Array.isArray((obj.data as { data?: unknown }).data)
    ) {
        return (obj.data as { data: T[] }).data;
    }
    return [];
}

function isFeaturedFlag(val: unknown): boolean {
    return val === true || val === 1 || val === "1" || val === "true";
}

function shuffleArray<T>(items: T[]): T[] {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

function mergeCategories(
    apiCategories: ApiCategory[],
    products: ApiProductItem[]
): ApiCategory[] {
    const map = new Map<string, ApiCategory>();

    for (const cat of apiCategories) {
        if (cat?.slug && cat?.name) {
            map.set(cat.slug, cat);
        }
    }

    for (const prod of products) {
        if (Array.isArray(prod.categories)) {
            for (const cat of prod.categories) {
                if (cat?.slug && cat?.name && !map.has(cat.slug)) {
                    map.set(cat.slug, {
                        id: cat.id,
                        name: cat.name,
                        slug: cat.slug,
                    });
                }
            }
        }
    }

    return Array.from(map.values());
}

function productBelongsToCategory(
    product: ApiProductItem,
    category: ApiCategory
): boolean {
    if (
        typeof product.primary_category_id === "number" &&
        product.primary_category_id === category.id
    ) {
        return true;
    }
    if (Array.isArray(product.categories)) {
        return product.categories.some(
            (c) => c.id === category.id || c.slug === category.slug
        );
    }
    return false;
}

function mapProductToCard(
    product: ApiProductItem,
    dividePriceBy100 = false
): TopSellingCardProps {
    const variant = product.variants?.[0];
    const rawRegular = variant?.regular_price_minor ?? 0;
    const rawEffective =
        variant?.effective_price_minor ??
        variant?.sale_price_minor ??
        rawRegular;

    const price = dividePriceBy100
        ? Number((rawEffective / 100).toFixed(2))
        : rawEffective;
    const regularPrice = dividePriceBy100
        ? Number((rawRegular / 100).toFixed(2))
        : rawRegular;
    const originalPrice = regularPrice > price ? regularPrice : undefined;

    const sortedGallery = Array.isArray(product.gallery)
        ? [...product.gallery].sort(
            (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
        )
        : [];

    const image =
        product.primary_image?.url?.trim() ||
        variant?.image_url?.trim() ||
        sortedGallery[0]?.url?.trim() ||
        "/images/product-not-found.webp";

    const featured = isFeaturedFlag(product.is_featured);

    return {
        id: product.id,
        title: product.name,
        price,
        originalPrice,
        description: product.short_description || "",
        image,
        brand: product.brand?.name,
        inStock: variant?.in_stock ?? true,
        isFeatured: featured,
        isBestSelling: !featured,
        slug: product.slug,
        variantId: variant?.id ?? product.id,
    };
}

// ==========================================
// 2. Complete HomePage Component
// ==========================================
export default function HomePage() {
    const [products, setProducts] = useState<ApiProductItem[]>([]);
    const [categories, setCategories] = useState<ApiCategory[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const controller = new AbortController();
        let active = true;

        async function loadHomeData() {
            setLoading(true);
            try {
                const [prodResult, catResult] = await Promise.allSettled([
                    fetch(getProductsApiUrl(), {
                        cache: "no-store",
                        headers: { Accept: "application/json" },
                        signal: controller.signal,
                    }),
                    fetch(getCategoriesApiUrl(), {
                        cache: "no-store",
                        headers: { Accept: "application/json" },
                        signal: controller.signal,
                    }),
                ]);

                if (!active || controller.signal.aborted) return;

                let loadedProducts: ApiProductItem[] = [];
                if (prodResult.status === "fulfilled" && prodResult.value.ok) {
                    const prodJson = await prodResult.value.json();
                    loadedProducts = extractList<ApiProductItem>(prodJson);
                }

                let loadedCategories: ApiCategory[] = [];
                if (catResult.status === "fulfilled" && catResult.value.ok) {
                    const catJson = await catResult.value.json();
                    loadedCategories = extractList<ApiCategory>(catJson);
                }

                setProducts(loadedProducts);
                setCategories(mergeCategories(loadedCategories, loadedProducts));
            } catch {
                if (active && !controller.signal.aborted) {
                    setProducts([]);
                    setCategories([]);
                }
            } finally {
                if (active && !controller.signal.aborted) {
                    setLoading(false);
                }
            }
        }

        loadHomeData();
        return () => {
            active = false;
            controller.abort();
        };
    }, []);

    const featuredProducts = useMemo(
        () => products.filter((p) => isFeaturedFlag(p.is_featured)),
        [products]
    );

    const topProducts = useMemo(
        () =>
            (featuredProducts.length > 0 ? featuredProducts : products).slice(
                0,
                6
            ),
        [featuredProducts, products]
    );

    const visibleCategories = useMemo(() => {
        const valid = categories.filter((c) => Boolean(c.slug));
        if (valid.length === 0) return [];

        const matched = valid.filter((cat) =>
            products.some((prod) => productBelongsToCategory(prod, cat))
        );
        const unmatched = valid.filter(
            (cat) => !matched.some((m) => m.slug === cat.slug)
        );

        const combined = [...shuffleArray(matched), ...shuffleArray(unmatched)];
        return combined.slice(0, MAX_VISIBLE_CATEGORIES);
    }, [categories, products]);

    const sliderCategory = visibleCategories[0] ?? null;
    const gridCategories = visibleCategories.slice(1);
    const firstGridCategory = gridCategories[0] ?? null;
    const remainingGridCategories = gridCategories.slice(1);

    return (
        <div className="container mx-auto px-4 py-8">
            {/* ১. হিরো স্লাইডার */}
            <HeroSlider />

            {/* ২. ফিচার্ড ক্যাটাগরি */}
            <FeaturedCategories align="center" />

            {/* ৩. ফিচার্ড ও টপ প্রোডাক্টস (টপ সেকশন) */}
            <section className="mb-12">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-green-600 dark:text-green-400">
                            <Sparkles className="w-3.5 h-3.5" />
                            {featuredProducts.length > 0
                                ? "Featured Picks"
                                : "Most Popular"}
                        </span>
                        <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight mt-0.5">
                            Featured & Top Selling Products
                        </h2>
                    </div>

                    <Link
                        href="/products"
                        className="text-xs md:text-sm font-semibold text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors flex items-center gap-1 group"
                    >
                        <span>View All</span>
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                        {Array.from({ length: 4 }).map((_, index) => (
                            <TopSellingCardSkeleton key={index} />
                        ))}
                    </div>
                ) : topProducts.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                        {topProducts.map((product) => (
                            <TopSellingCard
                                key={product.id}
                                {...mapProductToCard(product, false)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 p-8 text-center text-sm text-gray-500">
                        No products available right now.
                    </div>
                )}
            </section>

            {/* ৪. ব্র্যান্ড সেকশন */}
            <BrandSection />

            {/* ৫. ক্যাটাগরি স্লাইডার সেকশন (Reload-e rotate hobe) */}
            {sliderCategory && (
                <CategoryProductSliderSection
                    key={sliderCategory.id}
                    title={sliderCategory.name}
                    subtitle="Slide Through Collection"
                    categorySlug={sliderCategory.slug}
                    products={products as never[]}
                    viewAllLink={`/categories/${sliderCategory.slug}/products`}
                />
            )}

            {/* ৬. প্রথম ডাইনামিক ক্যাটাগরি সেকশন */}
            {firstGridCategory && (
                <CategoryProductSection
                    key={firstGridCategory.id}
                    title={firstGridCategory.name}
                    subtitle={`Explore Our ${firstGridCategory.name} Collection`}
                    categorySlug={firstGridCategory.slug}
                    products={products as never[]}
                    viewAllLink={`/categories/${firstGridCategory.slug}/products`}
                />
            )}

            <CallToAction />

            {/* ৭. বাকি ডাইনামিক ক্যাটাগরি সেকশনসমূহ */}
            {remainingGridCategories.map((cat) => (
                <CategoryProductSection
                    key={cat.id}
                    title={cat.name}
                    subtitle={`Explore Our ${cat.name} Collection`}
                    categorySlug={cat.slug}
                    products={products as never[]}
                    viewAllLink={`/categories/${cat.slug}/products`}
                />
            ))}

            <div className="-mx-4 w-[calc(100%+2rem)]">
                <FullBgCTA />
            </div>

            {/* ৮. বেস্ট সেলিং সেকশন */}
            <BestSellingProducts products={products as never[]} />
        </div>
    );
}