"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, Mail } from "lucide-react";
import {
    FaFacebookF,
    FaTwitter,
    FaInstagram,
    FaLinkedinIn,
    FaGlobe,
} from "react-icons/fa";
import { MOCK_CATEGORIES } from "@/data/products";
import { useCategories } from "@/hook/useCategories";

interface FooterSocialLink {
    icon_class?: string;
    url: string;
}

interface SiteInfoSettings {
    website_name?: string;
    footer_description?: string;
    site_tagline?: string;
    branding?: {
        site_logo_black?: string | null;
        site_logo_white?: string | null;
    };
    contact?: {
        addresses?: Array<{ title?: string; address: string }>;
        phones?: Array<{ title?: string; phone: string }>;
        emails?: Array<{ title?: string; email: string }>;
    };
    social_links?: FooterSocialLink[];
}

const DEFAULT_LOGO = "/images/logo-main.png";
const DEFAULT_DESCRIPTION =
    "Ghorer Bazar is an e-commerce platform dedicated to providing safe and reliable food to every home.";
const DEFAULT_ADDRESS = "213 W Saratoga, St # A Baltimore, MD 21201";
const DEFAULT_PHONE = "+8809642922922";
const DEFAULT_EMAIL = "contact@ghorerbazar.com";

let cachedSiteSettings: SiteInfoSettings | null = null;

function buildSiteInfoUrl(): string {
    const rawBase = (
        process.env.NEXT_PUBLIC_API_BASE_URL ||
        process.env.NEXT_PUBLIC_API_URL ||
        ""
    )
        .trim()
        .replace(/\/+$/, "");

    if (!rawBase) return "";
    return rawBase.endsWith("/api/v1")
        ? `${rawBase}/site-information`
        : `${rawBase}/api/v1/site-information`;
}

function renderSocialIcon(iconClass?: string, url?: string) {
    const key = `${iconClass || ""} ${url || ""}`.toLowerCase();

    if (key.includes("facebook")) return <FaFacebookF className="h-4 w-4" />;
    if (key.includes("linkedin")) return <FaLinkedinIn className="h-4 w-4" />;
    if (key.includes("instagram")) return <FaInstagram className="h-4 w-4" />;
    if (key.includes("twitter") || key.includes("x-twitter") || key.includes("x.com")) {
        return <FaTwitter className="h-4 w-4" />;
    }
    return <FaGlobe className="h-4 w-4" />;
}

