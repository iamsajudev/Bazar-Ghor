"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
    ChevronRight,
    SlidersHorizontal,
    Grid,
    List,
    X,
    ChevronDown,
    Loader2,
    PackageSearch,
    ChevronLeft,
    Search,
    Eye,
    Heart,
    ShoppingCart,
    ArrowRight,
    Minus,
    Plus,
    Sparkles,
    RotateCcw,
} from "lucide-react";
import { useCategoryProducts, ProductSort, ApiProduct } from "@/hook/useCategoryProducts";
import { useBrands } from "@/hook/useBrands";
import { formatPrice } from "@/utils/format";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { flyToCart } from "@/utils/flyToCart";

// --- Types & Interfaces ---
interface CategoryImageObject {
    id?: number;
    url?: string | null;
    alt?: string | null;
}

interface ProductVariantData {
    id?: number;
    sku?: string | null;
    regular_price_minor?: number | null;
    sale_price_minor?: number | null;
    effective_price_minor?: number | null;
    price_minor?: number | null;
    in_stock?: boolean | null;
    image_url?: string | null;
    thumbnail_url?: string | null;
}

interface ExtendedProduct extends Omit<ApiProduct, "in_stock"> {
    primary_image?: CategoryImageObject | null;
    variants?: ProductVariantData[] | null;
    effective_price_minor?: number | null;
    regular_price_minor?: number | null;
    sale_price_minor?: number | null;
    compare_at_price_minor?: number | null;
    in_stock?: boolean | null;
    description_html?: string | null;
    short_description?: string | null;
    rating?: number | null;
    review_count?: number;
    badges?: string[];
    is_featured?: boolean;
    currency_code?: string | null;
    thumbnail_url?: string | null;
    image_url?: string | null;
}

interface CategoryClientProps {
    category: {
        id: number;
        name: string;
        slug: string;
        description?: string | null;
        icon_url?: string | null;
        thumbnail_url?: string | null;
        image_url?: string | null;
        banner_url?: string | null;
    };
}

const PLACEHOLDER_IMAGE = "/images/product-not-found.webp";
const PER_PAGE = 12;

// --- Helper Functions ---
function toValidNumber(val: unknown): number | null {
    if (typeof val === "number" && Number.isFinite(val)) return val;
    if (typeof val === "string" && val.trim() !== "" && Number.isFinite(Number(val))) {
        return Number(val);
    }
    return null;
}

function decodeHtmlEntities(text?: string | null): string {
    if (!text) return "";
    return text
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">");
}

function getPricingMinor(product: ExtendedProduct) {
    const firstVariant =
        Array.isArray(product.variants) && product.variants.length > 0
            ? product.variants[0]
            : undefined;

    const variantEffective =
        toValidNumber(firstVariant?.effective_price_minor) ??
        toValidNumber(firstVariant?.sale_price_minor) ??
        toValidNumber(firstVariant?.regular_price_minor) ??
        toValidNumber(firstVariant?.price_minor);

    const productPrice =
        toValidNumber(product.effective_price_minor) ??
        toValidNumber(product.sale_price_minor) ??
        toValidNumber(product.price_minor) ??
        toValidNumber(product.regular_price_minor);

    const priceMinor = variantEffective ?? productPrice;

    const compareAtMinor =
        toValidNumber(product.compare_at_price_minor) ??
        (toValidNumber(firstVariant?.sale_price_minor) !== null &&
            toValidNumber(firstVariant?.regular_price_minor) !== null &&
            Number(firstVariant?.regular_price_minor) > Number(firstVariant?.sale_price_minor)
            ? Number(firstVariant?.regular_price_minor)
            : null);

    return { priceMinor, compareAtMinor };
}

function safeFormatMoney(minor: number | null, currencyCode?: string | null): string {
    if (minor === null) return "Price on request";
    try {
        const formatted = formatPrice(minor, currencyCode || "BDT");
        if (formatted && !formatted.includes("NaN")) return formatted;
    } catch {
        // fallback below
    }
    return `৳${(minor / 100).toFixed(2)}`;
}

