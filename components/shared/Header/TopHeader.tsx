// components/layout/TopHeader.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { PhoneCall, MapPin, ChevronDown, Globe, Sparkles } from "lucide-react";
import { FaFacebook, FaInstagram } from "react-icons/fa";
import { buildApiUrl } from "@/lib/api-url";

const DEFAULT_HOTLINE = "+1 (800) 555-0194";
const DEFAULT_FACEBOOK_URL = "https://facebook.com";
const DEFAULT_INSTAGRAM_URL = "https://instagram.com";

let cachedSiteContact: {
    hotline: string;
    facebookUrl: string;
    instagramUrl: string;
} | null = null;

export const TopHeader = () => {
    const [hotline, setHotline] = useState<string>(
        cachedSiteContact?.hotline || DEFAULT_HOTLINE
    );
    const [facebookUrl, setFacebookUrl] = useState<string>(
        cachedSiteContact?.facebookUrl || DEFAULT_FACEBOOK_URL
    );
    const [instagramUrl, setInstagramUrl] = useState<string>(
        cachedSiteContact?.instagramUrl || DEFAULT_INSTAGRAM_URL
    );
    const [language, setLanguage] = useState<"English" | "বাংলা">("English");
    const [langOpen, setLangOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const handleOutsideClick = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setLangOpen(false);
            }
        };

        document.addEventListener("mousedown", handleOutsideClick);
        return () => document.removeEventListener("mousedown", handleOutsideClick);
    }, []);

    useEffect(() => {
        if (cachedSiteContact) {
            setHotline(cachedSiteContact.hotline);
            setFacebookUrl(cachedSiteContact.facebookUrl);
            setInstagramUrl(cachedSiteContact.instagramUrl);
            return;
        }

        const url = buildApiUrl("/api/v1/site-information");
        if (!url) return;

        const controller = new AbortController();

        fetch(url, {
            method: "GET",
            headers: { Accept: "application/json" },
            cache: "no-store",
            signal: controller.signal,
        })
            .then(async (res) => {
                if (!res.ok) throw new Error("Failed to fetch site info");
                return res.json();
            })
            .then((json) => {
                const settings = json?.settings ?? json?.data?.settings ?? {};
                const phones: Array<{ phone?: string }> =
                    settings?.contact?.phones || [];
                const primaryPhone = phones
                    .find((p) => p?.phone?.trim())
                    ?.phone?.trim();

                const socials: Array<{
                    platform?: string;
                    name?: string;
                    url?: string;
                    link?: string;
                }> = settings?.social_links || settings?.socials || [];

                const fbLink = socials.find((s) =>
                    (s?.platform || s?.name || "")
                        .toLowerCase()
                        .includes("facebook")
                );
                const igLink = socials.find((s) =>
                    (s?.platform || s?.name || "")
                        .toLowerCase()
                        .includes("instagram")
                );

                const nextContact = {
                    hotline: primaryPhone || DEFAULT_HOTLINE,
                    facebookUrl:
                        fbLink?.url?.trim() ||
                        fbLink?.link?.trim() ||
                        DEFAULT_FACEBOOK_URL,
                    instagramUrl:
                        igLink?.url?.trim() ||
                        igLink?.link?.trim() ||
                        DEFAULT_INSTAGRAM_URL,
                };

                cachedSiteContact = nextContact;
                setHotline(nextContact.hotline);
                setFacebookUrl(nextContact.facebookUrl);
                setInstagramUrl(nextContact.instagramUrl);
            })
            .catch(() => {
                // Keep defaults on error or abort
            });

        return () => controller.abort();
    }, []);

    const telHref = `tel:${hotline.replace(/[^+\d]/g, "")}`;

    return (
        <div className="bg-gradient-to-r from-emerald-800 via-green-700 to-emerald-900 text-white text-xs py-2.5 border-b border-green-600/30 shadow-sm relative z-[999]">
            <div className="container mx-auto px-4 flex justify-between items-center">
                {/* Left: Hotline & Announcement */}
                <div className="flex items-center gap-6">
                    <a
                        href={telHref}
                        className="flex items-center gap-2 hover:text-emerald-200 transition-colors duration-200 group"
                    >
                        <div className="bg-white/10 p-1.5 rounded-full group-hover:bg-white/20 transition-all">
                            <PhoneCall className="h-3.5 w-3.5 text-emerald-300 animate-pulse" />
                        </div>
                        <span className="font-medium tracking-wide">
                            Hotline:{" "}
                            <strong className="font-semibold">{hotline}</strong>
                        </span>
                    </a>

                    {/* Announcement Banner (Hidden on mobile) */}
                    <div className="hidden md:flex items-center gap-1.5 text-emerald-100 bg-white/10 px-3 py-1 rounded-full text-[11px] backdrop-blur-sm">
                        <Sparkles className="h-3 w-3 text-yellow-300" />
                        <span>
                            Pure Alcohol-Free Body Oils • U.S. Retail &amp; Wholesale
                        </span>
                    </div>
                </div>

                {/* Right: Links, Socials & Language */}
                <div className="flex items-center gap-5">
                    {/* Track Order */}
                    <Link
                        href="/track-order"
                        className="hover:text-emerald-200 flex items-center gap-1.5 transition-colors duration-200 font-medium"
                    >
                        <MapPin className="h-3.5 w-3.5 text-emerald-300" />
                        <span>Track Order</span>
                    </Link>

                    <div className="h-3.5 w-[1px] bg-white/20 hidden sm:block" />

                    {/* Social Icons (Hidden on small mobile) */}
                    <div className="hidden sm:flex items-center gap-3">
                        <a
                            href={facebookUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Bismillah Body Oils on Facebook"
                            className="hover:text-emerald-200 transition-colors"
                        >
                            <FaFacebook className="h-3.5 w-3.5" />
                        </a>
                        <a
                            href={instagramUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Bismillah Body Oils on Instagram"
                            className="hover:text-emerald-200 transition-colors"
                        >
                            <FaInstagram className="h-3.5 w-3.5" />
                        </a>
                    </div>

                    <div className="h-3.5 w-[1px] bg-white/20 hidden sm:block" />

                    {/* Language Switcher Dropdown */}
                    <div
                        ref={dropdownRef}
                        onMouseEnter={() => setLangOpen(true)}
                        onMouseLeave={() => setLangOpen(false)}
                        className="relative"
                    >
                        <button
                            type="button"
                            onClick={() => setLangOpen((prev) => !prev)}
                            aria-expanded={langOpen}
                            className="cursor-pointer flex items-center gap-1.5 bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-md transition-all duration-200"
                        >
                            <Globe className="h-3.5 w-3.5 text-emerald-300" />
                            <span className="font-medium">{language}</span>
                            <ChevronDown
                                className={`h-3 w-3 transition-transform duration-200 ${langOpen ? "rotate-180" : ""
                                    }`}
                            />
                        </button>

                        {langOpen && (
                            <div className="absolute right-0 top-full pt-1.5 w-28 z-[9999]">
                                <div className="bg-white text-gray-800 rounded-md shadow-xl py-1 text-xs border border-gray-100">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setLanguage("English");
                                            setLangOpen(false);
                                        }}
                                        className={`w-full text-left px-3 py-1.5 hover:bg-emerald-50 hover:text-emerald-700 font-medium transition-colors cursor-pointer ${language === "English"
                                                ? "text-emerald-700 bg-emerald-50/60"
                                                : ""
                                            }`}
                                    >
                                        English
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setLanguage("বাংলা");
                                            setLangOpen(false);
                                        }}
                                        className={`w-full text-left px-3 py-1.5 hover:bg-emerald-50 hover:text-emerald-700 font-medium transition-colors cursor-pointer ${language === "বাংলা"
                                                ? "text-emerald-700 bg-emerald-50/60"
                                                : ""
                                            }`}
                                    >
                                        বাংলা
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};