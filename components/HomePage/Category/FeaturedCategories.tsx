"use client";

import React, { useState, useEffect, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowUpRight } from "lucide-react";
import { MOCK_CATEGORIES } from "@/data/categories";

export const FeaturedCategories = () => {
    const [emblaRef, emblaApi] = useEmblaCarousel(
        {
            loop: true,
            align: "start",
            slidesToScroll: 2,
            containScroll: "trimSnaps",
        },
        [Autoplay({ delay: 3500, stopOnInteraction: false, stopOnMouseEnter: true })]
    );

    const [canScrollPrev, setCanScrollPrev] = useState(false);
    const [canScrollNext, setCanScrollNext] = useState(true);

    const onSelect = useCallback(() => {
        if (!emblaApi) return;
        setCanScrollPrev(emblaApi.canScrollPrev());
        setCanScrollNext(emblaApi.canScrollNext());
    }, [emblaApi]);

    useEffect(() => {
        if (!emblaApi) return;
        onSelect();
        emblaApi.on("select", onSelect);
        emblaApi.on("reInit", onSelect);
        return () => {
            emblaApi.off("select", onSelect);
            emblaApi.off("reInit", onSelect);
        };
    }, [emblaApi, onSelect]);

    const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
    const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

    return (
        <section className="mb-14">
            {/* Section Header with Integrated Controls */}
            <div className="flex items-end justify-between mb-6">
                {/* বাম পাশের টাইটেল ও সাবটাইটেল */}
                <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-green-600 dark:text-green-400">
                        Browse By Category
                    </span>
                    <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight mt-0.5">
                        Featured Categories
                    </h2>
                </div>

                {/* ডান পাশের নেভিগেশন অ্যারো কন্ট্রোল */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={scrollPrev}
                        aria-label="Previous categories"
                        className="h-9 w-9 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-green-600 hover:text-white hover:border-green-600 transition-all cursor-pointer"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                        onClick={scrollNext}
                        aria-label="Next categories"
                        className="h-9 w-9 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-green-600 hover:text-white hover:border-green-600 transition-all cursor-pointer"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Carousel Viewport */}
            <div className="overflow-hidden px-1 py-2" ref={emblaRef}>
                <div className="flex -ml-3 md:-ml-4 touch-pan-y">
                    {MOCK_CATEGORIES.map((category) => (
                        <div
                            key={category.id}
                            className="flex-[0_0_45%] sm:flex-[0_0_30%] md:flex-[0_0_20%] lg:flex-[0_0_12.5%] pl-3 md:pl-4 min-w-0"
                        >
                            <Link
                                href={category.link}
                                className="group relative flex flex-col items-center p-4 rounded-2xl border border-transparent hover:border-green-500 transition-all duration-300 overflow-hidden"
                            >
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl">
                                    <div className="absolute inset-0 bg-green-500/10 rounded-2xl animate-pulse"></div>
                                    <div className="absolute inset-0 border-2 border-green-500 rounded-2xl"></div>
                                </div>

                                {/* Image Box */}
                                <div className="relative w-30 h-30 md:w-36 md:h-36 rounded-2xl bg-green-100 dark:bg-green-900/30 border-2 border-green-200 dark:border-green-800/50 overflow-hidden mb-3 flex items-center justify-center group-hover:bg-green-200 dark:group-hover:bg-green-900/50 transition-colors z-10 shadow-sm">
                                    <img
                                        src={category.image}
                                        alt={category.name}
                                        className="w-full h-full object-contain p-0 group-hover:scale-110 transition-transform duration-500 ease-out"
                                    />
                                </div>

                                {/* Category Name */}
                                <div className="flex items-center justify-center gap-1 w-full relative z-10">
                                    <span className="text-xs md:text-sm font-semibold text-gray-800 dark:text-gray-200 group-hover:text-green-700 dark:group-hover:text-green-400 transition-colors truncate">
                                        {category.name}
                                    </span>
                                    <ArrowUpRight className="h-3.5 w-3.5 text-green-600 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 shrink-0 hidden sm:block" />
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};