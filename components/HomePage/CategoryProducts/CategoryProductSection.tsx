"use client";

import React, { useMemo, useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
    ArrowRight,
    ShoppingCart,
    Sparkles,
    CheckCircle2,
    XCircle,
    Heart,
    Eye,
} from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import {
    ProductQuickViewModal,
    type QuickViewProduct,
} from "@/components/Products/ProductQuickViewModal";
import { flyToCart } from "@/utils/flyToCart";

export interface CategoryRef {
    id: number;
    name: string;
    slug: string;
}

export interface BrandRef {
    id: number;
    name: string;
    slug: string;
}

export interface ImageRef {
    id: number;
    url: string;
    alt?: string | null;
    is_primary?: boolean;
    sort_order?: number;
}

export interface VariantRef {
    id: number;
    sku?: string | null;
    regular_price_minor: number;
    sale_price_minor?: number | null;
    effective_price_minor: number;
    in_stock: boolean;
    image_url?: string | null;
}

export interface CategoryProductItem {
    id: number;
    name?: string;
    title?: string;
    slug: string;
    short_description?: string | null;
    is_featured?: boolean;
    badges?: string[];
    primary_category_id?: number | null;
    brand?: BrandRef | null;
    categories?: CategoryRef[];
    category?: CategoryRef | null;
    variants?: VariantRef[];
    primary_image?: ImageRef | null;
    gallery?: ImageRef[];
    image?: string;
    price?: number;
    originalPrice?: number;
}

interface CategoryProductSectionProps {
    title: string;
    subtitle?: string;
    categorySlug: string;
    products?: CategoryProductItem[];
    viewAllLink?: string;
    maxItems?: number;
    currencySymbol?: string;
    isMinorUnit?: boolean;
    hideWhenEmpty?: boolean;
    onAddToCart?: (product: CategoryProductItem, variant?: VariantRef) => void;
}

const DEFAULT_API_BASE = "https://ecommerce.flixzaglobal.us/api/v1";

function resolveApiBase(): string {
    const raw =
        process.env.NEXT_PUBLIC_API_BASE_URL?.trim() ||
        process.env.NEXT_PUBLIC_API_URL?.trim() ||
        DEFAULT_API_BASE;
    const clean = raw.replace(/\/+$/, "");
    return clean.endsWith("/api/v1") ? clean : `${clean}/api/v1`;
}

const decodeHtmlEntities = (text?: string | null) => {
    if (!text) return "";
    return text
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">");
};

const SectionProductCardSkeleton = () => {
    return (
        <div
            aria-hidden="true"
            className="flex flex-col h-full bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-sm overflow-hidden animate-pulse"
        >
            <div className="w-full aspect-square bg-gray-200/80 dark:bg-gray-800" />
            <div className="flex flex-col justify-between flex-1 p-4 space-y-3">
                <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                        <div className="h-3 w-20 rounded bg-emerald-100 dark:bg-emerald-900/40" />
                        <div className="h-3 w-14 rounded bg-gray-200 dark:bg-gray-800" />
                    </div>
                    <div className="h-4 w-4/5 rounded bg-gray-200 dark:bg-gray-800" />
                    <div className="space-y-1.5 pt-1">
                        <div className="h-3 w-full rounded bg-gray-100 dark:bg-gray-800/80" />
                        <div className="h-3 w-2/3 rounded bg-gray-100 dark:bg-gray-800/80" />
                    </div>
                </div>
                <div className="pt-2.5 mt-auto border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-2">
                    <div className="h-5 w-16 rounded bg-gray-200 dark:bg-gray-800" />
                    <div className="h-8 w-16 rounded-xl bg-emerald-100 dark:bg-emerald-950/50" />
                </div>
            </div>
        </div>
    );
};

interface SectionProductCardProps {
    product: CategoryProductItem;
    currencySymbol: string;
    isMinorUnit: boolean;
    onAddToCart?: (product: CategoryProductItem, variant?: VariantRef) => void;
    onOpenQuickView: (quickViewData: QuickViewProduct) => void;
}