export const TopFooter = () => {
    const { categories } = useCategories();
    const [settings, setSettings] = useState<SiteInfoSettings | null>(
        cachedSiteSettings
    );

    useEffect(() => {
        if (cachedSiteSettings) {
            setSettings(cachedSiteSettings);
            return;
        }

        const siteInfoUrl = buildSiteInfoUrl();
        if (!siteInfoUrl) return;

        const controller = new AbortController();

        fetch(siteInfoUrl, {
            headers: { Accept: "application/json" },
            signal: controller.signal,
        })
            .then(async (res) => {
                if (!res.ok) throw new Error("Failed to fetch site information");
                return res.json();
            })
            .then((json) => {
                if (json?.success && json?.settings) {
                    cachedSiteSettings = json.settings;
                    setSettings(json.settings);
                }
            })
            .catch(() => {
                // Keep fallback data on error or abort
            });

        return () => controller.abort();
    }, []);

    // ✅ ডাইনামিক ক্যাটাগরি লিংক (API থেকে না আসলে MOCK_CATEGORIES ফলব্যাক)
    const shopByLinks = useMemo(() => {
        const sourceCategories =
            categories && categories.length > 0 ? categories : MOCK_CATEGORIES;
        return sourceCategories.map((cat) => ({
            name: cat.name,
            href: `/category/${cat.slug}`,
        }));
    }, [categories]);

    const logoSrc =
        settings?.branding?.site_logo_black ||
        settings?.branding?.site_logo_white ||
        DEFAULT_LOGO;
    const siteName = settings?.website_name || "BazarGhor";
    const description =
        settings?.footer_description ||
        settings?.site_tagline ||
        DEFAULT_DESCRIPTION;
    const address =
        settings?.contact?.addresses?.[0]?.address || DEFAULT_ADDRESS;
    const phone = settings?.contact?.phones?.[0]?.phone || DEFAULT_PHONE;
    const email = settings?.contact?.emails?.[0]?.email || DEFAULT_EMAIL;
    const telHref = `tel:${phone.replace(/[^+\d]/g, "")}`;

    const socialLinks: FooterSocialLink[] =
        settings?.social_links && settings.social_links.length > 0
            ? settings.social_links
            : [
                { icon_class: "fab fa-facebook-f", url: "https://facebook.com" },
                { icon_class: "fab fa-twitter", url: "https://twitter.com" },
                { icon_class: "fab fa-instagram", url: "https://instagram.com" },
            ];

    // ✅ ডাইনামিক ফুটার স্ট্রাকচার
    const footerLinks = [
        {
            title: "Information",
            links: [
                { name: "About us", href: "/about" },
                { name: "Contact us", href: "/contact" },
                { name: "Company Information", href: "/about" },
                { name: "Ghorer Bazar Stories", href: "/about" },
                { name: "Terms & Conditions", href: "/terms-conditions" },
                { name: "Privacy Policy", href: "/privacy-policy" },
            ],
        },
        {
            title: "Shop By",
            links: shopByLinks,
        },
        {
            title: "Support",
            links: [
                { name: "Support Center", href: "/support" },
                { name: "How to Order", href: "/how-to-order" },
                { name: "Order Tracking", href: "/track-order" },
                { name: "Shipping", href: "/shipping" },
                { name: "FAQ", href: "/faqs" },
                { name: "Blogs", href: "/blog" },
            ],
        },
        {
            title: "Consumer Policy",
            links: [
                { name: "Happy Return", href: "/happy-return" },
                { name: "Refund Policy", href: "/refund-policy" },
                { name: "Cancellation", href: "/cancellation" },
                { name: "Pre-Order", href: "/pre-order" },
            ],
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 py-12">
            {/* Column 1: Logo & Contact Info (2 cols) */}
            <div className="lg:col-span-2">
                <Link href="/" className="items-center shrink-0 group mb-4 inline-block">
                    <div className="relative h-22 w-46">
                        <Image
                            src={logoSrc}
                            alt={`${siteName} Logo`}
                            fill
                            priority
                            unoptimized={logoSrc.startsWith("http")}
                            className="object-contain object-left group-hover:scale-105 transition-transform duration-200"
                        />
                    </div>
                </Link>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                    {description}
                </p>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 mt-0.5 text-gray-400 shrink-0" />
                        <span>{address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-400 shrink-0" />
                        <a href={telHref} className="hover:text-green-600">
                            {phone}
                        </a>
                    </div>
                    <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400 shrink-0" />
                        <a
                            href={`mailto:${email}`}
                            className="hover:text-green-600 break-all"
                        >
                            {email}
                        </a>
                    </div>
                </div>

                {/* Social Icons */}
                <div className="flex items-center gap-3 mt-6">
                    {socialLinks.map((social, idx) => (
                        <a
                            key={idx}
                            href={social.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`Social link ${idx + 1}`}
                            className="w-8 h-8 bg-orange-100 dark:bg-gray-800 text-orange-500 rounded-full flex items-center justify-center hover:bg-orange-500 hover:text-white transition-colors"
                        >
                            {renderSocialIcon(social.icon_class, social.url)}
                        </a>
                    ))}
                </div>

                {/* App Download */}
                {/* <div className="mt-6">
                    <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
                        Download App on Mobile :
                    </h4>
                    <div className="flex gap-2">
                        <a
                            href="https://play.google.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="h-9 w-28 bg-black rounded flex items-center justify-center text-white text-[10px] hover:bg-gray-800 transition-colors"
                        >
                            Google Play
                        </a>
                        <a
                            href="https://apps.apple.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="h-9 w-28 bg-black rounded flex items-center justify-center text-white text-[10px] hover:bg-gray-800 transition-colors"
                        >
                            App Store
                        </a>
                    </div>
                </div> */}
            </div>

            {/* Columns 2-5: Links */}
            {footerLinks.map((column) => (
                <div key={column.title}>
                    <h4 className="text-base font-bold text-gray-800 dark:text-gray-200 mb-4">
                        {column.title}
                    </h4>
                    <ul className="space-y-2.5">
                        {column.links.map((link) => (
                            <li key={link.name}>
                                <Link
                                    href={link.href}
                                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-orange-500 transition-colors"
                                >
                                    {link.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
};