"use client";

import { ShoppingCart, ShoppingBag, ArrowRight, Heart } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useRouter } from "next/navigation";
import { useRef, useState, useEffect } from "react";
import { flyToCart } from "@/utils/flyToCart";

interface TopSellingCardProps {
    id: number;
    title: string;
    price: number;
    originalPrice?: number;
    image: string;
    isBestSelling?: boolean;
    description?: string;
    slug?: string;
}

export function TopSellingCard({ id, title, price, originalPrice, image, description, isBestSelling = false, slug }: TopSellingCardProps) {
    const { addItem, toggleCart, buyNow } = useCartStore();
    const { addItem: addWishlistItem, removeItem: removeWishlistItem, isInWishlist, isHydrated } = useWishlistStore();
    const router = useRouter();

    const imageRef = useRef<HTMLDivElement>(null);
    
    // ✅ হাইড্রেশন চেক
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    // ✅ isWishlisted স্টোর থেকে
    const isWishlisted = mounted && isHydrated ? isInWishlist(id) : false;

    const handleAddToCart = (e: React.MouseEvent) => {
        e.stopPropagation();
        // ✅ ফ্লাই অ্যানিমেশন কল
        if (imageRef.current) {
            flyToCart(image, imageRef.current);
        }
        addItem({ id, title, price, image });
        setTimeout(() => {
            toggleCart();
        }, 800);
    };

    const handleBuyNow = (e: React.MouseEvent) => {
        e.stopPropagation();
        buyNow({ id, title, price, image });
        router.push("/checkout");
    };

    // ✅ Wishlist হ্যান্ডলার
    const handleWishlist = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isWishlisted) {
            removeWishlistItem(id);
        } else {
            addWishlistItem({ id, title, price, image });
            if (imageRef.current) {
                flyToCart(image, imageRef.current, "wishlist-icon-target");
            }
        }
    };

    const handleCardClick = () => {
        const productSlug = slug || id;
        router.push(`/products/${productSlug}`);
    };

    const discount = originalPrice ? originalPrice - price : 0;

    return (
        <div
            onClick={handleCardClick}
            className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-gray-100 dark:border-gray-800/60 overflow-hidden flex flex-row items-stretch gap-6 p-5 group hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 min-h-[220px] sm:min-h-[260px] cursor-pointer"
        >

            {/* Best Selling Ribbon */}
            {isBestSelling && (
                <div className="absolute top-0 right-0 bg-gradient-to-r from-red-500 to-red-600 text-white text-[11px] font-semibold px-3 py-1.5 rounded-bl-xl flex items-center gap-1.5 z-10 shadow-sm tracking-wide">
                    <ShoppingBag className="h-3.5 w-3.5" />
                    Best Selling
                </div>
            )}

            {/* ✅ Product Image Container with Ref and Wishlist Button */}
            <div 
                ref={imageRef} 
                className="relative w-36 h-36 sm:w-48 sm:h-48 shrink-0 bg-gray-50/50 dark:bg-gray-800/30 rounded-xl overflow-hidden flex items-center justify-center p-3 group/img"
            >
                <img
                    src={image}
                    alt={title}
                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500 ease-out mix-blend-multiply dark:mix-blend-normal"
                />

                {/* ✅ Wishlist Button (হোভারে দেখা যাবে) */}
                <button
                    onClick={handleWishlist}
                    className={`absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full shadow-md transition-all z-20 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 ${
                        isWishlisted
                            ? "bg-red-500 text-white"
                            : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-red-500 hover:text-white"
                    }`}
                >
                    <Heart className={`h-4 w-4 ${isWishlisted ? "fill-current" : ""}`} />
                </button>
            </div>

            {/* Product Details Container */}
            <div className="flex flex-col flex-1 justify-between py-1 mt-3">
                <div>
                    <h3 className="text-sm sm:text-base font-bold text-gray-800 dark:text-gray-100 line-clamp-2 mb-2 group-hover:text-orange-600 transition-colors">
                        {title}
                    </h3>

                    <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-xl sm:text-2xl font-black text-[#f76b1c] tracking-tight">${price}</span>
                        {originalPrice && (
                            <span className="text-xs sm:text-sm text-gray-400 line-through font-medium">${originalPrice}</span>
                        )}
                    </div>

                    {discount > 0 && (
                        <div className="mb-3">
                            <span className="inline-flex items-center bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400 text-[11px] font-bold px-2.5 py-1 rounded-md border border-green-100 dark:border-green-900/50">
                                Save ${discount}
                            </span>
                        </div>
                    )}
                    {description && (
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2 max-w-[250px] sm:max-w-[300px]">
                            {description}
                        </p>
                    )}
                </div>

                <div className="flex items-center gap-2 mt-auto pt-2">
                    <button
                        onClick={handleAddToCart}
                        className="flex items-center justify-center gap-1 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 py-1.5 px-3 rounded-md hover:border-[#f76b1c] hover:text-[#f76b1c] dark:hover:border-[#f76b1c] dark:hover:text-[#f76b1c] transition-all text-[11px] sm:text-xs font-semibold cursor-pointer shrink-0"
                    >
                        <ShoppingCart className="h-3.5 w-3.5" />
                        <span>Add To Cart</span>
                    </button>

                    <button
                        onClick={handleBuyNow}
                        className="flex items-center justify-center gap-1 bg-[#f76b1c] text-white py-1.5 px-3 rounded-md hover:bg-[#e05a12] transition-all text-[11px] sm:text-xs font-semibold cursor-pointer shadow-xs hover:shadow-md shrink-0"
                    >
                        <span>Buy Now</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                </div>
            </div>
        </div>
    );
}