function getProductImage(product: ExtendedProduct) {
    const variantImg = Array.isArray(product.variants)
        ? product.variants.find((v) => v.image_url || v.thumbnail_url)
        : undefined;

    const rawSrc =
        product.primary_image?.url?.trim() ||
        product.thumbnail_url?.trim() ||
        product.image_url?.trim() ||
        variantImg?.image_url?.trim() ||
        variantImg?.thumbnail_url?.trim() ||
        PLACEHOLDER_IMAGE;

    return {
        src: rawSrc,
        alt: decodeHtmlEntities(product.primary_image?.alt || product.name),
    };
}

function getProductInStock(product: ExtendedProduct): boolean {
    if (typeof product.in_stock === "boolean") return product.in_stock;
    if (Array.isArray(product.variants) && product.variants.length > 0) {
        return product.variants.some((v) => v.in_stock !== false);
    }
    return true;
}

// --- Quick View Modal Component ---
function QuickViewModal({
    product,
    onClose,
}: {
    product: ExtendedProduct;
    onClose: () => void;
}) {
    const { addItem, toggleCart } = useCartStore();
    const {
        addItem: addWishlistItem,
        removeItem: removeWishlistItem,
        isInWishlist,
        isHydrated,
    } = useWishlistStore();
    const [mounted, setMounted] = useState(false);
    const [qty, setQty] = useState(1);
    const imageRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    const isWishlisted = mounted && isHydrated ? isInWishlist(product.id) : false;
    const { priceMinor, compareAtMinor } = getPricingMinor(product);
    const isAvailable = getProductInStock(product);
    const img = getProductImage(product);
    const cleanTitle = decodeHtmlEntities(product.name);

    const handleAddToCart = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!isAvailable) return;
        if (imageRef.current) flyToCart(img.src, imageRef.current);
        await addItem({
            id: product.id,
            title: cleanTitle,
            price: priceMinor || 0,
            image: img.src,
            variantId: product.id,
            quantity: qty,
        });
        setTimeout(() => toggleCart(), 800);
    };

    const handleWishlist = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isWishlisted) {
            removeWishlistItem(product.id);
        } else {
            addWishlistItem({
                id: product.id,
                title: cleanTitle,
                price: priceMinor || 0,
                image: img.src,
            });
            if (imageRef.current) flyToCart(img.src, imageRef.current, "wishlist-icon-target");
        }
    };

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative flex flex-col md:flex-row"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close modal"
                    className="absolute top-4 right-4 z-10 p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer"
                >
                    <X className="h-5 w-5" />
                </button>

                {/* Modal Image */}
                <div
                    ref={imageRef}
                    className="w-full md:w-1/2 bg-gray-50 dark:bg-gray-800/50 p-8 flex items-center justify-center min-h-[300px]"
                >
                    <Image
                        src={img.src}
                        alt={img.alt}
                        width={500}
                        height={500}
                        className="object-contain max-h-[400px] mix-blend-multiply dark:mix-blend-normal"
                    />
                </div>

                {/* Modal Details */}
                <div className="w-full md:w-1/2 p-8 flex flex-col">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {cleanTitle}
                    </h2>
                    {product.brand?.name && (
                        <p className="text-sm text-gray-500 mb-4">
                            Brand: {decodeHtmlEntities(product.brand.name)}
                        </p>
                    )}

                    <div className="flex items-baseline gap-3 mb-4">
                        <span className="text-3xl font-black text-[#f76b1c]">
                            {safeFormatMoney(priceMinor, product.currency_code)}
                        </span>
                        {compareAtMinor && priceMinor && compareAtMinor > priceMinor && (
                            <span className="text-lg text-gray-400 line-through">
                                {safeFormatMoney(compareAtMinor, product.currency_code)}
                            </span>
                        )}
                    </div>

                    <div className="prose prose-sm dark:prose-invert mb-6 max-h-[200px] overflow-y-auto pr-2">
                        <div
                            dangerouslySetInnerHTML={{
                                __html:
                                    product.description_html ||
                                    decodeHtmlEntities(product.short_description) ||
                                    "",
                            }}
                        />
                    </div>

                    <div className="mt-auto space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                                <button
                                    type="button"
                                    onClick={() => setQty(Math.max(1, qty - 1))}
                                    className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                                >
                                    <Minus className="h-4 w-4" />
                                </button>
                                <span className="w-10 text-center font-bold">{qty}</span>
                                <button
                                    type="button"
                                    onClick={() => setQty(qty + 1)}
                                    className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                                >
                                    <Plus className="h-4 w-4" />
                                </button>
                            </div>
                            <button
                                type="button"
                                onClick={handleAddToCart}
                                disabled={!isAvailable}
                                className="flex-1 bg-[#f76b1c] hover:bg-[#e05a12] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                            >
                                <ShoppingCart className="h-5 w-5" /> Add To Cart
                            </button>
                            <button
                                type="button"
                                onClick={handleWishlist}
                                aria-label="Toggle wishlist"
                                className={`p-3 rounded-xl border transition-all cursor-pointer ${isWishlisted
                                    ? "bg-red-50 border-red-200 text-red-500"
                                    : "border-gray-200 dark:border-gray-700 hover:border-red-200 hover:text-red-500"
                                    }`}
                            >
                                <Heart
                                    className={`h-5 w-5 ${isWishlisted ? "fill-current" : ""}`}
                                />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- Modern Product Card (Supports both Grid & List View) ---
