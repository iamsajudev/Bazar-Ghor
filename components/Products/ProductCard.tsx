"use client";

import { ShoppingCart, ArrowRight, Eye, Heart, CheckCircle2 } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import { ProductQuickViewModal } from "./ProductQuickViewModal";
import { flyToCart } from "@/utils/flyToCart";

interface ProductCardProps {
  id: number;
  title: string;
  price: number;
  originalPrice?: number;
  image: string;
  slug?: string;
  variantId?: number | null;
}

export function ProductCard({
  id,
  title,
  price,
  originalPrice,
  image,
  slug,
  variantId,
}: ProductCardProps) {
  const { addItem, toggleCart } = useCartStore();
  const {
    addItem: addWishlistItem,
    removeItem: removeWishlistItem,
    isInWishlist,
  } = useWishlistStore();
  const router = useRouter();

  const isWishlisted = isInWishlist(id);

  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const imageRef = useRef<HTMLDivElement>(null);

  const resolvedVariantId = variantId ?? id;

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
    if (imageRef.current) {
      flyToCart(image, imageRef.current);
    }
    await addItem({
      id,
      title,
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
    await addItem({
      id,
      title,
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
      showToast(`${title} removed from wishlist!`);
    } else {
      addWishlistItem({ id, title, price, image });
      if (imageRef.current) {
        flyToCart(image, imageRef.current, "wishlist-icon-target");
      }
      showToast(`${title} added to wishlist!`);
    }
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsQuickViewOpen(true);
  };

  const discountAmount = originalPrice ? originalPrice - price : 0;
  const discountPercentage =
    originalPrice && originalPrice > 0
      ? Math.round((discountAmount / originalPrice) * 100)
      : 0;

  return (
    <>
      <div
        onClick={handleCardClick}
        className="group relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-green-500/40 dark:hover:border-green-500/40 transition-all duration-300 overflow-hidden flex flex-col shadow-xs hover:shadow-xl cursor-pointer"
      >
        {discountPercentage > 0 && (
          <span className="absolute top-3 left-3 z-10 bg-red-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm">
            -{discountPercentage}%
          </span>
        )}

        <div
          ref={imageRef}
          className="relative aspect-square overflow-hidden bg-gray-50 dark:bg-gray-800 p-4 flex items-center justify-center"
        >
          <img
            src={image}
            alt={title}
            className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500 ease-out"
          />

          <div className="absolute top-3 right-3 flex flex-col gap-2 z-20 translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
            <button
              type="button"
              onClick={handleWishlist}
              className={`w-9 h-9 flex items-center justify-center rounded-lg shadow-md transition-colors cursor-pointer ${isWishlisted
                  ? "bg-red-500 text-white"
                  : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-red-500 hover:text-white"
                }`}
            >
              <Heart className={`h-4 w-4 ${isWishlisted ? "fill-current" : ""}`} />
            </button>

            <button
              type="button"
              onClick={handleQuickView}
              className="w-9 h-9 flex items-center justify-center rounded-lg bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 shadow-md hover:bg-green-600 hover:text-white transition-colors cursor-pointer"
            >
              <Eye className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="p-4 flex flex-col flex-1 justify-between">
          <div>
            <h3 className="text-sm md:text-base font-semibold text-gray-800 dark:text-gray-100 line-clamp-2 mb-2.5 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
              {title}
            </h3>
          </div>

          <div>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-base md:text-lg font-extrabold text-[#f76b1c]">
                ${price}
              </span>
              {originalPrice && (
                <span className="text-xs md:text-sm text-gray-400 line-through font-medium">
                  ${originalPrice}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={handleAddToCart}
                className="flex items-center justify-center gap-1.5 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 py-2 px-2.5 rounded-xl hover:border-green-600 hover:text-green-600 dark:hover:border-green-500 dark:hover:text-green-400 transition-all text-xs font-bold cursor-pointer"
              >
                <ShoppingCart className="h-3.5 w-3.5" />
                <span>Add</span>
              </button>

              <button
                type="button"
                onClick={handleBuyNow}
                className="flex items-center justify-center gap-1.5 bg-green-600 text-white py-2 px-2.5 rounded-xl hover:bg-green-700 transition-all text-xs font-bold cursor-pointer shadow-xs hover:shadow-md"
              >
                <span>Buy</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <ProductQuickViewModal
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
        product={{ id, title, price, originalPrice, image }}
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