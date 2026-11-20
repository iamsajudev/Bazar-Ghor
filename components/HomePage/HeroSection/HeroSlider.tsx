"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowUpRight, Sparkles } from "lucide-react";
import { HERO_SLIDES } from "@/data/heroSlides";
import { HeroBanner } from "@/types/hero";

export const HeroSliderSkeleton = () => {
    return (
        <section
            className="relative mb-12 w-full select-none animate-pulse"
            aria-hidden="true"
        >
            {/* Main Banner Grid Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch h-[380px] sm:h-[420px] lg:h-[460px]">
                <div className="lg:col-span-8 h-full rounded-3xl bg-gray-200/80 dark:bg-gray-800/80 ring-1 ring-black/5 dark:ring-white/10 p-6 md:p-8 flex flex-col justify-end">
                    <div className="h-6 w-28 rounded-full bg-emerald-200/70 dark:bg-emerald-900/40 mb-3" />
                    <div className="h-9 sm:h-11 w-3/4 rounded-xl bg-gray-300/80 dark:bg-gray-700/80 mb-2.5" />
                    <div className="h-4 w-2/3 rounded-md bg-gray-200 dark:bg-gray-700/60 mb-5" />
                    <div className="h-11 w-36 rounded-2xl bg-gray-300/90 dark:bg-gray-700" />
                </div>

                <div className="lg:col-span-4 h-full hidden lg:flex rounded-3xl bg-gray-200/70 dark:bg-gray-800/60 ring-1 ring-black/5 dark:ring-white/10 p-6 md:p-8 flex-col justify-end">
                    <div className="h-5 w-24 rounded-full bg-emerald-200/70 dark:bg-emerald-900/40 mb-3" />
                    <div className="h-7 w-4/5 rounded-lg bg-gray-300/80 dark:bg-gray-700/80 mb-2" />
                    <div className="h-4 w-3/5 rounded-md bg-gray-200 dark:bg-gray-700/60 mb-4" />
                    <div className="h-5 w-28 rounded-md bg-gray-300/80 dark:bg-gray-700" />
                </div>
            </div>

            {/* Pagination Dots Skeleton */}
            <div className="flex items-center justify-center gap-2 mt-5">
                <span className="h-2 w-10 rounded-full bg-emerald-200 dark:bg-emerald-900/50" />
                <span className="h-2 w-2 rounded-full bg-gray-200 dark:bg-gray-800" />
                <span className="h-2 w-2 rounded-full bg-gray-200 dark:bg-gray-800" />
            </div>
        </section>
    );
};

interface BannerCardProps {
    banner: HeroBanner;
    isActive: boolean;
    isGlass?: boolean;
}

