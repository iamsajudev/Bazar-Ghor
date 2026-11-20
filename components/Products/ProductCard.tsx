"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ShoppingCart,
  ArrowRight,
  Eye,
  Heart,
  CheckCircle2,
  XCircle,
  Sparkles,
} from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { ProductQuickViewModal } from "./ProductQuickViewModal";
import { flyToCart } from "@/utils/flyToCart";

export interface ProductCardProps {
  id: number;
  title: string;
  price: number;
  originalPrice?: number;
  image: string;
  slug?: string;
  variantId?: number | null;
  brand?: string;
  inStock?: boolean;
  isFeatured?: boolean;
  currencySymbol?: string;
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
    .replace(/&gt;/g, ">");
}

export function ProductCard({
  id,
  title,
  price,
  originalPrice,
  image,
  slug,
  variantId,
  brand,
  inStock = true,
  isFeatured = false,
  currencySymbol = "$",
}: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const toggleCart = useCartStore((state) => state.toggleCart);

  const addWishlistItem = useWishlistStore((state) => state.addItem);
  const removeWishlistItem = useWishlistStore((state) => state.removeItem);
  const isInWishlist = useWishlistStore((state) => state.isInWishlist);
  const isHydrated = useWishlistStore((state) => state.isHydrated);

  const router = useRouter();
  const imageRef = useRef<HTMLDivElement>(null);

  const [mounted, setMounted] = useState(false);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const isWishlisted = mounted && isHydrated ? isInWishlist(id) : false;
  const resolvedVariantId = variantId ?? id;

  const safePrice = toSafeNumber(price, 0);
  const safeOriginalPrice =
    originalPrice !== undefined ? toSafeNumber(originalPrice, 0) : undefined;
  const safeImage = image?.trim() || FALLBACK_IMAGE;
  const cleanTitle = cleanText(title) || "Untitled Product";
  const cleanBrand = cleanText(brand);

  const discountPercentage =
    safeOriginalPrice && safeOriginalPrice > safePrice && safeOriginalPrice > 0
      ? Math.round(((safeOriginalPrice - safePrice) / safeOriginalPrice) * 100)
      : 0;

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleCardClick = () => {
    const productSlug = slug || id;
    router.push(`/products/${productSlug}`);
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!inStock) return;
    if (imageRef.current) {
      flyToCart(safeImage, imageRef.current);
    }
    await addItem({
      id,
      title: cleanTitle,
      price: safePrice,
      image: safeImage,
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
      price: safePrice,
      image: safeImage,
      variantId: resolvedVariantId,
      quantity: 1,
    });
    router.push("/checkout");
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isWishlisted) {
      removeWishlistItem(id);
      showToast(`${cleanTitle} removed from wishlist!`);
    } else {
      addWishlistItem({
        id,
        title: cleanTitle,
        price: safePrice,
        image: safeImage,
      });
      if (imageRef.current) {
        flyToCart(safeImage, imageRef.current, "wishlist-icon-target");
      }
      showToast(`${cleanTitle} added to wishlist!`);
    }
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsQuickViewOpen(true);
  };

  return (
    <>
      <div
        onClick={handleCardClick}
        className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden group hover:shadow-lg hover:border-emerald-500/40 transition-all duration-300 cursor-pointer flex flex-col h-full p-3.5 sm:p-0"
      >
        {/* Top-Left Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 pointer-events-none">
          {discountPercentage > 0 && (
            <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">
              -{discountPercentage}%
            </span>
          )}
          {isFeatured && (
            <span className="inline-flex items-center gap-1 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">
              <Sparkles className="w-2.5 h-2.5" /> Featured
            </span>
          )}
          {!inStock && (
            <span className="bg-gray-800 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">
              Out of Stock
            </span>
          )}
        </div>

        {/* Image Box */}
        <div
          ref={imageRef}
          className="relative bg-gray-50 dark:bg-gray-800/40 rounded-xl overflow-hidden flex items-center justify-center shrink-0 w-full aspect-square mb-3"
        >
          <img
            src={safeImage}
            alt={cleanTitle}
            loading="lazy"
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 mix-blend-multiply dark:mix-blend-normal"
            onError={(e) => {
              const img = e.currentTarget;
              if (img.dataset.fallbackApplied) return;
              img.dataset.fallbackApplied = "true";
              img.src = FALLBACK_IMAGE;
            }}
          />

          {/* Hover Quick Actions */}
          <div className="absolute top-2 right-2 flex flex-col gap-1.5 transition-all duration-300 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 z-20">
            <button
              type="button"
              onClick={handleWishlist}
              aria-label="Toggle wishlist"
              className={`w-8 h-8 flex items-center justify-center rounded-full shadow-md transition-all cursor-pointer ${
                isWishlisted
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
              onClick={handleQuickView}
              aria-label="Quick view"
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-200 shadow-md hover:bg-emerald-600 hover:text-white transition-all cursor-pointer"
            >
              <Eye className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Card Details */}
        <div className="flex flex-col flex-1 justify-between min-w-0 sm:p-4 pt-1">
          <div>
            <div className="flex items-center justify-between gap-2 mb-1">
              {cleanBrand ? (
                <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider truncate">
                  {cleanBrand}
                </p>
              ) : (
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider truncate">
                  Collection
                </span>
              )}

              <span
                className={`inline-flex items-center gap-1 text-[11px] font-semibold shrink-0 ${
                  inStock
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
                    Sold Out
                  </>
                )}
              </span>
            </div>

            <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-gray-100 group-hover:text-[#f76b1c] transition-colors line-clamp-1 mb-2">
              {cleanTitle}
            </h3>

            {/* Price */}
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-lg sm:text-xl font-black text-[#f76b1c]">
                {currencySymbol}
                {safePrice}
              </span>
              {safeOriginalPrice !== undefined && safeOriginalPrice > safePrice && (
                <span className="text-xs sm:text-sm text-gray-400 line-through">
                  {currencySymbol}
                  {safeOriginalPrice}
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 mt-auto pt-2.5 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!inStock}
              className="flex-1 px-2.5 flex items-center justify-center gap-1.5 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 py-2 rounded-xl hover:border-[#f76b1c] hover:text-[#f76b1c] transition-all text-xs font-bold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingCart className="h-3.5 w-3.5 shrink-0" />
              <span>Cart</span>
            </button>

            <button
              type="button"
              onClick={handleBuyNow}
              disabled={!inStock}
              className="flex-1 px-2.5 flex items-center justify-center gap-1 bg-[#f76b1c] text-white py-2 rounded-xl hover:bg-[#e05a12] transition-all text-xs font-bold cursor-pointer shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Buy Now</span>
              <ArrowRight className="h-3.5 w-3.5 shrink-0" />
            </button>
          </div>
        </div>
      </div>

      <ProductQuickViewModal
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
        product={{
          id,
          title: cleanTitle,
          price: safePrice,
          originalPrice: safeOriginalPrice,
          image: safeImage,
        }}
      />

      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-[200] animate-in slide-in-from-right-full fade-in duration-300">
          <div className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-3 rounded-lg shadow-2xl flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <p className="text-sm font-medium">{toastMessage}</p>
          </div>
        </div>
      )}
    </>
  );
}