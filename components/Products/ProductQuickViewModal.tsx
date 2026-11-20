"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    X,
    Star,
    Heart,
    CheckCircle2,
    XCircle,
    ShoppingCart,
    ArrowRight,
    Minus,
    Plus,
} from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { flyToCart } from "@/utils/flyToCart";

export interface QuickViewProduct {
    id: number;
    title: string;
    price: number;
    originalPrice?: number;
    image: string;
    slug?: string;
    brand?: string;
    inStock?: boolean;
    stockCount?: number;
    gallery?: string[];
    description?: string;
    variantId?: number | null;
    sizes?: string[];
    materials?: string[];
    currencySymbol?: string;
}

interface ProductQuickViewModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: QuickViewProduct;
}

const FALLBACK_IMAGE = "/images/product-not-found.webp";

function toSafeNumber(value: unknown, fallback = 0): number {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim() !== "") {
        const parsed = Number(value);
        if (Number.isFinite(parsed)) return parsed;
    }
    return fallback;
}

function cleanText(text?: string | null): string {
    if (!text) return "";
    return text
        .replace(/<[^>]*>?/gm, "")
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .trim();
}

export function ProductQuickViewModal({
    isOpen,
    onClose,
    product,
}: ProductQuickViewModalProps) {
    const addItem = useCartStore((state) => state.addItem);
    const toggleCart = useCartStore((state) => state.toggleCart);

    const addWishlistItem = useWishlistStore((state) => state.addItem);
    const removeWishlistItem = useWishlistStore((state) => state.removeItem);
    const isInWishlist = useWishlistStore((state) => state.isInWishlist);
    const isHydrated = useWishlistStore((state) => state.isHydrated);

    const router = useRouter();
    const imageBoxRef = useRef<HTMLDivElement>(null);

    const safePrice = toSafeNumber(product.price, 0);
    const safeOriginalPrice =
        product.originalPrice !== undefined
            ? toSafeNumber(product.originalPrice, 0)
            : undefined;
    const primaryImg = product.image?.trim() || FALLBACK_IMAGE;
    const cleanTitle = cleanText(product.title) || "Untitled Product";
    const cleanBrand = cleanText(product.brand);
    const cleanDescription = cleanText(product.description);
    const currencySymbol = product.currencySymbol || "$";
    const inStock = product.inStock ?? true;
    const resolvedVariantId = product.variantId ?? product.id;

    const sizeOptions =
        Array.isArray(product.sizes) && product.sizes.length > 0
            ? product.sizes
            : [];
    const materialOptions =
        Array.isArray(product.materials) && product.materials.length > 0
            ? product.materials
            : [];

    const [mounted, setMounted] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [selectedSize, setSelectedSize] = useState<string>("");
    const [selectedMaterial, setSelectedMaterial] = useState<string>("");
    const [activeImage, setActiveImage] = useState<string>(primaryImg);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (isOpen && product) {
            setActiveImage(primaryImg);
            setQuantity(1);
            setSelectedSize(sizeOptions[0] ?? "");
            setSelectedMaterial(materialOptions[0] ?? "");
        }
    }, [isOpen, product.id, primaryImg]);

    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const isWishlisted = mounted && isHydrated ? isInWishlist(product.id) : false;

    const formattedTitle = [cleanTitle, selectedSize, selectedMaterial]
        .filter(Boolean)
        .join(" - ");

    const handleAddToCart = async () => {
        if (!inStock) return;
        const chosenImage = activeImage || primaryImg;
        if (imageBoxRef.current) {
            flyToCart(chosenImage, imageBoxRef.current);
        }
        await addItem({
            id: product.id,
            title: formattedTitle,
            price: safePrice,
            image: chosenImage,
            variantId: resolvedVariantId,
            quantity,
        });
        setTimeout(() => {
            toggleCart();
        }, 700);
        onClose();
    };

    const handleBuyNow = async () => {
        if (!inStock) return;
        const chosenImage = activeImage || primaryImg;
        await addItem({
            id: product.id,
            title: formattedTitle,
            price: safePrice,
            image: chosenImage,
            variantId: resolvedVariantId,
            quantity,
        });
        onClose();
        router.push("/checkout");
    };

    const handleWishlistToggle = () => {
        if (isWishlisted) {
            removeWishlistItem(product.id);
        } else {
            addWishlistItem({
                id: product.id,
                title: cleanTitle,
                price: safePrice,
                image: primaryImg,
            });
            if (imageBoxRef.current) {
                flyToCart(primaryImg, imageBoxRef.current, "wishlist-icon-target");
            }
        }
    };

    const discount =
        safeOriginalPrice && safeOriginalPrice > safePrice && safeOriginalPrice > 0
            ? Math.round(
                  ((safeOriginalPrice - safePrice) / safeOriginalPrice) * 100
              )
            : 0;

    const thumbnails =
        Array.isArray(product.gallery) && product.gallery.length > 0
            ? product.gallery.filter(Boolean)
            : [primaryImg];

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div
                className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col md:flex-row max-h-[90vh] overflow-y-auto no-scrollbar"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close quick view modal"
                    className="absolute top-4 right-4 z-10 p-2 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-600 dark:text-gray-300 hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
                >
                    <X className="h-5 w-5" />
                </button>

                {/* Left: Images */}
                <div className="w-full md:w-1/2 p-6 flex flex-col gap-4">
                    <div
                        ref={imageBoxRef}
                        className="w-full aspect-square bg-gray-50 dark:bg-gray-800/50 rounded-xl flex items-center justify-center relative overflow-hidden p-4"
                    >
                        <img
                            src={activeImage || primaryImg}
                            alt={cleanTitle}
                            className="w-full h-full object-contain drop-shadow-md transition-all duration-300"
                            onError={(e) => {
                                const img = e.currentTarget;
                                if (img.dataset.fallbackApplied) return;
                                img.dataset.fallbackApplied = "true";
                                img.src = FALLBACK_IMAGE;
                            }}
                        />
                        {discount > 0 && (
                            <div className="absolute top-4 left-4 bg-rose-500 text-white text-xs font-bold px-3 py-1 rounded-md shadow-sm">
                                -{discount}%
                            </div>
                        )}
                    </div>

                    {thumbnails.length > 1 && (
                        <div className="flex gap-2 overflow-x-auto pb-1">
                            {thumbnails.map((img, i) => (
                                <button
                                    type="button"
                                    key={`${img}-${i}`}
                                    onClick={() => setActiveImage(img)}
                                    className={`w-16 h-16 shrink-0 rounded-lg bg-gray-50 dark:bg-gray-800 border-2 flex items-center justify-center cursor-pointer transition-all ${
                                        activeImage === img
                                            ? "border-[#f76b1c]"
                                            : "border-transparent hover:border-gray-300 dark:hover:border-gray-600"
                                    }`}
                                >
                                    <img
                                        src={img}
                                        alt={`${cleanTitle} thumbnail ${i + 1}`}
                                        className="w-full h-full object-contain p-1"
                                        onError={(e) => {
                                            const target = e.currentTarget;
                                            if (target.dataset.fallbackApplied) return;
                                            target.dataset.fallbackApplied = "true";
                                            target.src = FALLBACK_IMAGE;
                                        }}
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right: Details */}
                <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col">
                    {cleanBrand && (
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
                            {cleanBrand}
                        </span>
                    )}

                    <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white mb-2">
                        {cleanTitle}
                    </h2>

                    {/* Rating */}
                    <div className="flex items-center gap-1 mb-4 text-amber-500">
                        {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} className="h-4 w-4 fill-current" />
                        ))}
                        <span className="text-xs text-gray-500 ml-1">
                            Verified Product
                        </span>
                    </div>

                    {/* Availability */}
                    <div className="flex items-center gap-2 mb-4 text-sm">
                        <span className="font-bold text-gray-700 dark:text-gray-300">
                            Availability:
                        </span>
                        {inStock ? (
                            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                                <CheckCircle2 className="h-4 w-4" />
                                {typeof product.stockCount === "number" &&
                                product.stockCount > 0
                                    ? `${product.stockCount} in stock`
                                    : "In Stock"}
                            </span>
                        ) : (
                            <span className="flex items-center gap-1 text-rose-500 font-medium">
                                <XCircle className="h-4 w-4" />
                                Out of Stock
                            </span>
                        )}
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline gap-3 mb-4">
                        <span className="text-2xl font-black text-[#f76b1c]">
                            {currencySymbol}
                            {safePrice}
                        </span>
                        {safeOriginalPrice !== undefined &&
                            safeOriginalPrice > safePrice && (
                                <span className="text-lg text-gray-400 line-through">
                                    {currencySymbol}
                                    {safeOriginalPrice}
                                </span>
                            )}
                        {discount > 0 && (
                            <span className="bg-rose-500 text-white text-xs font-bold px-2 py-0.5 rounded">
                                {discount}% off
                            </span>
                        )}
                    </div>

                    {/* Description */}
                    {cleanDescription && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                            {cleanDescription}
                        </p>
                    )}

                    {/* Optional Size Selector */}
                    {sizeOptions.length > 0 && (
                        <div className="mb-4">
                            <span className="text-sm font-bold text-gray-800 dark:text-gray-200 block mb-2">
                                Size:
                            </span>
                            <div className="flex flex-wrap gap-2">
                                {sizeOptions.map((size) => (
                                    <button
                                        type="button"
                                        key={size}
                                        onClick={() => setSelectedSize(size)}
                                        className={`px-4 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                                            selectedSize === size
                                                ? "border-[#f76b1c] text-[#f76b1c] bg-orange-50 dark:bg-orange-950/30"
                                                : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300"
                                        }`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Optional Material Selector */}
                    {materialOptions.length > 0 && (
                        <div className="mb-6">
                            <span className="text-sm font-bold text-gray-800 dark:text-gray-200 block mb-2">
                                Material / Origin:
                            </span>
                            <div className="flex flex-wrap gap-2">
                                {materialOptions.map((material) => (
                                    <button
                                        type="button"
                                        key={material}
                                        onClick={() => setSelectedMaterial(material)}
                                        className={`px-4 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                                            selectedMaterial === material
                                                ? "border-[#f76b1c] text-[#f76b1c] bg-orange-50 dark:bg-orange-950/30"
                                                : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300"
                                        }`}
                                    >
                                        {material}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Quantity */}
                    <div className="flex items-center justify-between gap-4 mb-6">
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
                                Quantity:
                            </span>
                            <div className="flex items-center border border-gray-300 dark:border-gray-700 rounded-xl overflow-hidden">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setQuantity((q) => Math.max(1, q - 1))
                                    }
                                    aria-label="Decrease quantity"
                                    className="px-3 py-2 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                                >
                                    <Minus className="h-3.5 w-3.5" />
                                </button>
                                <span className="w-10 text-center text-sm font-bold">
                                    {quantity}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setQuantity((q) => q + 1)}
                                    aria-label="Increase quantity"
                                    className="px-3 py-2 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </div>

                        {product.slug && (
                            <Link
                                href={`/products/${product.slug}`}
                                onClick={onClose}
                                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                            >
                                Full Details →
                            </Link>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row items-center gap-3 mt-auto">
                        <button
                            type="button"
                            onClick={handleWishlistToggle}
                            aria-label="Toggle wishlist"
                            className={`flex items-center justify-center h-[46px] w-[46px] shrink-0 border rounded-xl transition-colors cursor-pointer ${
                                isWishlisted
                                    ? "border-rose-500 text-rose-500 bg-rose-50 dark:bg-rose-950/30"
                                    : "border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:text-rose-500 hover:border-rose-500"
                            }`}
                            title="Add to Wishlist"
                        >
                            <Heart
                                className={`h-5 w-5 ${
                                    isWishlisted ? "fill-current" : ""
                                }`}
                            />
                        </button>

                        <button
                            type="button"
                            onClick={handleAddToCart}
                            disabled={!inStock}
                            className="flex-1 w-full flex items-center justify-center gap-2 bg-[#f76b1c] text-white py-3 px-4 rounded-xl hover:bg-[#e05a12] transition-all font-bold text-sm h-[46px] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ShoppingCart className="h-4 w-4" />
                            <span>Add to cart</span>
                        </button>

                        <button
                            type="button"
                            onClick={handleBuyNow}
                            disabled={!inStock}
                            className="flex-1 w-full flex items-center justify-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-3 px-4 rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-all font-bold text-sm h-[46px] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span>Buy it now</span>
                            <ArrowRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}