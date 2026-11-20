"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";
import { BestSellingProducts } from "@/components/HomePage/BestSellingProducts/BestSellingProducts";
import { BrandSection } from "@/components/HomePage/BrandSection/BrandSection";
import { CallToAction } from "@/components/HomePage/CallToAction/CallToAction";
import { FullBgCTA } from "@/components/HomePage/CallToAction/FullBgCTA";
import { FeaturedCategories } from "@/components/HomePage/Category/FeaturedCategories";
import { CategoryProductSection } from "@/components/HomePage/CategoryProducts/CategoryProductSection";
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

const DEFAULT_API_BASE = "https://ecommerce.flixzaglobal.us/api/v1";

function getProductsApiUrl(): string {
    const raw =
        process.env.NEXT_PUBLIC_API_BASE_URL?.trim() ||
        process.env.NEXT_PUBLIC_API_URL?.trim() ||
        DEFAULT_API_BASE;
    const clean = raw.replace(/\/+$/, "");
    if (clean.endsWith("/api/v1")) {
        return `${clean}/products?per_page=20&page=1`;
    }
    return `${clean}/api/v1/products?per_page=20&page=1`;
}

function isFeaturedFlag(val: unknown): boolean {
    return val === true || val === 1 || val === "1" || val === "true";
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
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;

        async function loadProducts() {
            setLoading(true);
            try {
                const url = getProductsApiUrl();
                const res = await fetch(url, { cache: "no-store" });
                if (!res.ok) {
                    if (active) setProducts([]);
                    return;
                }

                const json = await res.json();
                const list: ApiProductItem[] = Array.isArray(json?.data)
                    ? json.data
                    : Array.isArray(json?.data?.data)
                    ? json.data.data
                    : json?.data && typeof json.data === "object"
                    ? [json.data]
                    : [];

                if (active) {
                    setProducts(list);
                }
            } catch {
                if (active) setProducts([]);
            } finally {
                if (active) setLoading(false);
            }
        }

        loadProducts();
        return () => {
            active = false;
        };
    }, []);

    const featuredProducts = products.filter((p) =>
        isFeaturedFlag(p.is_featured)
    );
    const topProducts = (
        featuredProducts.length > 0 ? featuredProducts : products
    ).slice(0, 6);

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
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                        {Array.from({ length: 4 }).map((_, index) => (
                            <TopSellingCardSkeleton key={index} />
                        ))}
                    </div>
                ) : topProducts.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
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

            {/* ৫. ক্যাটাগরি সেকশন: Bath & Body Fragrance */}
            <CategoryProductSection
                title="Bath Body Fregrance"
                subtitle="Explore Our Designer Body Oil Collection"
                categorySlug="bath-body-fragrance"
                products={products as never[]}
                viewAllLink="/categories/bath-body-fragrance/products"
            />

            <CallToAction />

            {/* ৬. অতিরিক্ত ক্যাটাগরি সেকশনসমূহ */}
            <CategoryProductSection
                title="Designer Body Oil"
                subtitle="Explore Our Designer Body Oil Collection"
                categorySlug="designer-body-oil"
                products={products as never[]}
                viewAllLink="/categories/designer-body-oil/products"
            />

            <CategoryProductSection
                title="Fragrance On Sale"
                subtitle="Premium Quality Cooking Essentials"
                categorySlug="fragrance-on-sale"
                products={products as never[]}
                viewAllLink="/category/fragrance-on-sale/products"
            />

            <CategoryProductSection
                title="Musk Amber & Oud"
                subtitle="Fruity Fragrance"
                categorySlug="musk-amber-oud"
                products={products as never[]}
                viewAllLink="/category/musk-amber-oud/products"
            />

            <div className="-mx-4 w-[calc(100%+2rem)]">
                <FullBgCTA />
            </div>

            {/* ৭. বেস্ট সেলিং সেকশন */}
            <BestSellingProducts products={products as never[]} />
        </div>
    );
}