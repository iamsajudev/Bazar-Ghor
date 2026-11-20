import { HeroSlide } from "@/types/hero";

export const HERO_SLIDES: HeroSlide[] = [
    {
        id: 1,
        layout: "2-col-big-left",
        bigBanner: {
            image: "/images/banner-1.jpg",
            link: "/category/body-oil",
            badge: "",
            title: "",
            subtitle: "",
            ctaText: "",
        },
        smallBanner: {
            // অলিভ অয়েলের জন্য নির্ভরযোগ্য ছবি
            image: "images/banner-6.webp",
            link: "/category/olive-oil",
            badge: "",
            title: "",
            subtitle: "",
            ctaText: "",
        },
    },
    {
        id: 2,
        layout: "3-col-center-big",
        leftCard: {
            // বাদাম তেলের জন্য নির্ভরযোগ্য ছবি
            image: "images/banner-7.webp",
            link: "/category/almond-oil",
            badge: "",
            title: "",
            subtitle: "",
            ctaText: "",
        },
        centerCard: {
            // ম্যাসাজ অয়েলের জন্য নির্ভরযোগ্য ছবি
            image: "images/banner-3.webp",
            link: "/category/massage-oil",
            badge: "",
            title: "",
            subtitle: "",
            ctaText: "",
        },
        rightCard: {
            // নারকেল তেলের জন্য নির্ভরযোগ্য ছবি
            image: "images/banner-4.webp",
            link: "/category/coconut-oil",
            badge: "",
            title: "",
            subtitle: "",
            ctaText: "",
        },
    },
    {
        id: 3,
        layout: "2-col-big-right",
        smallBanner: {
            image: "images/banner-4.webp",
            link: "/category/coconut-oil",
            badge: "",
            title: "",
            subtitle: "",
            ctaText: "",
        },
        bigBanner: {
            // হারবাল অয়েলের জন্য নির্ভরযোগ্য ছবি
            image: "/images/banner-2.jpg",
            link: "/category/herbal-oil",
            badge: "",
            title: "",
            subtitle: "",
            ctaText: "",
        },
    },
];