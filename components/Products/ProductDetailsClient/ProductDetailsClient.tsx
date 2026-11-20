"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    Star,
    Heart,
    ShoppingCart,
    ArrowRight,
    CheckCircle2,
    Minus,
    Plus,
    ChevronRight,
    Phone,
    MessageCircle,
    Package,
    Tag,
    Clock,
    Globe,
    Percent,
} from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { formatPrice } from "@/utils/format";
import { flyToCart } from "@/utils/flyToCart";

interface ApiImageObj {
    id?: number;
    url?: string | null;
    alt?: string | null;
}

interface ApiVariantAttribute {
    id: number;
    name?: string;
    value: string;
    slug: string;
}

interface ApiVariant {
    id: number;
    sku?: string | null;
    regular_price_minor?: number | null;
    sale_price_minor?: number | null;
    effective_price_minor?: number | null;
    price_minor?: number | null;
    weight_grams?: number | null;
    barcode?: string | null;
    image_url?: string | null;
    thumbnail_url?: string | null;
    in_stock?: boolean | null;
    stock_quantity?: number | null;
    attributes?: ApiVariantAttribute[] | null;
}

interface ApiProductDetail {
    id: number;
    name: string;
    slug: string;
    type?: string;
    short_description?: string | null;
    description_html?: string | null;
    price_minor?: number | null;
    regular_price_minor?: number | null;
    sale_price_minor?: number | null;
    effective_price_minor?: number | null;
    compare_at_price_minor?: number | null;
    currency_code?: string | null;
    primary_image?: ApiImageObj | null;
    image_url?: string | null;
    thumbnail_url?: string | null;
    gallery?: Array<{ url?: string | null } | string> | null;
    in_stock?: boolean | null;
    stock_quantity?: number | null;
    brand?: { id: number; name: string; slug: string } | null;
    categories?: { id: number; name: string; slug: string }[] | null;
    rating?: number | null;
    review_count?: number | null;
    sku?: string | null;
    delivery_time?: string | null;
    return_policy?: string | null;
    variants?: ApiVariant[] | null;
}

interface ProductDetailsClientProps {
    product: ApiProductDetail;
}

const PLACEHOLDER_IMAGE = "/images/product-not-found.webp";

function toValidNumber(val: unknown): number | null {
    if (typeof val === "number" && Number.isFinite(val)) return val;
    if (typeof val === "string" && val.trim() !== "" && Number.isFinite(Number(val))) {
        return Number(val);
    }
    return null;
}

function safeFormatMoney(minor: number, currencyCode?: string | null): string {
    try {
        const formatted = formatPrice(minor, currencyCode || "BDT");
        if (formatted && !formatted.includes("NaN")) {
            return formatted;
        }
    } catch {
        // Fallback below
    }
    return `৳${(minor / 100).toFixed(2)}`;
}

