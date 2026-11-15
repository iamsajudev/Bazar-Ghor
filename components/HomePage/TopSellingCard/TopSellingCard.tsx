"use client";

import { ShoppingCart, ShoppingBag, ArrowRight } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";

interface TopSellingCardProps {
    id: number;
    title: string;
    price: number;
    originalPrice?: number;
    image: string;
    isBestSelling?: boolean;
    description?: string;
}

export function TopSellingCard({ id, title, price, originalPrice, image, description, isBestSelling = false }: TopSellingCardProps) {
    const { addItem, toggleCart } = useCartStore();

    const handleAddToCart = () => {
        addItem({ id, title, price, image });
        toggleCart();
    };

    // Calculate discount amount
    const discount = originalPrice ? originalPrice - price : 0;

    return (
        <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-gray-100 dark:border-gray-800/60 overflow-hidden flex flex-row items-stretch gap-6 p-5 group hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 min-h-[220px] sm:min-h-[260px]">

            {/* Best Selling Ribbon */}
            {isBestSelling && (
                <div className="absolute top-0 right-0 bg-gradient-to-r from-red-500 to-red-600 text-white text-[11px] font-semibold px-3 py-1.5 rounded-bl-xl flex items-center gap-1.5 z-10 shadow-sm tracking-wide">
                    <ShoppingBag className="h-3.5 w-3.5" />
                    Best Selling
                </div>
            )}

            {/* Product Image Container (উচ্চতা বাড়ানো হয়েছে) */}
            <div className="relative w-36 h-36 sm:w-48 sm:h-48 shrink-0 bg-gray-50/50 dark:bg-gray-800/30 rounded-xl overflow-hidden flex items-center justify-center p-3">
                <img
                    src={image}
                    alt={title}
                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500 ease-out mix-blend-multiply dark:mix-blend-normal"
                />
            </div>

            {/* Product Details Container */}
            <div className="flex flex-col flex-1 justify-between py-1 mt-3">
                <div>
                    <h3 className="text-sm sm:text-base font-bold text-gray-800 dark:text-gray-100 line-clamp-2 mb-2 group-hover:text-orange-600 transition-colors">
                        {title}
                    </h3>

                    {/* Price Section */}
                    <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-xl sm:text-2xl font-black text-[#f76b1c] tracking-tight">${price}</span>
                        {originalPrice && (
                            <span className="text-xs sm:text-sm text-gray-400 line-through font-medium">${originalPrice}</span>
                        )}
                    </div>

                    {/* Save Amount Badge */}
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

                {/* Action Buttons */}
                <div className="flex items-center gap-2 mt-auto pt-2">
                    <button
                        onClick={handleAddToCart}
                        className="flex items-center justify-center gap-1 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 py-1.5 px-3 rounded-md hover:border-[#f76b1c] hover:text-[#f76b1c] dark:hover:border-[#f76b1c] dark:hover:text-[#f76b1c] transition-all text-[11px] sm:text-xs font-semibold cursor-pointer shrink-0"
                    >
                        <ShoppingCart className="h-3.5 w-3.5" />
                        <span>Add To Cart</span>
                    </button>

                    <button
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