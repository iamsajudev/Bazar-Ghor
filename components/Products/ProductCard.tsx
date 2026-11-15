"use client";

import { ShoppingCart, ArrowRight, Eye } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useRouter } from "next/navigation";

interface ProductCardProps {
  id: number;
  title: string;
  price: number;
  originalPrice?: number;
  image: string;
}

export function ProductCard({ id, title, price, originalPrice, image }: ProductCardProps) {
  const { addItem, toggleCart, buyNow } = useCartStore();
  const router = useRouter();

  const handleAddToCart = () => {
    addItem({ id, title, price, image });
    toggleCart();
  };

  const handleBuyNow = () => {
    buyNow({ id, title, price, image });
    router.push("/checkout");
  };

  // ডিসকাউন্ট পার্সেন্টেজ বা সাশ্রয় ক্যালকুলেশন
  const discountAmount = originalPrice ? originalPrice - price : 0;
  const discountPercentage = originalPrice ? Math.round((discountAmount / originalPrice) * 100) : 0;

  return (
    <div className="group relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-green-500/40 dark:hover:border-green-500/40 transition-all duration-300 overflow-hidden flex flex-col shadow-xs hover:shadow-xl">
      
      {/* টপ ডিসকাউন্ট ব্যাজ */}
      {discountPercentage > 0 && (
        <span className="absolute top-3 left-3 z-10 bg-red-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm">
          -{discountPercentage}%
        </span>
      )}

      {/* প্রোডাক্ট ইমেজ কন্টেইনার (হভার জুম ইফেক্ট সহ) */}
      <div className="relative aspect-square overflow-hidden bg-gray-50 dark:bg-gray-800 p-4 flex items-center justify-center">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500 ease-out"
        />

        {/* হভার করলে কুইক ভিউ বা অ্যাকশন ওভারলে (অপশনাল) */}
        <div className="absolute inset-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          {/* চাইলে এখানে কুইক ভিউ বাটন দিতে পারেন */}
        </div>
      </div>

      {/* প্রোডাক্ট ডিটেইলস */}
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div>
          <h3 className="text-sm md:text-base font-semibold text-gray-800 dark:text-gray-100 line-clamp-2 mb-2.5 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
            {title}
          </h3>
        </div>

        <div>
          {/* প্রাইস এবং ডিসকাউন্ট */}
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-base md:text-lg font-extrabold text-[#f76b1c]">
              ৳{price}
            </span>
            {originalPrice && (
              <span className="text-xs md:text-sm text-gray-400 line-through font-medium">
                ৳{originalPrice}
              </span>
            )}
          </div>

          {/* মডার্ন কমপ্যাক্ট বাটন ডিজাইন */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={handleAddToCart}
              className="flex items-center justify-center gap-1.5 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 py-2 px-2.5 rounded-xl hover:border-green-600 hover:text-green-600 dark:hover:border-green-500 dark:hover:text-green-400 transition-all text-xs font-bold cursor-pointer"
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              <span>Add</span>
            </button>

            <button
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
  );
}