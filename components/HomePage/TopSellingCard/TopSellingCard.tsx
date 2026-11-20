"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    ShoppingCart,
    ShoppingBag,
    ArrowRight,
    Heart,
    Sparkles,
    CheckCircle2,
    XCircle,
} from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { flyToCart } from "@/utils/flyToCart";

// ==========================================
// 1. Types & Helpers
// ==========================================
export interface DynamicProductVariant {
    id: number;
    sku?: string | null;
    regular_price_minor: number;
    sale_price_minor?: number | null;
    effective_price_minor: number;
    in_stock: boolean;
    image_url?: string | null;
}

export interface DynamicProductImage {
    id: number;
    url: string;
    alt?: string | null;
    sort_order?: number;
}

export interface DynamicApiProduct {
    id: number;
    name: string;
    slug: string;
    short_description?: string | null;
    is_featured?: boolean | number | string | null;
    badges?: string[];
    brand?: { id: number; name: string; slug: string } | null;
    categories?: { id: number; name: string; slug: string }[];
    variants?: DynamicProductVariant[];
    primary_image?: DynamicProductImage | null;
    gallery?: DynamicProductImage[];
}

export interface TopSellingCardProps {
    id: number;
    title: string;
    price: number;
    originalPrice?: number;
    image: string;
    isBestSelling?: boolean;
    isFeatured?: boolean;
    brand?: string;
    inStock?: boolean;
    description?: string;
    slug?: string;
    variantId?: number | null;
    currencySymbol?: string;
}

function cleanText(text?: string | null): string {
    if (!text) return "";
    return text
        .replace(/<[^>]*>?/gm, "")
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'");
}

function isFeaturedValue(val: unknown): boolean {
    return val === true || val === 1 || val === "1" || val === "true";
}

function resolveApiUrl(path: string): string {
    const rawBase =
        process.env.NEXT_PUBLIC_API_BASE_URL?.trim() ||
        process.env.NEXT_PUBLIC_API_URL?.trim() ||
        "https://ecommerce.flixzaglobal.us/api/v1";
    const cleanBase = rawBase.replace(/\/+$/, "");
    if (cleanBase.endsWith("/api/v1")) {
        return `${cleanBase}${path}`;
    }
    return `${cleanBase}/api/v1${path}`;
}

