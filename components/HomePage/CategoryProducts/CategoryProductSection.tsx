"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/Products/ProductCard";
import { Product } from "@/data/products";

interface CategoryProductSectionProps {
    title: string;
    subtitle?: string;
    categorySlug: string;
    products: Product[];
    viewAllLink?: string;
}

export const CategoryProductSection = ({
    title,
    subtitle = "Shop by Category",
    categorySlug,
    products,
    viewAllLink = "/products"
}: CategoryProductSectionProps) => {
    // ক্যাটাগরি স্লাগ অনুযায়ী প্রোডাক্ট ফিল্টার
    const filteredProducts = products.filter(
        (product) => product.category.slug === categorySlug
    );

    // যদি কোনো প্রোডাক্ট না থাকে, সেকশনটি দেখাবে না
    if (filteredProducts.length === 0) return null;

    return (
        <div className="mb-12">
            {/* হেডার */}
            <div className="flex items-end justify-between mb-6">
                <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-green-600 dark:text-green-400">
                        {subtitle}
                    </span>
                    <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white mt-0.5">
                        {title}
                    </h2>
                </div>

                <Link
                    href={viewAllLink}
                    className="text-xs md:text-sm font-semibold text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors flex items-center gap-1 group"
                >
                    <span>View All</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>

            {/* প্রোডাক্ট গ্রিড */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {filteredProducts.map((product) => (
                    <ProductCard
                        key={product.id}
                        id={product.id}
                        title={product.title}
                        price={product.price}
                        originalPrice={product.originalPrice}
                        image={product.image}
                    />
                ))}
            </div>
        </div>
    );
};