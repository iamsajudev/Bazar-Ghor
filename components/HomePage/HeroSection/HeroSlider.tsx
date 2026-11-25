"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { HeroBanner, HeroSlide } from "@/types/hero";

interface ApiHomepageSectionItem {
    media_url?: string | null;
    media_alt?: string | null;
    thumbnail_media_url?: string | null;
    right_media_url?: string | null;
}

interface ApiHomepageSection {
    type?: string | null;
    autoplay_seconds?: number | null;
    active?: boolean | null;
    items?: ApiHomepageSectionItem[] | null;
}

const DEFAULT_API_BASE = "https://ecommerce.goflixza.com/api/v1";
const FALLBACK_BANNER_IMAGE = "/images/banner-1.jpg";

function resolveHomepageApiUrl(): string {
    const raw =
        process.env.NEXT_PUBLIC_API_BASE_URL?.trim() ||
        process.env.NEXT_PUBLIC_API_URL?.trim() ||
        DEFAULT_API_BASE;
    const clean = raw.replace(/\/+$/, "");
    return clean.endsWith("/api/v1")
        ? `${clean}/homepage`
        : `${clean}/api/v1/homepage`;
}

function getItemImage(
    item?: ApiHomepageSectionItem,
    fallback = FALLBACK_BANNER_IMAGE
): string {
    if (!item) return fallback;
    return (
        item.media_url?.trim() ||
        item.thumbnail_media_url?.trim() ||
        item.right_media_url?.trim() ||
        fallback
    );
}

function mapBanner(image: string, title = "Banner", link = "#"): HeroBanner {
    return {
        image,
        link,
        title,
        badge: "",
        subtitle: "",
        ctaText: "",
    };
}

function buildGridSlidesFromItems(items: ApiHomepageSectionItem[]): HeroSlide[] {
    const images = items
        .map((it) => getItemImage(it, ""))
        .filter((url) => Boolean(url));

    if (images.length === 0) return [];

    const at = (idx: number) => images[idx % images.length];

    return [
        {
            id: 1,
            layout: "2-col-big-left",
            bigBanner: mapBanner(at(0), "Hero Banner 1"),
            smallBanner: mapBanner(at(1), "Hero Banner 2"),
        },
        {
            id: 2,
            layout: "3-col-center-big",
            leftCard: mapBanner(at(2), "Hero Banner 3"),
            centerCard: mapBanner(at(3), "Hero Banner 4"),
            rightCard: mapBanner(at(4), "Hero Banner 5"),
        },
        {
            id: 3,
            layout: "2-col-big-right",
            smallBanner: mapBanner(at(5), "Hero Banner 6"),
            bigBanner: mapBanner(at(6), "Hero Banner 7"),
        },
    ];
}

export const HeroSliderSkeleton = () => {
    return (
        <section
            className="relative mb-12 w-full select-none animate-pulse"
            aria-hidden="true"
        >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch h-[380px] sm:h-[420px] lg:h-[460px]">
                <div className="lg:col-span-8 h-full rounded-3xl bg-gray-200/80 dark:bg-gray-800/80 ring-1 ring-black/5 dark:ring-white/10" />
                <div className="lg:col-span-4 h-full hidden lg:block rounded-3xl bg-gray-200/70 dark:bg-gray-800/60 ring-1 ring-black/5 dark:ring-white/10" />
            </div>

            <div className="flex items-center justify-center gap-2 mt-5">
                <span className="h-2 w-10 rounded-full bg-emerald-200 dark:bg-emerald-900/50" />
                <span className="h-2 w-2 rounded-full bg-gray-200 dark:bg-gray-800" />
                <span className="h-2 w-2 rounded-full bg-gray-200 dark:bg-gray-800" />
            </div>
        </section>
    );
};

interface GridBannerTileProps {
    banner: HeroBanner;
    isActive: boolean;
}

const GridBannerTile = ({ banner, isActive }: GridBannerTileProps) => (
    <div
        className={`relative block h-full w-full rounded-3xl overflow-hidden ring-1 ring-black/5 dark:ring-white/10 shadow-lg transition-all duration-700 ease-out transform ${isActive
                ? "opacity-100 translate-y-0 scale-100"
                : "opacity-40 translate-y-2 scale-[0.98]"
            }`}
    >
        <img
            src={banner.image}
            alt={banner.title || "Hero Banner"}
            className={`w-full h-full object-cover transition-transform duration-1000 ease-out ${isActive ? "scale-100" : "scale-105"
                }`}
            loading="eager"
        />
        <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/15 pointer-events-none" />
    </div>
);