function mapProductToCardProps(
    product: DynamicApiProduct,
    isMinorUnit = false
): TopSellingCardProps {
    const variant = product.variants?.[0];
    const rawRegular = variant?.regular_price_minor ?? 0;
    const rawEffective =
        variant?.effective_price_minor ??
        variant?.sale_price_minor ??
        rawRegular;

    const price = isMinorUnit
        ? Number((rawEffective / 100).toFixed(2))
        : rawEffective;
    const regularPrice = isMinorUnit
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

    const featured = isFeaturedValue(product.is_featured);

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

// এই কম্পোনেন্টটি আপনার ফাইলে থাকতে হবে
export function TopSellingCardSkeleton() {
    return (
        <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800/60 overflow-hidden flex flex-col sm:flex-row items-stretch gap-4 sm:gap-5 p-4 sm:p-5 min-h-[220px] sm:min-h-[250px] animate-pulse">
            {/* Ribbon Placeholder */}
            <div className="absolute top-0 right-0 h-7 w-24 rounded-bl-xl bg-emerald-100 dark:bg-emerald-950/50" />

            {/* Image Placeholder */}
            <div className="w-full h-44 sm:w-40 sm:h-44 shrink-0 bg-gray-200/80 dark:bg-gray-800 rounded-xl" />

            {/* Content Placeholder */}
            <div className="flex flex-col flex-1 justify-between py-0.5 sm:mt-2 min-w-0">
                <div className="space-y-3">
                    <div className="flex gap-2">
                        <div className="h-3 w-20 bg-emerald-100 dark:bg-emerald-900/40 rounded" />
                        <div className="h-3 w-16 bg-gray-200 dark:bg-gray-800 rounded" />
                    </div>
                    <div className="h-5 w-3/4 bg-gray-200 dark:bg-gray-800 rounded" />
                    <div className="h-7 w-16 bg-orange-100 dark:bg-orange-950/40 rounded" />
                    <div className="space-y-2 pt-2">
                        <div className="h-3 w-full bg-gray-100 dark:bg-gray-800/80 rounded" />
                        <div className="h-3 w-2/3 bg-gray-100 dark:bg-gray-800/80 rounded" />
                    </div>
                </div>

                {/* Buttons Placeholder */}
                <div className="flex gap-2 mt-4">
                    <div className="h-8 w-24 bg-gray-200 dark:bg-gray-800 rounded-md" />
                    <div className="h-8 w-24 bg-orange-100 dark:bg-orange-950/40 rounded-md" />
                </div>
            </div>
        </div>
    );
}

// ==========================================
// 3. TopSellingCard Component
// ==========================================
export function TopSellingCard({
    id,
    title,
    price,
    originalPrice,
    image,
    description,
    isBestSelling = false,
    isFeatured = false,
    brand,
    inStock = true,
    slug,
    variantId,
    currencySymbol = "$",
}: TopSellingCardProps) {
    const { addItem, toggleCart } = useCartStore();
    const {
        addItem: addWishlistItem,
        removeItem: removeWishlistItem,
        isInWishlist,
        isHydrated,
    } = useWishlistStore();
    const router = useRouter();

    const imageRef = useRef<HTMLDivElement>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const isWishlisted = mounted && isHydrated ? isInWishlist(id) : false;
    const resolvedVariantId = variantId ?? id;
    const cleanTitle = cleanText(title);
    const cleanDescription = cleanText(description);
    const cleanBrand = cleanText(brand);

    const handleAddToCart = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!inStock) return;
        if (imageRef.current) {
            flyToCart(image, imageRef.current);
        }
        await addItem({
            id,
            title: cleanTitle,
            price,
            image,
            variantId: resolvedVariantId,
            quantity: 1,
        });
        setTimeout(() => {
            toggleCart();
        }, 800);
    };

    const handleBuyNow = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!inStock) return;
        await addItem({
            id,
            title: cleanTitle,
            price,
            image,
            variantId: resolvedVariantId,
            quantity: 1,
        });
        router.push("/checkout");
    };

    const handleWishlist = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isWishlisted) {
            removeWishlistItem(id);
        } else {
            addWishlistItem({ id, title: cleanTitle, price, image });
            if (imageRef.current) {
                flyToCart(image, imageRef.current, "wishlist-icon-target");
            }
        }
    };

    const handleCardClick = () => {
        const productSlug = slug || id;
        router.push(`/products/${productSlug}`);
    };

    const discount =
        originalPrice && originalPrice > price
            ? Number((originalPrice - price).toFixed(2))
            : 0;

    return (
        <div
            onClick={handleCardClick}
            className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-gray-100 dark:border-gray-800/60 overflow-hidden flex flex-col sm:flex-row items-stretch gap-4 sm:gap-5 p-4 sm:p-5 group hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:border-orange-500/30 hover:-translate-y-1 transition-all duration-300 min-h-[220px] sm:min-h-[250px] cursor-pointer"
        >
            {(isBestSelling || isFeatured) && (
                <div
                    className={`absolute top-0 right-0 text-white text-[11px] font-semibold px-3 py-1.5 rounded-bl-xl flex items-center gap-1.5 z-10 shadow-sm tracking-wide ${isFeatured
                        ? "bg-gradient-to-r from-emerald-500 to-emerald-600"
                        : "bg-gradient-to-r from-red-500 to-red-600"
                        }`}
                >
                    {isFeatured ? (
                        <>
                            <Sparkles className="h-3.5 w-3.5" />
                            <span>Featured</span>
                        </>
                    ) : (
                        <>
                            <ShoppingBag className="h-3.5 w-3.5" />
                            <span>Best Selling</span>
                        </>
                    )}
                </div>
            )}

            <div
                ref={imageRef}
                className="relative w-full h-44 sm:w-40 sm:h-44 shrink-0 bg-gray-50/70 dark:bg-gray-800/40 rounded-xl overflow-hidden flex items-center justify-center p-3 group/img"
            >
                <img
                    src={image}
                    alt={cleanTitle}
                    loading="lazy"
                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500 ease-out mix-blend-multiply dark:mix-blend-normal"
                />

                <button
                    type="button"
                    onClick={handleWishlist}
                    aria-label="Toggle wishlist"
                    className={`absolute top-2 left-2 w-8 h-8 flex items-center justify-center rounded-full shadow-md transition-all z-20 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 cursor-pointer ${isWishlisted
                        ? "bg-red-500 text-white"
                        : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-red-500 hover:text-white"
                        }`}
                >
                    <Heart
                        className={`h-4 w-4 ${isWishlisted ? "fill-current" : ""}`}
                    />
                </button>
            </div>

            <div className="flex flex-col flex-1 justify-between py-0.5 sm:mt-2 min-w-0">
                <div>
                    <div className="flex items-center gap-2 mb-1 pr-24">
                        {cleanBrand && (
                            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 truncate">
                                {cleanBrand}
                            </span>
                        )}
                        <span
                            className={`inline-flex items-center gap-1 text-[11px] font-semibold shrink-0 ${inStock
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-rose-500"
                                }`}
                        >
                            {inStock ? (
                                <>
                                    <CheckCircle2 className="h-3 w-3" />
                                    In Stock
                                </>
                            ) : (
                                <>
                                    <XCircle className="h-3 w-3" />
                                    Out of Stock
                                </>
                            )}
                        </span>
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-gray-800 dark:text-gray-100 line-clamp-2 mb-1.5 group-hover:text-orange-600 transition-colors">
                        {cleanTitle}
                    </h3>

                    <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-xl sm:text-2xl font-black text-[#f76b1c] tracking-tight">
                            {currencySymbol}
                            {price}
                        </span>
                        {originalPrice && originalPrice > price && (
                            <span className="text-xs sm:text-sm text-gray-400 line-through font-medium">
                                {currencySymbol}
                                {originalPrice}
                            </span>
                        )}
                    </div>

                    {discount > 0 && (
                        <div className="mb-2.5">
                            <span className="inline-flex items-center bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400 text-[11px] font-bold px-2.5 py-0.5 rounded-md border border-green-100 dark:border-green-900/50">
                                Save {currencySymbol}
                                {discount}
                            </span>
                        </div>
                    )}

                    {cleanDescription && (
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                            {cleanDescription}
                        </p>
                    )}
                </div>

                <div className="flex flex-wrap items-center gap-2 mt-auto pt-2">
                    <button
                        type="button"
                        onClick={handleAddToCart}
                        disabled={!inStock}
                        className="flex items-center justify-center gap-1 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 py-1.5 px-3 rounded-md hover:border-[#f76b1c] hover:text-[#f76b1c] transition-all text-[11px] sm:text-xs font-semibold cursor-pointer shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ShoppingCart className="h-3.5 w-3.5" />
                        <span>Add To Cart</span>
                    </button>

                    <button
                        type="button"
                        onClick={handleBuyNow}
                        disabled={!inStock}
                        className="flex items-center justify-center gap-1 bg-[#f76b1c] text-white py-1.5 px-3 rounded-md hover:bg-[#e05a12] transition-all text-[11px] sm:text-xs font-semibold cursor-pointer shadow-xs hover:shadow-md shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span>Buy Now</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                </div>
            </div>
        </div>
    );
}