function ModernProductCard({
    product,
    view = "grid",
}: {
    product: ExtendedProduct;
    view?: "grid" | "list";
}) {
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
    const [showQuickView, setShowQuickView] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const isList = view === "list";
    const isWishlisted = mounted && isHydrated ? isInWishlist(product.id) : false;
    const { priceMinor, compareAtMinor } = getPricingMinor(product);
    const isAvailable = getProductInStock(product);
    const img = getProductImage(product);
    const cleanTitle = decodeHtmlEntities(product.name);
    const cleanBrand = decodeHtmlEntities(product.brand?.name);
    const cleanDesc = decodeHtmlEntities(
        product.short_description?.replace(/<[^>]*>?/gm, "")
    );

    const discount =
        compareAtMinor && priceMinor && compareAtMinor > priceMinor
            ? Math.round(((compareAtMinor - priceMinor) / compareAtMinor) * 100)
            : 0;

    const handleAddToCart = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!isAvailable) return;
        if (imageRef.current) flyToCart(img.src, imageRef.current);
        await addItem({
            id: product.id,
            title: cleanTitle,
            price: priceMinor || 0,
            image: img.src,
            variantId: product.id,
            quantity: 1,
        });
        setTimeout(() => toggleCart(), 800);
    };

    const handleBuyNow = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!isAvailable) return;
        await addItem({
            id: product.id,
            title: cleanTitle,
            price: priceMinor || 0,
            image: img.src,
            variantId: product.id,
            quantity: 1,
        });
        router.push("/checkout");
    };

    const handleWishlist = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isWishlisted) {
            removeWishlistItem(product.id);
        } else {
            addWishlistItem({
                id: product.id,
                title: cleanTitle,
                price: priceMinor || 0,
                image: img.src,
            });
            if (imageRef.current) flyToCart(img.src, imageRef.current, "wishlist-icon-target");
        }
    };

    return (
        <>
            <div
                onClick={() => router.push(`/products/${product.slug}`)}
                className={`relative bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden group hover:shadow-lg hover:border-emerald-500/40 transition-all duration-300 cursor-pointer ${isList
                    ? "flex flex-col sm:flex-row items-stretch gap-4 sm:gap-6 p-4"
                    : "flex flex-col h-full p-3.5 sm:p-0"
                    }`}
            >
                {/* Badges */}
                <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 pointer-events-none">
                    {discount > 0 && (
                        <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">
                            -{discount}%
                        </span>
                    )}
                    {product.is_featured && (
                        <span className="inline-flex items-center gap-1 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">
                            <Sparkles className="w-2.5 h-2.5" /> Featured
                        </span>
                    )}
                    {!isAvailable && (
                        <span className="bg-gray-800 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">
                            Out of Stock
                        </span>
                    )}
                </div>

                {/* Image Section */}
                <div
                    ref={imageRef}
                    className={`relative bg-gray-50 dark:bg-gray-800/40 rounded-xl overflow-hidden flex items-center justify-center shrink-0 ${isList
                        ? "w-full sm:w-58 h-48 sm:h-58"
                        : "w-full aspect-square mb-3"
                        }`}
                >
                    <Image
                        src={img.src}
                        alt={img.alt}
                        width={260}
                        height={260}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 mix-blend-multiply dark:mix-blend-normal"
                    />

                    {/* Quick Action Buttons */}
                    <div
                        className={`absolute top-2 right-2 flex flex-col gap-1.5 transition-all duration-300 ${isList
                            ? "opacity-100"
                            : "opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0"
                            }`}
                    >
                        <button
                            type="button"
                            onClick={handleWishlist}
                            aria-label="Add to wishlist"
                            className={`w-8 h-8 flex items-center justify-center rounded-full shadow-md transition-all cursor-pointer ${isWishlisted
                                ? "bg-rose-500 text-white"
                                : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-200 hover:bg-rose-500 hover:text-white"
                                }`}
                        >
                            <Heart
                                className={`h-3.5 w-3.5 ${isWishlisted ? "fill-current" : ""}`}
                            />
                        </button>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowQuickView(true);
                            }}
                            aria-label="Quick view"
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-200 shadow-md hover:bg-emerald-600 hover:text-white transition-all cursor-pointer"
                        >
                            <Eye className="h-3.5 w-3.5" />
                        </button>
                    </div>
                </div>

                {/* Content Section */}
                <div className="flex flex-col flex-1 justify-between min-w-0 p-4">
                    <div>
                        {cleanBrand && (
                            <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mb-1 uppercase tracking-wider truncate">
                                {cleanBrand}
                            </p>
                        )}

                        <h3
                            className={`font-bold text-gray-900 dark:text-gray-100 group-hover:text-[#f76b1c] transition-colors ${isList
                                ? "text-lg sm:text-xl line-clamp-1 mb-1.5"
                                : "text-sm sm:text-base line-clamp-1 mb-2 "
                                }`}
                        >
                            {cleanTitle}
                        </h3>

                        {/* Price */}
                        <div className="flex items-baseline gap-2 mb-3">
                            <span className="text-lg sm:text-xl font-black text-[#f76b1c]">
                                {safeFormatMoney(priceMinor, product.currency_code)}
                            </span>
                            {compareAtMinor && priceMinor && compareAtMinor > priceMinor && (
                                <span className="text-xs sm:text-sm text-gray-400 line-through">
                                    {safeFormatMoney(compareAtMinor, product.currency_code)}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div
                        className={`flex items-center gap-2 mt-auto pt-2.5 border-t border-gray-100 dark:border-gray-800 ${isList ? "sm:justify-start" : ""
                            }`}
                    >
                        <button
                            type="button"
                            onClick={handleAddToCart}
                            disabled={!isAvailable}
                            className={`${isList ? "px-4" : "flex-1 px-2.5"
                                } flex items-center justify-center gap-1.5 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 py-2 rounded-xl hover:border-[#f76b1c] hover:text-[#f76b1c] transition-all text-xs font-bold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            <ShoppingCart className="h-3.5 w-3.5 shrink-0" />
                            <span>{isList ? "Add To Cart" : "Cart"}</span>
                        </button>

                        <button
                            type="button"
                            onClick={handleBuyNow}
                            disabled={!isAvailable}
                            className={`${isList ? "px-5" : "flex-1 px-2.5"
                                } flex items-center justify-center gap-1 bg-[#f76b1c] text-white py-2 rounded-xl hover:bg-[#e05a12] transition-all text-xs font-bold cursor-pointer shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            <span>Buy Now</span>
                            {isList && <ArrowRight className="h-3.5 w-3.5" />}
                        </button>
                    </div>
                </div>
            </div>

            {showQuickView && (
                <QuickViewModal product={product} onClose={() => setShowQuickView(false)} />
            )}
        </>
    );
}

// --- Main Category Client ---
export function CategoryClient({ category }: CategoryClientProps) {
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [minTaka, setMinTaka] = useState<number>(0);
    const [maxTaka, setMaxTaka] = useState<number>(0);
    const [brandSlug, setBrandSlug] = useState<string>("");
    const [inStock, setInStock] = useState(false);
    const [sort, setSort] = useState<ProductSort | "">("");
    const [page, setPage] = useState(1);
    const [view, setView] = useState<"grid" | "list">("grid");
    const [showFilters, setShowFilters] = useState(false);

    const { brands } = useBrands();
    const headerImageUrl =
        category.icon_url?.trim() ||
        category.thumbnail_url?.trim() ||
        category.image_url?.trim();

    useEffect(() => {
        const t = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 400);
        return () => clearTimeout(t);
    }, [search]);

    const { products, meta, isLoading, error } = useCategoryProducts(category.slug, {
        search: debouncedSearch || undefined,
        minPriceTaka: minTaka || undefined,
        maxPriceTaka: maxTaka || undefined,
        brandSlug: brandSlug || undefined,
        inStock: inStock || undefined,
        sort: sort || undefined,
        page,
        perPage: PER_PAGE,
    });

    const changeFilter = (fn: () => void) => {
        fn();
        setPage(1);
    };

    const clearFilters = () => {
        setSearch("");
        setDebouncedSearch("");
        setMinTaka(0);
        setMaxTaka(0);
        setBrandSlug("");
        setInStock(false);
        setSort("");
        setPage(1);
    };

    const hasActiveFilters =
        search !== "" || minTaka > 0 || maxTaka > 0 || brandSlug !== "" || inStock;

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                <Link href="/" className="hover:text-green-600 transition-colors">
                    Home
                </Link>
                <ChevronRight className="h-4 w-4" />
                <span className="text-gray-800 dark:text-gray-200 font-medium">
                    {decodeHtmlEntities(category.name)}
                </span>
            </nav>

            {/* Header */}
            <div className="mb-8 flex items-start gap-4">
                {headerImageUrl && (
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex items-center justify-center shrink-0">
                        <Image
                            src={headerImageUrl}
                            alt={decodeHtmlEntities(category.name)}
                            width={80}
                            height={80}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                if (e.currentTarget.parentElement) {
                                    e.currentTarget.parentElement.style.display = "none";
                                }
                            }}
                        />
                    </div>
                )}
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-2">
                        {decodeHtmlEntities(category.name)}
                    </h1>
                    {category.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 max-w-2xl">
                            {decodeHtmlEntities(category.description)}
                        </p>
                    )}
                    <p className="text-sm text-gray-500">
                        {isLoading ? "Loading..." : `${meta.total} products found`}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Sidebar Filters */}
                <aside className={`lg:col-span-1 ${showFilters ? "block" : "hidden lg:block"}`}>
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 sticky top-24">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                                Filters
                            </h2>
                            {hasActiveFilters && (
                                <button
                                    type="button"
                                    onClick={clearFilters}
                                    className="text-xs text-red-500 hover:underline cursor-pointer"
                                >
                                    Clear all
                                </button>
                            )}
                        </div>

                        <div className="mb-6 pb-6 border-b border-gray-100 dark:border-gray-800">
                            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-3">
                                Search
                            </h3>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search in this category..."
                                    className="w-full pl-9 pr-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                        </div>

                        <div className="mb-6 pb-6 border-b border-gray-100 dark:border-gray-800">
                            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-3">
                                Price Range
                            </h3>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    min={0}
                                    value={minTaka || ""}
                                    onChange={(e) =>
                                        changeFilter(() =>
                                            setMinTaka(Math.max(0, Number(e.target.value)))
                                        )
                                    }
                                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-transparent"
                                    placeholder="Min"
                                />
                                <span className="text-gray-400">-</span>
                                <input
                                    type="number"
                                    min={0}
                                    value={maxTaka || ""}
                                    onChange={(e) =>
                                        changeFilter(() =>
                                            setMaxTaka(Math.max(0, Number(e.target.value)))
                                        )
                                    }
                                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-transparent"
                                    placeholder="Max"
                                />
                            </div>
                        </div>

                        {brands.length > 0 && (
                            <div className="mb-6 pb-6 border-b border-gray-100 dark:border-gray-800">
                                <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-3">
                                    Brand
                                </h3>
                                <select
                                    value={brandSlug}
                                    onChange={(e) =>
                                        changeFilter(() => setBrandSlug(e.target.value))
                                    }
                                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer"
                                >
                                    <option value="">All Brands</option>
                                    {brands.map((b) => (
                                        <option key={b.id} value={b.slug}>
                                            {b.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={inStock}
                                onChange={(e) =>
                                    changeFilter(() => setInStock(e.target.checked))
                                }
                                className="w-4 h-4 rounded accent-green-600"
                            />
                            <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-green-600 transition-colors">
                                In stock only
                            </span>
                        </label>
                    </div>
                </aside>

                {/* Main Content */}
                <div className="lg:col-span-4">
                    {/* Toolbar */}
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setShowFilters(!showFilters)}
                                className="lg:hidden flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-semibold cursor-pointer"
                            >
                                <SlidersHorizontal className="h-4 w-4" /> Filters
                            </button>

                            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                                <button
                                    type="button"
                                    onClick={() => setView("grid")}
                                    aria-label="Grid view"
                                    className={`p-2 rounded-md transition-colors cursor-pointer ${view === "grid"
                                        ? "bg-white dark:bg-gray-700 text-emerald-600 shadow-sm"
                                        : "text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
                                        }`}
                                >
                                    <Grid className="h-4 w-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setView("list")}
                                    aria-label="List view"
                                    className={`p-2 rounded-md transition-colors cursor-pointer ${view === "list"
                                        ? "bg-white dark:bg-gray-700 text-emerald-600 shadow-sm"
                                        : "text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
                                        }`}
                                >
                                    <List className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500 hidden sm:block">
                                Sort by:
                            </span>
                            <div className="relative">
                                <select
                                    value={sort}
                                    onChange={(e) =>
                                        changeFilter(() =>
                                            setSort(e.target.value as ProductSort | "")
                                        )
                                    }
                                    className="appearance-none pl-3 pr-8 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-semibold bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer"
                                >
                                    <option value="">Relevance</option>
                                    <option value="newest">Newest</option>
                                    <option value="name_asc">Name: A to Z</option>
                                    <option value="name_desc">Name: Z to A</option>
                                    <option value="price_asc">Price: Low to High</option>
                                    <option value="price_desc">Price: High to Low</option>
                                </select>
                                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    {/* Error State */}
                    {error && (
                        <div className="flex flex-col items-center justify-center py-16 text-red-500">
                            <X className="h-10 w-10 mb-2" />
                            <p className="font-semibold">Error loading products</p>
                            <p className="text-sm">{error}</p>
                        </div>
                    )}

                    {/* Loading State */}
                    {isLoading && !error && (
                        <div className="flex items-center justify-center py-24">
                            <Loader2 className="h-8 w-8 animate-spin text-green-600" />
                            <span className="ml-2 text-gray-600">Loading products...</span>
                        </div>
                    )}

                    {/* Products Grid / List */}
                    {!isLoading && !error && products.length > 0 && (
                        <>
                            <div
                                className={
                                    view === "grid"
                                        ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 items-stretch"
                                        : "flex flex-col gap-4"
                                }
                            >
                                {(products as ExtendedProduct[]).map((product) => (
                                    <ModernProductCard
                                        key={product.id}
                                        product={product}
                                        view={view}
                                    />
                                ))}
                            </div>

                            {/* Pagination */}
                            {meta.last_page > 1 && (
                                <div className="flex items-center justify-center gap-2 mt-10">
                                    <button
                                        type="button"
                                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                                        disabled={meta.current_page <= 1}
                                        className="h-9 w-9 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center disabled:opacity-40 hover:bg-green-600 hover:text-white hover:border-green-600 transition-all cursor-pointer disabled:cursor-not-allowed"
                                        aria-label="Previous page"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </button>
                                    <span className="text-sm text-gray-600 dark:text-gray-400 px-2">
                                        Page {meta.current_page} of {meta.last_page}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
                                        disabled={meta.current_page >= meta.last_page}
                                        className="h-9 w-9 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center disabled:opacity-40 hover:bg-green-600 hover:text-white hover:border-green-600 transition-all cursor-pointer disabled:cursor-not-allowed"
                                        aria-label="Next page"
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </button>
                                </div>
                            )}
                        </>
                    )}

                    {/* Empty State */}
                    {!isLoading && !error && products.length === 0 && (
                        <div className="flex flex-col items-center justify-center text-center py-16 md:py-20 px-4 animate-in fade-in zoom-in-95 duration-500">
                            {/* Animated Visual Container */}
                            <div className="relative mb-7 group select-none">
                                {/* Soft Ambient Glow */}
                                <div className="absolute -inset-3 rounded-full blur-xl animate-pulse pointer-events-none" />

                                {/* Floating / Hovering Image Box */}
                                <div className="relative w-44 h-44 sm:w-52 sm:h-52 mx-auto rounded-3xl bg-transparent dark:bg-gray-800/70 flex items-center justify-center overflow-hidden p-4 animate-[bounce_3.5s_ease-in-out_infinite] group-hover:[animation-play-state:paused] transition-transform duration-500 group-hover:scale-105">
                                    <img
                                        src="/images/no-product-found.png"
                                        alt="No products found"
                                        className="w-full h-full object-contain transition-transform duration-500 group-hover:rotate-3"
                                        onError={(e) => {
                                            const img = e.currentTarget;
                                            img.style.display = "none";
                                            const fallback = img.nextElementSibling as HTMLElement | null;
                                            if (fallback) fallback.classList.remove("hidden");
                                        }}
                                    />
                                    <PackageSearch className="hidden h-14 w-14 text-gray-400 dark:text-gray-500" />
                                </div>

                                {/* Animated Search Badge */}
                                <div className="absolute -bottom-2.5 -right-2.5 flex items-center justify-center">
                                    <span className="absolute inline-flex h-12 w-12 rounded-full bg-emerald-500/25 animate-ping duration-1000" />
                                    <div className="relative h-12 w-12 rounded-full bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-lg flex items-center justify-center text-emerald-600 dark:text-emerald-400 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110">
                                        <PackageSearch className="h-5 w-5" />
                                    </div>
                                </div>
                            </div>

                            {/* Heading & Description */}
                            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">
                                No products found in this category
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mb-6 leading-relaxed">
                                {hasActiveFilters
                                    ? "We couldn't find any products matching your current filters. Try adjusting or resetting them."
                                    : "Products will appear here once they are added to this category."}
                            </p>

                            {/* Action Button */}
                            {hasActiveFilters && (
                                <button
                                    type="button"
                                    onClick={clearFilters}
                                    className="group inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 active:scale-95 text-white px-6 py-2.5 rounded-xl font-semibold shadow-sm shadow-green-600/20 hover:shadow-md hover:shadow-green-600/30 transition-all duration-200 cursor-pointer"
                                >
                                    <RotateCcw className="h-4 w-4 transition-transform duration-500 group-hover:-rotate-180" />
                                    <span>Clear Filters</span>
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}