export const HeroSlider = ({ isLoading = false }: { isLoading?: boolean }) => {
    const [slides, setSlides] = useState<HeroSlide[]>([]);
    const [fetching, setFetching] = useState(true);
    const [autoplayMs, setAutoplayMs] = useState(4500);

    useEffect(() => {
        let active = true;

        async function loadHomepageHero() {
            setFetching(true);
            try {
                const res = await fetch(resolveHomepageApiUrl(), {
                    headers: { Accept: "application/json" },
                    cache: "no-store",
                });

                if (res.ok) {
                    const json = await res.json();
                    const sections: ApiHomepageSection[] = Array.isArray(
                        json?.data?.sections
                    )
                        ? json.data.sections
                        : Array.isArray(json?.sections)
                            ? json.sections
                            : [];

                    const heroSection = sections.find(
                        (sec) => sec?.type === "hero" && sec?.active !== false
                    );

                    if (active && heroSection) {
                        if (
                            typeof heroSection.autoplay_seconds === "number" &&
                            heroSection.autoplay_seconds > 0
                        ) {
                            setAutoplayMs(heroSection.autoplay_seconds * 1000);
                        }

                        if (Array.isArray(heroSection.items)) {
                            const mapped = buildGridSlidesFromItems(
                                heroSection.items
                            );
                            if (mapped.length > 0) {
                                setSlides(mapped);
                            }
                        }
                    }
                }
            } catch {
                // Keep empty or fallback state
            } finally {
                if (active) setFetching(false);
            }
        }

        void loadHomepageHero();
        return () => {
            active = false;
        };
    }, []);

    const autoplayPlugin = useRef(
        Autoplay({
            delay: autoplayMs,
            stopOnInteraction: false,
            stopOnMouseEnter: true,
        })
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

    if (isLoading || fetching) {
        return <HeroSliderSkeleton />;
    }

    if (!slides || slides.length === 0) {
        return <HeroSliderSkeleton />;
    }

    return (
        <section className="relative group mb-12 w-full select-none">
            <div className="overflow-hidden rounded-3xl" ref={emblaRef}>
                <div className="flex touch-pan-y -ml-3">
                    {slides.map((slide, index) => {
                        const isActive = index === selectedIndex;

                        return (
                            <div
                                key={slide.id}
                                className="flex-[0_0_100%] min-w-0 pl-3"
                            >
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch h-[380px] sm:h-[420px] lg:h-[460px]">
                                    {slide.layout === "2-col-big-left" &&
                                        slide.bigBanner &&
                                        slide.smallBanner && (
                                            <>
                                                <div className="lg:col-span-8 h-full">
                                                    <GridBannerTile
                                                        banner={slide.bigBanner}
                                                        isActive={isActive}
                                                    />
                                                </div>
                                                <div className="lg:col-span-4 h-full hidden lg:block">
                                                    <GridBannerTile
                                                        banner={slide.smallBanner}
                                                        isActive={isActive}
                                                    />
                                                </div>
                                            </>
                                        )}

                                    {slide.layout === "3-col-center-big" &&
                                        slide.leftCard &&
                                        slide.centerCard &&
                                        slide.rightCard && (
                                            <>
                                                <div className="lg:col-span-3 h-full hidden lg:block">
                                                    <GridBannerTile
                                                        banner={slide.leftCard}
                                                        isActive={isActive}
                                                    />
                                                </div>
                                                <div className="lg:col-span-6 h-full">
                                                    <GridBannerTile
                                                        banner={slide.centerCard}
                                                        isActive={isActive}
                                                    />
                                                </div>
                                                <div className="lg:col-span-3 h-full hidden lg:block">
                                                    <GridBannerTile
                                                        banner={slide.rightCard}
                                                        isActive={isActive}
                                                    />
                                                </div>
                                            </>
                                        )}

                                    {slide.layout === "2-col-big-right" &&
                                        slide.smallBanner &&
                                        slide.bigBanner && (
                                            <>
                                                <div className="lg:col-span-4 h-full hidden lg:block">
                                                    <GridBannerTile
                                                        banner={slide.smallBanner}
                                                        isActive={isActive}
                                                    />
                                                </div>
                                                <div className="lg:col-span-8 h-full">
                                                    <GridBannerTile
                                                        banner={slide.bigBanner}
                                                        isActive={isActive}
                                                    />
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

            <div className="flex items-center justify-center gap-2 mt-5">
                {slides.map((_, idx) => {
                    const active = idx === selectedIndex;
                    return (
                        <button
                            type="button"
                            key={idx}
                            onClick={() => scrollTo(idx)}
                            aria-label={`Go to slide ${idx + 1}`}
                            className={`relative h-2 rounded-full overflow-hidden transition-all duration-500 cursor-pointer ${active
                                    ? "w-10 bg-gray-200 dark:bg-gray-800"
                                    : "w-2 bg-gray-300 dark:bg-gray-700 hover:bg-emerald-400"
                                }`}
                        >
                            {active && (
                                <span
                                    key={selectedIndex}
                                    style={{
                                        animationDuration: `${autoplayMs}ms`,
                                    }}
                                    className="absolute inset-0 bg-emerald-600 rounded-full origin-left animate-[progress_4.5s_linear_forwards]"
                                />
                            )}
                        </button>
                    );
                })}
            </div>

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