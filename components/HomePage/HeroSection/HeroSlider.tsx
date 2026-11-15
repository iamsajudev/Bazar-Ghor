"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { HERO_SLIDES } from "@/data/heroSlides";
import { HeroBanner } from "@/types/hero";

const BannerCard = ({ banner, isActive, isGlass = false }: { banner: HeroBanner; isActive: boolean; isGlass?: boolean }) => (
    <Link
        href={banner.link}
        className={`relative block h-full w-full rounded-2xl overflow-hidden transition-all duration-700 ease-out transform ${isActive ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-4 scale-98"} group/card`}
    >
        <img
            src={banner.image}
            alt={banner.title || "Banner"}
            className={`absolute inset-0 w-full h-full object-cover transition-transform duration-1000 ease-out ${isActive ? "scale-100 group-hover/card:scale-105" : "scale-105"}`}
            loading="lazy"
        />
        <div className={`absolute inset-0 ${isGlass ? "bg-gradient-to-t from-black/80 via-black/30 to-transparent" : "bg-gradient-to-t from-black/85 via-black/35 to-transparent"}`} />
        <div className="absolute inset-0 p-5 md:p-6 flex flex-col justify-end z-10 text-white">
            <div className={`transition-all duration-700 delay-200 transform ${isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
                {banner.badge && (
                    <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold mb-2.5 backdrop-blur-md ${isGlass ? "bg-white/20 text-white" : "bg-green-600 text-white"}`}>
                        {banner.badge}
                    </span>
                )}
                {banner.title && (
                    <h2 className={`font-extrabold leading-tight mb-1.5 tracking-tight ${isGlass ? "text-lg md:text-xl" : "text-2xl md:text-4xl"}`}>
                        {banner.title}
                    </h2>
                )}
                {banner.subtitle && (
                    <p className={`mb-4 max-w-md text-gray-200 font-medium ${isGlass ? "text-xs" : "text-sm"}`}>
                        {banner.subtitle}
                    </p>
                )}
                {banner.ctaText && (
                    <div className={`inline-flex items-center gap-2 font-bold transition-all ${isGlass ? "text-white hover:text-green-300 text-xs gap-1 group-hover/card:translate-x-1" : "bg-white text-gray-900 px-5 py-2.5 rounded-xl text-xs md:text-sm hover:bg-green-50 active:scale-95"}`}>
                        <span>{banner.ctaText}</span>
                        <ArrowRight className="h-4 w-4" />
                    </div>
                )}
            </div>
        </div>
    </Link>
);

export const HeroSlider = () => {
    // ১. Autoplay প্লাগইনকে useRef এর ভেতরে রাখা হলো
    const autoplayPlugin = useRef(
        Autoplay({ delay: 4000, stopOnInteraction: false, stopOnMouseEnter: false })
    );

    // ২. useEmblaCarousel এ প্লাগইনটি পাস করা হলো
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, duration: 35 }, [
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
        if (emblaApi) {
            emblaApi.scrollPrev();
            // ম্যানুয়াল ক্লিকের পর অটো-স্লাইড আবার শুরু করার জন্য
            if (autoplayPlugin.current) autoplayPlugin.current.reset();
        }
    }, [emblaApi]);

    const scrollNext = useCallback(() => {
        if (emblaApi) {
            emblaApi.scrollNext();
            if (autoplayPlugin.current) autoplayPlugin.current.reset();
        }
    }, [emblaApi]);

    const scrollTo = useCallback((index: number) => {
        if (emblaApi) {
            emblaApi.scrollTo(index);
            if (autoplayPlugin.current) autoplayPlugin.current.reset();
        }
    }, [emblaApi]);

    return (
        <div className="relative group mb-12 w-full">
            <div className="overflow-hidden rounded-3xl" ref={emblaRef}>
                <div className="flex touch-pan-y">
                    {HERO_SLIDES.map((slide, index) => {
                        const isActive = index === selectedIndex;

                        return (
                            <div key={slide.id} className="flex-[0_0_100%] min-w-0 px-1">
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch h-[380px] lg:h-[420px]">
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

                                    {slide.layout === "3-col-center-big" && slide.leftCard && slide.centerCard && slide.rightCard && (
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

            <button
                onClick={scrollPrev}
                aria-label="Previous slide"
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-md text-gray-800 dark:text-white border border-gray-200/60 dark:border-gray-700/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-green-600 hover:text-white hover:border-green-600 cursor-pointer shadow-sm"
            >
                <ChevronLeft className="h-5 w-5" />
            </button>
            <button
                onClick={scrollNext}
                aria-label="Next slide"
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-md text-gray-800 dark:text-white border border-gray-200/60 dark:border-gray-700/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-green-600 hover:text-white hover:border-green-600 cursor-pointer shadow-sm"
            >
                <ChevronRight className="h-5 w-5" />
            </button>

            <div className="flex items-center justify-center gap-2 mt-4">
                {HERO_SLIDES.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => scrollTo(idx)}
                        aria-label={`Go to slide ${idx + 1}`}
                        className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${idx === selectedIndex ? "w-8 bg-green-600" : "w-2 bg-gray-300 dark:bg-gray-700 hover:bg-green-400"}`}
                    />
                ))}
            </div>
        </div>
    );
};