export function ProductDetailsClient({ product }: ProductDetailsClientProps) {
    const router = useRouter();
    const { addItem } = useCartStore();
    const {
        addItem: addWishlistItem,
        removeItem: removeWishlistItem,
        isInWishlist,
        isHydrated,
    } = useWishlistStore();

    const imageRef = useRef<HTMLDivElement>(null);
    const [mounted, setMounted] = useState(false);
    const [isBuyingNow, setIsBuyingNow] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const isWishlisted =
        mounted && isHydrated ? isInWishlist(product.id) : false;

    const variants = useMemo(
        () => (Array.isArray(product.variants) ? product.variants : []),
        [product.variants]
    );

    const [selectedVariantId, setSelectedVariantId] = useState<number | null>(
        variants[0]?.id ?? null
    );

    const selectedVariant = useMemo(() => {
        if (!variants.length) return undefined;
        return variants.find((v) => v.id === selectedVariantId) ?? variants[0];
    }, [variants, selectedVariantId]);

    const mainImage = useMemo(() => {
        const variantImg =
            selectedVariant?.image_url?.trim() ||
            selectedVariant?.thumbnail_url?.trim();
        return (
            variantImg ||
            product.primary_image?.url?.trim() ||
            product.image_url?.trim() ||
            product.thumbnail_url?.trim() ||
            PLACEHOLDER_IMAGE
        );
    }, [product, selectedVariant]);

    const thumbnails = useMemo(() => {
        const list: string[] = [];
        if (mainImage) list.push(mainImage);

        if (product.primary_image?.url?.trim()) {
            list.push(product.primary_image.url.trim());
        }
        if (product.image_url?.trim()) {
            list.push(product.image_url.trim());
        }
        if (product.thumbnail_url?.trim()) {
            list.push(product.thumbnail_url.trim());
        }
        if (Array.isArray(product.gallery)) {
            for (const g of product.gallery) {
                const url = typeof g === "string" ? g : g?.url;
                if (typeof url === "string" && url.trim() !== "") {
                    list.push(url.trim());
                }
            }
        }
        for (const v of variants) {
            if (v.image_url?.trim()) list.push(v.image_url.trim());
            if (v.thumbnail_url?.trim()) list.push(v.thumbnail_url.trim());
        }

        return Array.from(new Set(list));
    }, [mainImage, product, variants]);

    const [activeImage, setActiveImage] = useState<string>(mainImage);

    useEffect(() => {
        setActiveImage(mainImage);
    }, [mainImage]);

    const currentPriceMinor =
        toValidNumber(selectedVariant?.effective_price_minor) ??
        toValidNumber(selectedVariant?.sale_price_minor) ??
        toValidNumber(selectedVariant?.regular_price_minor) ??
        toValidNumber(selectedVariant?.price_minor) ??
        toValidNumber(product.effective_price_minor) ??
        toValidNumber(product.sale_price_minor) ??
        toValidNumber(product.price_minor) ??
        toValidNumber(product.regular_price_minor) ??
        0;

    const originalPriceMinor =
        toValidNumber(selectedVariant?.regular_price_minor) ??
        toValidNumber(product.compare_at_price_minor) ??
        toValidNumber(product.regular_price_minor) ??
        null;

    const hasDiscount =
        originalPriceMinor !== null && originalPriceMinor > currentPriceMinor;

    const discountPercent = hasDiscount
        ? Math.round(
              ((originalPriceMinor - currentPriceMinor) / originalPriceMinor) * 100
          )
        : 0;

    const [quantity, setQuantity] = useState<number>(1);
    const [activeTab, setActiveTab] = useState<string>("description");

    const isInStock =
        typeof selectedVariant?.in_stock === "boolean"
            ? selectedVariant.in_stock
            : typeof product.in_stock === "boolean"
            ? product.in_stock
            : true;

    const stockQty =
        toValidNumber(selectedVariant?.stock_quantity) ??
        toValidNumber(product.stock_quantity);

    const stockStatusText = isInStock
        ? stockQty !== null && stockQty > 0
            ? `In Stock (${stockQty})`
            : "In Stock"
        : "Out of Stock";

    const handleAddToCart = async (e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        if (!isInStock) return;

        if (imageRef.current) {
            flyToCart(activeImage, imageRef.current);
        }

        await addItem({
            id: product.id,
            title: product.name,
            price: currentPriceMinor,
            image: activeImage,
            variantId: selectedVariant?.id ?? product.id,
            quantity,
        });
    };

    const handleBuyNow = async () => {
        if (!isInStock || isBuyingNow) return;
        setIsBuyingNow(true);
        try {
            await addItem({
                id: product.id,
                title: product.name,
                price: currentPriceMinor,
                image: activeImage,
                variantId: selectedVariant?.id ?? product.id,
                quantity,
            });
            router.push("/checkout");
        } finally {
            setIsBuyingNow(false);
        }
    };

    const handleWishlistClick = () => {
        if (isWishlisted) {
            removeWishlistItem(product.id);
        } else {
            addWishlistItem({
                id: product.id,
                title: product.name,
                price: currentPriceMinor,
                image: activeImage,
            });
            if (imageRef.current) {
                flyToCart(activeImage, imageRef.current, "wishlist-icon-target");
            }
        }
    };

    const ratingValue = toValidNumber(product.rating) ?? 0;
    const reviewCount = toValidNumber(product.review_count) ?? 0;
    const displaySku = selectedVariant?.sku || product.sku || "N/A";
    const displayWeight = toValidNumber(selectedVariant?.weight_grams);
    const mainImageAlt =
        product.primary_image?.alt?.trim() || product.name;

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6 flex-wrap">
                <Link href="/" className="hover:text-green-600 transition-colors">
                    Home
                </Link>
                <ChevronRight className="h-4 w-4" />
                {product.categories?.[0] && (
                    <>
                        <Link
                            href={`/category/${product.categories[0].slug}`}
                            className="hover:text-green-600 transition-colors"
                        >
                            {product.categories[0].name}
                        </Link>
                        <ChevronRight className="h-4 w-4" />
                    </>
                )}
                <span className="text-gray-800 dark:text-gray-200 font-medium truncate">
                    {product.name}
                </span>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                {/* Left: Image Gallery */}
                <div className="flex flex-col gap-4">
                    <div
                        ref={imageRef}
                        className="relative aspect-square bg-gray-50 dark:bg-gray-800/50 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 flex items-center justify-center p-6 group"
                    >
                        <img
                            src={activeImage}
                            alt={mainImageAlt}
                            className="w-full h-full object-contain transition-all duration-300 group-hover:scale-105"
                            onError={(e) => {
                                const target = e.currentTarget;
                                if (
                                    target.src !==
                                    window.location.origin + PLACEHOLDER_IMAGE
                                ) {
                                    target.src = PLACEHOLDER_IMAGE;
                                }
                            }}
                        />

                        {/* Discount Badge */}
                        {hasDiscount && discountPercent > 0 && (
                            <span className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1.5 rounded-lg z-10 shadow-sm">
                                -{discountPercent}% OFF
                            </span>
                        )}

                        {/* Wishlist Button */}
                        <button
                            type="button"
                            onClick={handleWishlistClick}
                            aria-label="Toggle wishlist"
                            className={`absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full shadow-md transition-colors z-10 cursor-pointer ${
                                isWishlisted
                                    ? "bg-red-500 text-white"
                                    : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-red-500 hover:text-white"
                            }`}
                        >
                            <Heart
                                className={`h-5 w-5 ${
                                    isWishlisted ? "fill-current" : ""
                                }`}
                            />
                        </button>
                    </div>

                    {/* Thumbnails */}
                    {thumbnails.length > 0 && (
                        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                            {thumbnails.map((img, i) => (
                                <button
                                    type="button"
                                    key={`${img}-${i}`}
                                    onClick={() => setActiveImage(img)}
                                    className={`w-20 h-20 shrink-0 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 flex items-center justify-center p-2 transition-all relative cursor-pointer ${
                                        activeImage === img
                                            ? "border-orange-400 shadow-md"
                                            : "border-transparent hover:border-gray-300"
                                    }`}
                                >
                                    <img
                                        src={img}
                                        alt={`${product.name} thumbnail ${i + 1}`}
                                        className="w-full h-full object-contain"
                                        onError={(e) => {
                                            const target = e.currentTarget;
                                            if (
                                                target.src !==
                                                window.location.origin +
                                                    PLACEHOLDER_IMAGE
                                            ) {
                                                target.src = PLACEHOLDER_IMAGE;
                                            }
                                        }}
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right: Product Details */}
                <div className="flex flex-col">
                    {/* Title & Rating */}
                    <div className="mb-4">
                        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white mb-2 leading-tight">
                            {product.name}
                        </h1>
                        <div className="flex items-center gap-4 flex-wrap">
                            <div className="flex items-center gap-1 text-amber-500">
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <Star
                                        key={s}
                                        className={`h-4 w-4 ${
                                            s <= Math.floor(ratingValue)
                                                ? "fill-current"
                                                : ""
                                        }`}
                                    />
                                ))}
                                <span className="text-sm text-gray-500 ml-1">
                                    {ratingValue.toFixed(1)} ({reviewCount} reviews)
                                </span>
                            </div>
                            <span className="text-sm text-gray-400">|</span>
                            <span
                                className={`text-sm font-medium flex items-center gap-1 ${
                                    isInStock ? "text-green-600" : "text-red-500"
                                }`}
                            >
                                <CheckCircle2 className="h-4 w-4" />
                                {stockStatusText}
                            </span>
                        </div>
                    </div>

                    {/* Price Section */}
                    <div className="flex items-baseline gap-3 mb-6 pb-6 border-b border-gray-100 dark:border-gray-800 flex-wrap">
                        <span className="text-3xl md:text-4xl font-black text-[#f76b1c]">
                            {safeFormatMoney(
                                currentPriceMinor,
                                product.currency_code
                            )}
                        </span>

                        {hasDiscount && originalPriceMinor !== null && (
                            <>
                                <span className="text-xl text-gray-400 line-through">
                                    {safeFormatMoney(
                                        originalPriceMinor,
                                        product.currency_code
                                    )}
                                </span>
                                <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                                    <Percent className="h-3 w-3" /> Save{" "}
                                    {safeFormatMoney(
                                        originalPriceMinor - currentPriceMinor,
                                        product.currency_code
                                    )}
                                </span>
                            </>
                        )}
                    </div>

                    {/* Short Description */}
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                        {product.short_description ||
                            "Premium quality product sourced directly for your satisfaction."}
                    </p>

                    {/* Variants Selection */}
                    {variants.length > 0 && (
                        <div className="space-y-4 mb-6">
                            <div>
                                <span className="text-sm font-bold text-gray-800 dark:text-gray-200 block mb-2">
                                    Select Option
                                </span>
                                <div className="flex gap-2 flex-wrap">
                                    {variants.map((variant) => {
                                        const attrLabel =
                                            variant.attributes
                                                ?.map((a) => a.value)
                                                .filter(Boolean)
                                                .join(" / ") ||
                                            variant.sku ||
                                            `Option #${variant.id}`;

                                        const isSelected =
                                            selectedVariant?.id === variant.id;
                                        const variantAvailable =
                                            variant.in_stock !== false;

                                        return (
                                            <button
                                                type="button"
                                                key={variant.id}
                                                onClick={() =>
                                                    setSelectedVariantId(variant.id)
                                                }
                                                disabled={!variantAvailable}
                                                className={`px-4 py-2 text-sm font-semibold rounded-lg border-2 transition-all cursor-pointer ${
                                                    isSelected
                                                        ? "border-[#f76b1c] text-[#f76b1c] bg-orange-50 dark:bg-orange-900/20 shadow-sm"
                                                        : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                                }`}
                                            >
                                                {attrLabel}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Actions: Qty, Add to Cart, Buy Now */}
                    <div className="flex flex-wrap items-center gap-4 mb-8">
                        <div className="flex items-center border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden">
                            <button
                                type="button"
                                onClick={() =>
                                    setQuantity((q) => Math.max(1, q - 1))
                                }
                                disabled={!isInStock}
                                aria-label="Decrease quantity"
                                className="px-4 py-3 cursor-pointer bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Minus className="h-4 w-4" />
                            </button>
                            <span className="w-12 text-center font-bold">
                                {quantity}
                            </span>
                            <button
                                type="button"
                                onClick={() => setQuantity((q) => q + 1)}
                                disabled={!isInStock}
                                aria-label="Increase quantity"
                                className="px-4 py-3 cursor-pointer bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Plus className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Add to Cart Button */}
                        <button
                            type="button"
                            onClick={handleAddToCart}
                            disabled={!isInStock}
                            title={
                                !isInStock
                                    ? "This item is currently out of stock"
                                    : ""
                            }
                            className="flex-1 min-w-[150px] cursor-pointer flex items-center justify-center gap-2 bg-[#f79b52] text-white py-3 px-6 rounded-lg hover:bg-[#e08942] transition-all font-bold shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none"
                        >
                            <ShoppingCart className="h-5 w-5" />
                            {isInStock ? "Add to Cart" : "Out of Stock"}
                        </button>

                        {/* Buy Now Button */}
                        <button
                            type="button"
                            onClick={handleBuyNow}
                            disabled={!isInStock || isBuyingNow}
                            title={
                                !isInStock
                                    ? "This item is currently out of stock"
                                    : ""
                            }
                            className="flex-1 min-w-[150px] cursor-pointer flex items-center justify-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-3 px-6 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-all font-bold shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500 disabled:shadow-none"
                        >
                            {isInStock ? (
                                <>
                                    {isBuyingNow ? "Processing..." : "Buy Now"}{" "}
                                    <ArrowRight className="h-5 w-5" />
                                </>
                            ) : (
                                "Unavailable"
                            )}
                        </button>
                    </div>

                    {/* Quick Contact Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 mb-6">
                        <a
                            href={`https://wa.me/8809612338833?text=${encodeURIComponent(
                                `Hi, I want to order ${product.name}`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] text-white py-3 px-4 rounded-lg hover:bg-[#1da851] transition-all font-bold text-sm shadow-md"
                        >
                            <MessageCircle className="h-5 w-5" /> Order On
                            WhatsApp
                        </a>
                        <a
                            href="tel:+8809612338833"
                            className="flex-1 flex items-center justify-center gap-2 bg-[#0f3b8c] text-white py-3 px-4 rounded-lg hover:bg-[#0a2a66] transition-all font-bold text-sm shadow-md"
                        >
                            <Phone className="h-5 w-5" /> Call For Order
                        </a>
                    </div>

                    {/* Trust Badges */}
                    <div className="flex flex-col gap-2 mt-4">
                        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                            <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                            <span>
                                Delivery:{" "}
                                <span className="font-semibold">
                                    {product.delivery_time || "2-3 Days"}
                                </span>
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                            <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                            <span>
                                Return Policy:{" "}
                                <span className="font-semibold">
                                    {product.return_policy || "7 Days"}
                                </span>
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                            <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                            <span>
                                100% Authentic &amp; Quality Guaranteed
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Additional Info Grid */}
            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-4 flex items-start gap-3">
                    <Tag className="h-6 w-6 text-green-600 mt-1 shrink-0" />
                    <div>
                        <h4 className="font-bold text-gray-800 dark:text-gray-200 text-sm">
                            SKU
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {displaySku}
                        </p>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-4 flex items-start gap-3">
                    <Globe className="h-6 w-6 text-green-600 mt-1 shrink-0" />
                    <div>
                        <h4 className="font-bold text-gray-800 dark:text-gray-200 text-sm">
                            Brand
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {product.brand?.name || "N/A"}
                        </p>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-4 flex items-start gap-3">
                    <Package className="h-6 w-6 text-green-600 mt-1 shrink-0" />
                    <div>
                        <h4 className="font-bold text-gray-800 dark:text-gray-200 text-sm">
                            Weight
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {displayWeight !== null ? `${displayWeight}g` : "N/A"}
                        </p>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-4 flex items-start gap-3">
                    <Clock className="h-6 w-6 text-green-600 mt-1 shrink-0" />
                    <div>
                        <h4 className="font-bold text-gray-800 dark:text-gray-200 text-sm">
                            Availability
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {stockStatusText}
                        </p>
                    </div>
                </div>
            </div>

            {/* Tabs Section */}
            <div className="mt-16">
                <div className="flex border-b border-gray-200 dark:border-gray-800 gap-8 overflow-x-auto">
                    {["description", "reviews", "shipping"].map((tab) => (
                        <button
                            type="button"
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-3 text-sm font-bold capitalize transition-colors border-b-2 whitespace-nowrap cursor-pointer ${
                                activeTab === tab
                                    ? "border-green-600 text-green-600"
                                    : "border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="py-6 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {activeTab === "description" && (
                        <div
                            dangerouslySetInnerHTML={{
                                __html:
                                    product.description_html ||
                                    product.short_description ||
                                    "",
                            }}
                        />
                    )}
                    {activeTab === "reviews" && (
                        <div className="text-center py-10">
                            <p>Reviews feature coming soon.</p>
                        </div>
                    )}
                    {activeTab === "shipping" && (
                        <div>
                            <p>
                                <strong>Delivery Time:</strong>{" "}
                                {product.delivery_time || "Standard"}
                            </p>
                            <p>
                                <strong>Return Policy:</strong>{" "}
                                {product.return_policy || "Standard"}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}