const BannerCard = ({ banner, isActive, isGlass = false }: BannerCardProps) => (
    <Link
        href={banner.link}
        className={`relative block h-full w-full rounded-3xl overflow-hidden ring-1 ring-black/5 dark:ring-white/10 shadow-lg transition-all duration-700 ease-out transform ${
            isActive ? "opacity-100 translate-y-0 scale-100" : "opacity-40 translate-y-2 scale-[0.98]"
        } group/card`}
    >
        {/* Background Image with Smooth Zoom */}
        <img
            src={banner.image}
            alt={banner.title || "Hero Banner"}
            className={`absolute inset-0 w-full h-full object-cover transition-transform duration-1000 ease-out ${
                isActive ? "scale-100 group-hover/card:scale-105" : "scale-110"
            }`}
            loading="eager"
        />

        {/* Multi-layered Modern Gradient Overlay */}
        <div
            className={`absolute inset-0 transition-opacity duration-500 ${
                isGlass
                    ? "bg-gradient-to-t from-green/90 via-green/40 to-green/10 group-hover/card:via-emerald-950/50"
                    : "bg-gradient-to-t from-green/90 via-emerald-950/35 to-transparent"
            }`}
        />

        {/* Subtle Top Inner Highlight */}
        <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/15 pointer-events-none" />

        {/* Content Container */}
        <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end z-10 text-white">
            <div
                className={`transition-all duration-700 delay-150 transform ${
                    isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                }`}
            >
                {banner.badge && (
                    <span
                        className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[11px] font-semibold tracking-wider uppercase mb-3 backdrop-blur-md border ${
                            isGlass
                                ? "bg-white/15 border-white/20 text-white"
                                : "bg-emerald-500/90 border-emerald-400/30 text-white shadow-sm"
                        }`}
                    >
                        <Sparkles className="w-3 h-3" />
                        {banner.badge}
                    </span>
                )}

                {banner.title && (
                    <h2
                        className={`font-extrabold leading-[1.15] mb-2 tracking-tight drop-shadow-sm ${
                            isGlass ? "text-xl md:text-2xl" : "text-2xl sm:text-3xl md:text-4xl lg:text-[42px]"
                        }`}
                    >
                        {banner.title}
                    </h2>
                )}

                {banner.subtitle && (
                    <p
                        className={`mb-5 max-w-lg text-gray-200/90 font-normal leading-relaxed line-clamp-2 ${
                            isGlass ? "text-xs md:text-sm" : "text-sm md:text-base"
                        }`}
                    >
                        {banner.subtitle}
                    </p>
                )}

                {banner.ctaText && (
                    <div
                        className={`inline-flex items-center gap-2 font-semibold transition-all duration-300 ${
                            isGlass
                                ? "text-white/90 group-hover/card:text-emerald-300 text-xs md:text-sm"
                                : "bg-white text-gray-950 px-6 py-3 rounded-2xl text-xs md:text-sm shadow-md hover:bg-emerald-500 hover:text-white active:scale-95"
                        }`}
                    >
                        <span>{banner.ctaText}</span>
                        <ArrowUpRight
                            className={`transition-transform duration-300 ${
                                isGlass
                                    ? "h-4 w-4 group-hover/card:translate-x-0.5 group-hover/card:-translate-y-0.5"
                                    : "h-4 w-4 group-hover/card:rotate-45"
                            }`}
                        />
                    </div>
                )}
            </div>
        </div>
    </Link>
);

export const HeroSlider = ({ isLoading = false }: { isLoading?: boolean }) => {
    const AUTOPLAY_DELAY = 4500;

    const autoplayPlugin = useRef(
        Autoplay({ delay: AUTOPLAY_DELAY, stopOnInteraction: false, stopOnMouseEnter: true })
    );

    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, duration: 40 }, [
        autoplayPlugin.current,
    ]);

    const [selectedIndex, setSelectedIndex] = useState(0);

    const onSelect = useCallback(() => {
        if (!emblaApi) return;
        setSelectedIndex(emblaApi.selectedScrollSnap());
    }, [emblaApi]);

    useEffect(() => {
        if (!emblaApi) return;
        onSelect();
        emblaApi.on("select", onSelect);
        return () => {
            emblaApi.off("select", onSelect);
        };
    }, [emblaApi, onSelect]);

    const scrollPrev = useCallback(() => {
        if (!emblaApi) return;
        emblaApi.scrollPrev();
        autoplayPlugin.current?.reset();
    }, [emblaApi]);

    const scrollNext = useCallback(() => {
        if (!emblaApi) return;
        emblaApi.scrollNext();
        autoplayPlugin.current?.reset();
    }, [emblaApi]);

    const scrollTo = useCallback(
        (index: number) => {
            if (!emblaApi) return;
            emblaApi.scrollTo(index);
            autoplayPlugin.current?.reset();
        },
        [emblaApi]
    );

    if (isLoading || !HERO_SLIDES || HERO_SLIDES.length === 0) {
        return <HeroSliderSkeleton />;
    }

    return (
        <section className="relative group mb-12 w-full select-none">
            {/* Main Carousel Viewport */}
            <div className="overflow-hidden rounded-3xl" ref={emblaRef}>
                <div className="flex touch-pan-y -ml-3">
                    {HERO_SLIDES.map((slide, index) => {
                        const isActive = index === selectedIndex;

                        return (
                            <div key={slide.id} className="flex-[0_0_100%] min-w-0 pl-3">
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch h-[380px] sm:h-[420px] lg:h-[460px]">
                                    {slide.layout === "2-col-big-left" && slide.bigBanner && slide.smallBanner && (
                                        <>
                                            <div className="lg:col-span-8 h-full">
                                                <BannerCard banner={slide.bigBanner} isActive={isActive} />
                                            </div>
                                            <div className="lg:col-span-4 h-full hidden lg:block">
                                                <BannerCard banner={slide.smallBanner} isActive={isActive} isGlass />
                                            </div>
                                        </>
                                    )}

                                    {slide.layout === "3-col-center-big" &&
                                        slide.leftCard &&
                                        slide.centerCard &&
                                        slide.rightCard && (
                                            <>
                                                <div className="lg:col-span-3 h-full hidden lg:block">
                                                    <BannerCard banner={slide.leftCard} isActive={isActive} isGlass />
                                                </div>
                                                <div className="lg:col-span-6 h-full">
                                                    <BannerCard banner={slide.centerCard} isActive={isActive} />
                                                </div>
                                                <div className="lg:col-span-3 h-full hidden lg:block">
                                                    <BannerCard banner={slide.rightCard} isActive={isActive} isGlass />
                                                </div>
                                            </>
                                        )}

                                    {slide.layout === "2-col-big-right" && slide.smallBanner && slide.bigBanner && (
                                        <>
                                            <div className="lg:col-span-4 h-full hidden lg:block">
                                                <BannerCard banner={slide.smallBanner} isActive={isActive} isGlass />
                                            </div>
                                            <div className="lg:col-span-8 h-full">
                                                <BannerCard banner={slide.bigBanner} isActive={isActive} />
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Glass Navigation Arrows */}
            <button
                type="button"
                onClick={scrollPrev}
                aria-label="Previous slide"
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 h-11 w-11 rounded-full bg-black/30 hover:bg-emerald-600 text-white backdrop-blur-md border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300 cursor-pointer shadow-lg active:scale-90"
            >
                <ChevronLeft className="h-5 w-5" />
            </button>

            <button
                type="button"
                onClick={scrollNext}
                aria-label="Next slide"
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 h-11 w-11 rounded-full bg-black/30 hover:bg-emerald-600 text-white backdrop-blur-md border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300 cursor-pointer shadow-lg active:scale-90"
            >
                <ChevronRight className="h-5 w-5" />
            </button>

            {/* Modern Pill Pagination Indicators */}
            <div className="flex items-center justify-center gap-2 mt-5">
                {HERO_SLIDES.map((_, idx) => {
                    const active = idx === selectedIndex;
                    return (
                        <button
                            type="button"
                            key={idx}
                            onClick={() => scrollTo(idx)}
                            aria-label={`Go to slide ${idx + 1}`}
                            className={`relative h-2 rounded-full overflow-hidden transition-all duration-500 cursor-pointer ${
                                active
                                    ? "w-10 bg-gray-200 dark:bg-gray-800"
                                    : "w-2 bg-gray-300 dark:bg-gray-700 hover:bg-emerald-400"
                            }`}
                        >
                            {active && (
                                <span
                                    key={selectedIndex}
                                    className="absolute inset-0 bg-emerald-600 rounded-full origin-left animate-[progress_4.5s_linear_forwards]"
                                />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Keyframe for smooth progress bar */}
            <style jsx>{`
                @keyframes progress {
                    from {
                        transform: scaleX(0);
                    }
                    to {
                        transform: scaleX(1);
                    }
                }
            `}</style>
        </section>
    );
};