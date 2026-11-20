"use client";

import React, { useState, useEffect, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowUpRight } from "lucide-react";
import { useCategories } from "@/hook/useCategories";

type AlignType = "start" | "between" | "center";

interface FeaturedCategoriesProps {
    align?: AlignType;
}

function FeaturedCategoryItemSkeleton() {
    return (
        <div className="flex-[0_0_50%] sm:flex-[0_0_33.33%] md:flex-[0_0_25%] lg:flex-[0_0_16.66%]">
            <div className="flex flex-col items-center p-4 rounded-2xl">
                <div className="w-30 h-30 md:w-40 md:h-39 rounded-2xl bg-green-100/80 dark:bg-green-900/20 border-2 border-green-200/60 dark:border-green-800/30 mb-3" />
                <div className="h-4 w-24 rounded-md bg-gray-200 dark:bg-gray-800" />
            </div>
        </div>
    );
}

function FeaturedCategoriesSkeleton({ align = "between" }: FeaturedCategoriesProps) {
    const getHeaderClasses = () => {
        switch (align) {
            case "center":
                return "flex-col items-center text-center gap-4";
            case "start":
                return "flex-col items-start text-left gap-4";
            case "between":
            default:
                return "flex-row items-end justify-between gap-4";
        }
    };

    return (
        <section className="my-25 animate-pulse" aria-hidden="true">
            <div className={`flex mb-6 ${getHeaderClasses()}`}>
                <div className={align === "between" ? "" : "w-full flex flex-col items-center"}>
                    <div className="h-3 w-28 rounded bg-green-100 dark:bg-green-900/40 mb-2" />
                    <div className="h-7 w-52 md:w-64 rounded-lg bg-gray-200 dark:bg-gray-800" />
                </div>

                <div className={`flex items-center gap-2 ${align === "center" ? "mt-2" : ""}`}>
                    <div className="h-9 w-9 rounded-xl bg-gray-200 dark:bg-gray-800" />
                    <div className="h-9 w-9 rounded-xl bg-gray-200 dark:bg-gray-800" />
                </div>
            </div>

            <div className="flex overflow-hidden">
                {Array.from({ length: 6 }).map((_, idx) => (
                    <FeaturedCategoryItemSkeleton key={idx} />
                ))}
            </div>
        </section>
    );
}

export const FeaturedCategories = ({ align = "between" }: FeaturedCategoriesProps) => {
    const { categories: apiCategories, isLoading, error } = useCategories();

    const [emblaRef, emblaApi] = useEmblaCarousel(
        {
            loop: true,
            align: "center",
            slidesToScroll: 1,
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

    const getHeaderClasses = () => {
        switch (align) {
            case "center":
                return "flex-col items-center text-center gap-4";
            case "start":
                return "flex-col items-start text-left gap-4";
            case "between":
            default:
                return "flex-row items-end justify-between gap-4";
        }
    };

    if (isLoading) {
        return <FeaturedCategoriesSkeleton align={align} />;
    }

    if (error || !apiCategories || apiCategories.length === 0) {
        return null;
    }

    return (
        <section className="my-25">
            {/* Header Layout */}
            <div className={`flex mb-6 ${getHeaderClasses()}`}>
                <div className={align === "between" ? "" : "w-full"}>
                    <span className="text-xs font-bold uppercase tracking-wider text-green-600 dark:text-green-400 block mb-1">
                        Browse By Category
                    </span>
                    <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                        Featured Categories
                    </h2>
                </div>

                <div className={`flex items-center gap-2 ${align === "center" ? "mt-2" : ""}`}>
                    <button
                        type="button"
                        onClick={scrollPrev}
                        disabled={!canScrollPrev}
                        aria-label="Previous categories"
                        className="h-9 w-9 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-green-600 hover:text-white hover:border-green-600 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        onClick={scrollNext}
                        disabled={!canScrollNext}
                        aria-label="Next categories"
                        className="h-9 w-9 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-green-600 hover:text-white hover:border-green-600 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Carousel Viewport */}
            <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex touch-pan-y">
                    {apiCategories.map((category) => {
                        const imageUrl = category.image_url
                            ? category.image_url
                            : "/images/category-not-found.webp";

                        return (
                            <div
                                key={category.id}
                                className="flex-[0_0_50%] sm:flex-[0_0_33.33%] md:flex-[0_0_25%] lg:flex-[0_0_16.66%]"
                            >
                                <Link
                                    href={`/category/${category.slug}`}
                                    className="group relative flex flex-col items-center p-4 rounded-2xl border border-transparent hover:border-green-500 transition-all duration-300 overflow-hidden"
                                >
                                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl">
                                        <div className="absolute inset-0 bg-green-500/10 rounded-2xl animate-pulse" />
                                        <div className="absolute inset-0 border-2 border-green-500 rounded-2xl" />
                                    </div>

                                    <div className="relative w-30 h-30 md:w-40 md:h-39 rounded-2xl bg-green-100 dark:bg-green-900/30 border-2 border-green-200 dark:border-green-800/50 overflow-hidden mb-3 flex items-center justify-center group-hover:bg-green-200 dark:group-hover:bg-green-900/50 transition-colors z-10 shadow-sm">
                                        <img
                                            src={imageUrl}
                                            alt={category.name}
                                            className="w-full h-full object-contain p-0 group-hover:scale-110 transition-transform duration-500 ease-out"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src =
                                                    "/images/placeholder-category.png";
                                            }}
                                        />
                                    </div>

                                    <div className="flex items-center justify-center gap-1 w-full relative z-10">
                                        <span className="text-xs md:text-sm font-semibold text-gray-800 dark:text-gray-200 group-hover:text-green-700 dark:group-hover:text-green-400 transition-colors truncate">
                                            {category.name}
                                        </span>
                                        <ArrowUpRight className="h-3.5 w-3.5 text-green-600 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 shrink-0 hidden sm:block" />
                                    </div>
                                </Link>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};