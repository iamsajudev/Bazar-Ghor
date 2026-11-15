"use client"; // Zustand ব্যবহার করার জন্য ক্লায়েন্ট কম্পোনেন্ট হতে হবে

import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";

interface ProductCardProps {
  id: number; // কার্টে প্রোডাক্ট শনাক্ত করার জন্য id যোগ করা হলো
  title: string;
  price: number;
  originalPrice?: number;
  image: string;
}

export function ProductCard({ id, title, price, originalPrice, image }: ProductCardProps) {
  // স্টোর থেকে addItem এবং toggleCart ফাংশন নিন
  const { addItem, toggleCart } = useCartStore();

  const handleAddToCart = () => {
    addItem({
      id: id,
      title: title,
      price: price,
      image: image,
    });
    // কার্টে যোগ করার পর ড্রয়ারটি ওপেন করে দেবে
    toggleCart();
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-md transition-shadow group flex flex-col">

      {/* প্রোডাক্ট ইমেজ */}
      <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {originalPrice && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            Discount
          </span>
        )}
      </div>

      {/* প্রোডাক্ট ডিটেইলস */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-sm md:text-base font-semibold text-gray-900 dark:text-white line-clamp-2 mb-2">
          {title}
        </h3>

        <div className="mt-auto">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg font-bold text-green-700 dark:text-green-500">$ {price}</span>
            {originalPrice && (
              <span className="text-sm text-gray-400 line-through">$ {originalPrice}</span>
            )}
          </div>

          {/* কার্টে যোগ করার বাটনে onClick ইভেন্ট যুক্ত করা হলো */}
          <button
            onClick={handleAddToCart}
            className="w-full flex items-center justify-center gap-2 bg-green-50 dark:bg-gray-800 text-green-700 dark:text-green-400 border border-green-200 dark:border-gray-700 py-2 rounded-md hover:bg-green-700 hover:text-white dark:hover:bg-green-600 dark:hover:text-white transition-colors cursor-pointer"
          >
            <ShoppingCart className="h-4 w-4" />
            <span className="text-sm font-medium">Buy Now</span>
          </button>
        </div>
      </div>
    </div>
  );
}