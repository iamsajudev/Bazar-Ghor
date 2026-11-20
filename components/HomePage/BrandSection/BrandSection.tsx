"use client";

import React, { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useBrands } from "@/hook/useBrands";

const PLACEHOLDER_LOGO = "/images/logo-main.png"; // public/images-এ একটি ডিফল্ট লোগো রাখুন

export const BrandSection = () => {
    const { brands, isLoading, error } = useBrands();

    const [emblaRef, emblaApi] = useEmblaCarousel(
        { loop: true, align: "start", slidesToScroll: 1 },
        [Autoplay({ delay: 3000, stopOnInteraction: false, stopOnMouseEnter: true })]
    );

    const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
    const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

    // ✅ ডাটা পরে এলে Embla-কে নতুন করে হিসাব করাতে হবে
    useEffect(() => {
        if (emblaApi) emblaApi.reInit();
    }, [emblaApi, brands]);

    // লোডিং স্টেট
    if (isLoading) {
        return (
            <section className="mb-14 mt-10 flex justify-center items-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            </section>
        );
    }

    // এরর বা খালি হলে সেকশনটাই দেখাবো না (হোমপেজে খালি ব্র্যান্ড সেকশনের দরকার নেই)
    if (error || brands.length === 0) {
        return null;
    }

    return (
        <section className="mb-14 mt-10">
            {/* Section Header */}
            <div className="flex items-end justify-between mb-6">
                <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-green-600 dark:text-green-400">
                        Our Partners
                    </span>
                    <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight mt-0.5">
                        Top Brands
                    </h2>
                </div>

                {/* Navigation Controls */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={scrollPrev}
                        aria-label="Previous brands"
                        className="h-9 w-9 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-green-600 hover:text-white hover:border-green-600 transition-all cursor-pointer"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                        onClick={scrollNext}
                        aria-label="Next brands"
                        className="h-9 w-9 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-green-600 hover:text-white hover:border-green-600 transition-all cursor-pointer"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Carousel Viewport */}
            <div className="overflow-hidden px-1 py-2" ref={emblaRef}>
                <div className="flex -ml-3 md:-ml-4 touch-pan-y">
                    {brands.map((brand) => {
                        const logoUrl =
                            brand.logo_url || brand.thumbnail_url || brand.icon_url || PLACEHOLDER_LOGO;

                        return (
                            <div
                                key={brand.id}
                                className="flex-[0_0_33.33%] sm:flex-[0_0_25%] md:flex-[0_0_20%] lg:flex-[0_0_14.28%] pl-3 md:pl-4 min-w-0"
                            >
                                <Link
                                    href={`/brand/${brand.slug}`}
                                    title={brand.name}
                                    className="group relative flex items-center justify-center p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-green-500/50 hover:shadow-md transition-all duration-300 h-24"
                                >
                                    <img
                                        src={logoUrl}
                                        alt={brand.name}
                                        className="w-full h-full object-contain grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-500 ease-out opacity-70 group-hover:opacity-100"
                                        onError={(e) => {
                                            const img = e.currentTarget;
                                            if (img.dataset.fallbackApplied) return; // prevent infinite loop
                                            img.dataset.fallbackApplied = "true";
                                            img.src = PLACEHOLDER_LOGO;
                                        }}
                                    />
                                </Link>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};