"use client";

import { useWishlistStore } from "@/store/useWishlistStore";
import { useCartStore } from "@/store/useCartStore";
import { Heart, ShoppingCart, Trash2, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export function WishlistClient() {
    const { items, removeItem } = useWishlistStore();
    const { addItem, toggleCart } = useCartStore();

    const handleMoveToCart = (item: { id: number; title: string; price: number; image: string }) => {
        addItem(item);
        removeItem(item.id);
        toggleCart();
    };

    return (
        <div className="container mx-auto px-4 py-12 min-h-[60vh]">
            <div className="flex items-center gap-3 mb-8">
                <Heart className="h-8 w-8 text-red-500 fill-current" />
                <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white">
                    My Wishlist
                </h1>
                <span className="text-sm text-gray-500">({items.length} items)</span>
            </div>

            {items.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 dark:bg-gray-900/50 rounded-2xl">
                    <div className="h-20 w-20 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Heart className="h-10 w-10" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                        Your wishlist is empty
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                        Save your favorite products here.
                    </p>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg font-semibold transition-colors"
                    >
                        Continue Shopping <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {items.map((item) => (
                        <div
                            key={item.id}
                            className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 flex flex-col group hover:shadow-md transition-shadow"
                        >
                            <Link
                                href={`/products/${item.id}`}
                                className="block relative aspect-square overflow-hidden bg-gray-50 dark:bg-gray-800 rounded-lg mb-3"
                            >
                                <Image
                                    src={item.image}
                                    alt={item.title}
                                    fill
                                    className="object-contain p-3 group-hover:scale-105 transition-transform"
                                />
                            </Link>

                            <Link
                                href={`/products/${item.id}`}
                                className="text-sm font-semibold text-gray-800 dark:text-gray-200 line-clamp-2 mb-1 hover:text-green-600"
                            >
                                {item.title}
                            </Link>
                            <p className="text-lg font-bold text-[#f76b1c] mb-3">
                                ${item.price.toFixed(2)}
                            </p>

                            <div className="mt-auto flex gap-2">
                                <button
                                    onClick={() => handleMoveToCart(item)}
                                    className="flex-1 flex items-center justify-center gap-1.5 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-xs font-bold transition-colors"
                                >
                                    <ShoppingCart className="h-3.5 w-3.5" />
                                    Add to Cart
                                </button>
                                <button
                                    onClick={() => removeItem(item.id)}
                                    className="p-2 text-gray-400 hover:text-red-600 bg-gray-50 dark:bg-gray-800 rounded-lg transition-colors"
                                    title="Remove"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}