// ==========================================
// 4. Featured & Top Selling Section Component
// ==========================================
export function FeaturedTopSellingSection({
    initialProducts = [],
}: {
    initialProducts?: DynamicApiProduct[];
}) {
    const [products, setProducts] = useState<DynamicApiProduct[]>(initialProducts);
    const [loading, setLoading] = useState(initialProducts.length === 0);

    useEffect(() => {
        let active = true;
        async function loadProducts() {
            try {
                const url = resolveApiUrl("/products?per_page=50");
                const res = await fetch(url, { cache: "no-store" });
                if (!res.ok) return;
                const json = await res.json();
                const list: DynamicApiProduct[] = Array.isArray(json?.data)
                    ? json.data
                    : Array.isArray(json?.data?.data)
                        ? json.data.data
                        : [];
                if (active && list.length > 0) {
                    setProducts(list);
                }
            } catch {
                // keep existing products
            } finally {
                if (active) setLoading(false);
            }
        }
        loadProducts();
        return () => {
            active = false;
        };
    }, []);

    // ✅ displayList এখানে ডিফাইন করা হয়েছে
    const featuredProducts = products.filter((p) =>
        isFeaturedValue(p.is_featured)
    );
    const displayList = (
        featuredProducts.length > 0 ? featuredProducts : products
    ).slice(0, 6);

    return (
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

            {/* ✅ loading condition - এখানে কোনো টেক্সট বা স্পিনার নেই */}
            {loading ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <TopSellingCardSkeleton key={index} />
                    ))}
                </div>
            ) : displayList.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                    {displayList.map((product) => (
                        <TopSellingCard
                            key={product.id}
                            {...mapProductToCardProps(product, false)}
                        />
                    ))}
                </div>
            ) : (
                <div className="rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 p-8 text-center text-sm text-gray-500">
                    No products available right now.
                </div>
            )}
        </section>
    );
}