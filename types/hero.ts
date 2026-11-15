export interface HeroBanner {
    image: string;
    link: string;
    title?: string;
    subtitle?: string;
    badge?: string;
    ctaText?: string;
}

export interface HeroSlide {
    id: number;
    layout: "2-col-big-left" | "3-col-center-big" | "2-col-big-right";
    bigBanner?: HeroBanner;
    smallBanner?: HeroBanner;
    leftCard?: HeroBanner;
    centerCard?: HeroBanner;
    rightCard?: HeroBanner;
}