const SectionProductCard = ({
    product,
    currencySymbol,
    isMinorUnit,
    onAddToCart,
    onOpenQuickView,
}: SectionProductCardProps) => {
    const addCartItem = useCartStore((state) => state.addItem);
    const toggleCart = useCartStore((state) => state.toggleCart);

    const addWishlistItem = useWishlistStore((state) => state.addItem);
    const removeWishlistItem = useWishlistStore((state) => state.removeItem);
    const isInWishlist = useWishlistStore((state) => state.isInWishlist);
    const isWishlistHydrated = useWishlistStore((state) => state.isHydrated);

    const [mounted, setMounted] = useState(false);
    const [imgSrc, setImgSrc] = useState<string>("/images/product-not-found.webp");
    const imageBoxRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    const primaryVariant = product.variants?.[0];
    const inStock = primaryVariant?.in_stock ?? true;

    const rawRegular =
        primaryVariant?.regular_price_minor ??
        product.originalPrice ??
        product.price ??
        0;

    const rawEffective =
        primaryVariant?.effective_price_minor ??
        primaryVariant?.sale_price_minor ??
        product.price ??
        rawRegular;

    const regularPrice = isMinorUnit ? rawRegular / 100 : rawRegular;
    const effectivePrice = isMinorUnit ? rawEffective / 100 : rawEffective;

    const hasDiscount =
        regularPrice > 0 && effectivePrice > 0 && effectivePrice < regularPrice;
    const discountPercent = hasDiscount
        ? Math.round(((regularPrice - effectivePrice) / regularPrice) * 100)
        : 0;

    const sortedGallery = Array.isArray(product.gallery)
        ? [...product.gallery].sort(
            (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
        )
        : [];

    const resolvedImage =
        primaryVariant?.image_url ||
        product.primary_image?.url ||
        sortedGallery[0]?.url ||
        product.image ||
        "/images/product-not-found.webp";

    useEffect(() => {
        setImgSrc(resolvedImage);
    }, [resolvedImage]);

    const productName = decodeHtmlEntities(
        product.name || product.title || "Untitled Product"
    );
    const imageAlt = decodeHtmlEntities(
        product.primary_image?.alt || productName
    );
    const brandName = decodeHtmlEntities(product.brand?.name);
    const categoryName = decodeHtmlEntities(
        product.categories?.[0]?.name || product.category?.name
    );

    const isWishlisted =
        mounted && isWishlistHydrated ? isInWishlist(product.id) : false;

    const galleryUrls = useMemo(() => {
        const list = [
            resolvedImage,
            ...sortedGallery.map((g) => g.url).filter(Boolean),
        ];
        return Array.from(new Set(list));
    }, [resolvedImage, sortedGallery]);

    const buildQuickViewPayload = (): QuickViewProduct => ({
        id: product.id,
        title: productName,
        price: effectivePrice,
        originalPrice: hasDiscount ? regularPrice : undefined,
        image: imgSrc,
        slug: product.slug,
        brand: brandName || categoryName || undefined,
        inStock,
        gallery: galleryUrls,
        description: product.short_description || undefined,
        variantId: primaryVariant?.id ?? product.id,
        currencySymbol,
    });

    const handleToggleWishlist = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (isWishlisted) {
            removeWishlistItem(product.id);
        } else {
            addWishlistItem({
                id: product.id,
                title: productName,
                price: effectivePrice,
                image: imgSrc,
            });
            if (imageBoxRef.current) {
                flyToCart(imgSrc, imageBoxRef.current, "wishlist-icon-target");
            }
        }
    };

    const handleQuickViewClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();
        onOpenQuickView(buildQuickViewPayload());
    };

    const handleAddClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (!inStock) return;

        if (imageBoxRef.current) {
            flyToCart(imgSrc, imageBoxRef.current);
        }

        if (onAddToCart) {
            onAddToCart(product, primaryVariant);
        } else {
            await addCartItem({
                id: product.id,
                title: productName,
                price: effectivePrice,
                image: imgSrc,
                variantId: primaryVariant?.id ?? product.id,
                quantity: 1,
            });
            setTimeout(() => {
                toggleCart();
            }, 700);
        }
    };

    const formatPrice = (amount: number) => {
        try {
            return new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: currencySymbol === "$" ? "USD" : "BDT",
            }).format(amount);
        } catch {
            return `${currencySymbol}${amount.toFixed(2)}`;
        }
    };

    return (
        <article className="group relative flex flex-col h-full bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-sm hover:shadow-lg hover:border-emerald-500/40 transition-all duration-300 overflow-hidden">
            <div
                ref={imageBoxRef}
                className="relative w-full aspect-square bg-gray-50 dark:bg-gray-800/60 overflow-hidden"
            >
                <Link
                    href={`/products/${product.slug}`}
                    className="block w-full h-full focus:outline-none"
                    aria-label={`View ${productName}`}
                >
                    <Image
                        src={imgSrc}
                        alt={imageAlt}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        loading="lazy"
                        className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                        onError={() => setImgSrc("/images/product-not-found.webp")}
                    />
                </Link>

                {/* Top-Left Badges */}
                <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10 pointer-events-none">
                    {hasDiscount && (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-600 text-white shadow-sm">
                            -{discountPercent}%
                        </span>
                    )}
                    {product.is_featured && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-600 text-white shadow-sm">
                            <Sparkles className="w-3 h-3" />
                            Featured
                        </span>
                    )}
                </div>

                {/* Top-Right Heart & Quick View Action Buttons */}
                <div className="absolute top-2.5 right-2.5 flex flex-col gap-2 z-20">
                    <button
                        type="button"
                        onClick={handleToggleWishlist}
                        aria-label={
                            isWishlisted
                                ? `Remove ${productName} from wishlist`
                                : `Add ${productName} to wishlist`
                        }
                        className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all cursor-pointer opacity-100 sm:opacity-0 sm:group-hover:opacity-100 ${isWishlisted
                                ? "bg-rose-500 text-white opacity-100"
                                : "bg-white/95 dark:bg-gray-800/95 text-gray-700 dark:text-gray-200 hover:bg-rose-500 hover:text-white"
                            }`}
                    >
                        <Heart
                            className={`w-4 h-4 ${isWishlisted ? "fill-current" : ""}`}
                        />
                    </button>

                    <button
                        type="button"
                        onClick={handleQuickViewClick}
                        aria-label={`Quick view ${productName}`}
                        className="w-8 h-8 rounded-full bg-white/95 dark:bg-gray-800/95 text-gray-700 dark:text-gray-200 hover:bg-emerald-600 hover:text-white flex items-center justify-center shadow-md transition-all cursor-pointer opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                    >
                        <Eye className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="flex flex-col justify-between flex-1 p-4">
                <div>
                    <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 truncate">
                            {brandName || categoryName || "Featured"}
                        </span>
                        <span
                            className={`inline-flex items-center gap-1 text-[11px] font-semibold shrink-0 ${inStock
                                    ? "text-emerald-600 dark:text-emerald-400"
                                    : "text-rose-500"
                                }`}
                        >
                            {inStock ? (
                                <>
                                    <CheckCircle2 className="w-3 h-3" />
                                    In Stock
                                </>
                            ) : (
                                <>
                                    <XCircle className="w-3 h-3" />
                                    Sold Out
                                </>
                            )}
                        </span>
                    </div>

                    <Link href={`/products/${product.slug}`} className="block">
                        <h3 className="text-sm md:text-base font-bold text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-1 mb-1">
                            {productName}
                        </h3>
                    </Link>

                    {product.short_description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3 leading-relaxed">
                            {decodeHtmlEntities(product.short_description)}
                        </p>
                    )}
                </div>

                <div className="pt-2.5 mt-auto border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-2">
                    <div className="flex items-baseline gap-1.5 min-w-0">
                        <span className="text-sm md:text-base font-extrabold text-gray-900 dark:text-white truncate">
                            {formatPrice(effectivePrice)}
                        </span>
                        {hasDiscount && (
                            <span className="text-xs text-gray-400 line-through truncate">
                                {formatPrice(regularPrice)}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                        <button
                            type="button"
                            onClick={handleQuickViewClick}
                            className="h-8 px-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-emerald-600 hover:text-white text-gray-800 dark:text-gray-200 text-xs font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer"
                            aria-label={`Quick view ${productName}`}
                        >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View</span>
                        </button>

                        <button
                            type="button"
                            disabled={!inStock}
                            onClick={handleAddClick}
                            className={`h-8 px-3 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition-all cursor-pointer ${inStock
                                    ? "bg-emerald-600 hover:bg-emerald-700 text-white active:scale-95"
                                    : "bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
                                }`}
                            aria-label={
                                inStock
                                    ? `Add ${productName} to cart`
                                    : `${productName} is out of stock`
                            }
                        >
                            <ShoppingCart className="w-3.5 h-3.5" />
                            <span>{inStock ? "Add" : "Out"}</span>
                        </button>
                    </div>
                </div>
            </div>
        </article>
    );
};

export const CategoryProductSection = ({
    title,
    subtitle = "Shop by Category",
    categorySlug,
    products = [],
    viewAllLink,
    maxItems = 8,
    currencySymbol = "$",
    isMinorUnit = false,
    hideWhenEmpty = false,
    onAddToCart,
}: CategoryProductSectionProps) => {
    const [apiProducts, setApiProducts] = useState<CategoryProductItem[]>([]);
    const [categoryId, setCategoryId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(Boolean(categorySlug));
    const [error, setError] = useState<string | null>(null);
    const [quickViewProduct, setQuickViewProduct] =
        useState<QuickViewProduct | null>(null);

    useEffect(() => {
        let active = true;
        const baseUrl = resolveApiBase();

        async function loadCategoryData() {
            setIsLoading(true);
            setError(null);
            try {
                const [catRes, prodRes] = await Promise.all([
                    fetch(`${baseUrl}/categories/${encodeURIComponent(categorySlug)}`, {
                        headers: { Accept: "application/json" },
                        cache: "no-store",
                    }),
                    fetch(
                        `${baseUrl}/categories/${encodeURIComponent(categorySlug)}/products?per_page=20`,
                        {
                            headers: { Accept: "application/json" },
                            cache: "no-store",
                        }
                    ),
                ]);

                if (catRes.ok) {
                    const catJson = await catRes.json();
                    const catData = catJson?.data ?? catJson;
                    if (active && typeof catData?.id === "number") {
                        setCategoryId(catData.id);
                    }
                }

                if (prodRes.ok) {
                    const prodJson = await prodRes.json();
                    const items = Array.isArray(prodJson?.data) ? prodJson.data : [];
                    if (active) {
                        setApiProducts(items);
                    }
                } else {
                    throw new Error("Failed to fetch products");
                }
            } catch (err) {
                if (active) {
                    setError(
                        err instanceof Error ? err.message : "An unknown error occurred"
                    );
                }
            } finally {
                if (active) {
                    setIsLoading(false);
                }
            }
        }

        if (categorySlug) {
            loadCategoryData();
        } else {
            setIsLoading(false);
        }

        return () => {
            active = false;
        };
    }, [categorySlug]);

    const displayProducts = useMemo(() => {
        if (apiProducts.length > 0) {
            return typeof maxItems === "number"
                ? apiProducts.slice(0, maxItems)
                : apiProducts;
        }

        const matched = products.filter((product) => {
            const matchesArray = Array.isArray(product.categories)
                ? product.categories.some((cat) => cat.slug === categorySlug)
                : false;
            const matchesSingle = product.category?.slug === categorySlug;
            const matchesPrimaryId =
                categoryId !== null && product.primary_category_id === categoryId;
            return matchesArray || matchesSingle || matchesPrimaryId;
        });

        return typeof maxItems === "number" ? matched.slice(0, maxItems) : matched;
    }, [apiProducts, products, categorySlug, categoryId, maxItems]);

    const resolvedViewAllHref = viewAllLink || `/category/${categorySlug}`;

    if (!isLoading && displayProducts.length === 0 && hideWhenEmpty) {
        return null;
    }

    const skeletonCount = typeof maxItems === "number" ? Math.min(maxItems, 4) : 4;

    return (
        <section className="mb-14 w-full">
            <div className="flex items-end justify-between gap-4 mb-6">
                <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                        {subtitle}
                    </span>
                    <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white mt-0.5 tracking-tight">
                        {title}
                    </h2>
                </div>
                <Link
                    href={resolvedViewAllHref}
                    className="text-xs md:text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors inline-flex items-center gap-1 shrink-0 group"
                >
                    <span>View All</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    {Array.from({ length: skeletonCount }).map((_, idx) => (
                        <SectionProductCardSkeleton key={idx} />
                    ))}
                </div>
            ) : error ? (
                <div className="rounded-2xl border border-dashed border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-900/20 p-8 text-center">
                    <p className="text-sm font-medium text-rose-600 dark:text-rose-400">
                        Failed to load products. Please try again later.
                    </p>
                </div>
            ) : displayProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    {displayProducts.map((product) => (
                        <SectionProductCard
                            key={product.id}
                            product={product}
                            currencySymbol={currencySymbol}
                            isMinorUnit={isMinorUnit}
                            onAddToCart={onAddToCart}
                            onOpenQuickView={(item) => setQuickViewProduct(item)}
                        />
                    ))}
                </div>
            ) : (
                <div className="rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/40 p-8 text-center">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        No products currently assigned to{" "}
                        <span className="font-bold">{categorySlug}</span>.
                    </p>
                    <Link
                        href={resolvedViewAllHref}
                        className="inline-flex items-center gap-1.5 mt-3 text-xs font-bold text-emerald-600 hover:underline"
                    >
                        <span>Browse category page</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                </div>
            )}

            {quickViewProduct && (
                <ProductQuickViewModal
                    isOpen={Boolean(quickViewProduct)}
                    onClose={() => setQuickViewProduct(null)}
                    product={quickViewProduct}
                />
            )}
        </section>
    );
};

export default CategoryProductSection;