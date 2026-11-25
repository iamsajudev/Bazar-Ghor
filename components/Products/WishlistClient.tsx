"use client";

import React, { useEffect, useState } from "react";
import { useWishlistStore, type WishlistItem } from "@/store/useWishlistStore";
import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";
import { Heart, ShoppingCart, Trash2, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

function WishlistCardImage({ src, alt }: { src: string; alt: string }) {
    const [imgSrc, setImgSrc] = useState(src || "/images/placeholder-category.png");

    useEffect(() => {
        setImgSrc(src || "/images/placeholder-category.png");
    }, [src]);

    return (
        <Image
            src={imgSrc}
            alt={alt}
            fill
            onError={() => setImgSrc("/images/placeholder-category.png")}
            className="object-contain p-3 group-hover:scale-105 transition-transform"
        />
    );
}

export function WishlistClient() {
    const { items, removeItem, syncWithServer, isHydrated } = useWishlistStore();
    const { addItem, toggleCart } = useCartStore();
    const { isAuthenticated, isHydrated: authHydrated } = useAuthStore();
    const [movingId, setMovingId] = useState<number | null>(null);

    useEffect(() => {
        if (authHydrated && isAuthenticated) {
            void syncWithServer();
        }
    }, [authHydrated, isAuthenticated, syncWithServer]);

    const handleMoveToCart = async (item: WishlistItem) => {
        setMovingId(item.id);
        try {
            const safePrice =
                typeof item.price === "number" && Number.isFinite(item.price)
                    ? item.price
                    : 0;

            await addItem({
                id: item.id,
                title: item.title,
                price: safePrice,
                image: item.image,
                variantId: item.variantId ?? item.id,
                quantity: 1,
            });
            await removeItem(item.id);
            toggleCart();
        } finally {
            setMovingId(null);
        }
    };

    if (!isHydrated) {
        return (
            <div className="container mx-auto px-4 py-12 min-h-[60vh] flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600" />
            </div>
        );
    }

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
                    {items.map((item) => {
                        const productHref = `/products/${item.slug || item.id}`;
                        const displayPrice =
                            typeof item.price === "number" && Number.isFinite(item.price)
                                ? item.price.toFixed(2)
                                : "0.00";
                        const isMoving = movingId === item.id;

                        return (
                            <div
                                key={item.id}
                                className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 flex flex-col group hover:shadow-md transition-shadow"
                            >
                                <Link
                                    href={productHref}
                                    className="block relative aspect-square overflow-hidden bg-gray-50 dark:bg-gray-800 rounded-lg mb-3"
                                >
                                    <WishlistCardImage src={item.image} alt={item.title} />
                                </Link>

                                <Link
                                    href={productHref}
                                    className="text-sm font-semibold text-gray-800 dark:text-gray-200 line-clamp-2 mb-1 hover:text-green-600"
                                >
                                    {item.title}
                                </Link>
                                <p className="text-lg font-bold text-[#f76b1c] mb-3">
                                    ৳ {displayPrice}
                                </p>

                                <div className="mt-auto flex gap-2">
                                    <button
                                        type="button"
                                        disabled={isMoving}
                                        onClick={() => void handleMoveToCart(item)}
                                        className="flex-1 flex items-center justify-center gap-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                                    >
                                        {isMoving ? (
                                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        ) : (
                                            <ShoppingCart className="h-3.5 w-3.5" />
                                        )}
                                        Add to Cart
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => void removeItem(item.id)}
                                        className="p-2 text-gray-400 hover:text-red-600 bg-gray-50 dark:bg-gray-800 rounded-lg transition-colors cursor-pointer"
                                        title="Remove"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}