// app/(main)/contact/page.tsx
"use client";

import { useEffect, useState } from "react";
import ContactBanner from "@/components/Contact/ContactBanner";
import ContactInfoCards from "@/components/Contact/ContactInfoCards";
import ContactForm from "@/components/Contact/ContactForm";
import ContactMap from "@/components/Contact/ContactMap";
import { buildApiUrl } from "@/lib/api-url";
import type { SiteInformationResponse, SiteSettings } from "@/types/contact";

const FALLBACK_SETTINGS: SiteSettings = {
    website_name: "BazarGhor",
    site_tagline:
        "Have a question about your order, delivery times, or bulk inquiries? We are here to assist you.",
    contact: {
        emails: [{ title: "Support", email: "contact@bazarghor.com" }],
        phones: [{ title: "Hotline", phone: "+880 9642 922 922" }],
        addresses: [
            {
                title: "Head Office",
                address: "213 W Saratoga, St # A, Baltimore, MD 21201",
            },
        ],
    },
};

export default function ContactPage() {
    const [settings, setSettings] = useState<SiteSettings | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        async function fetchSiteInfo() {
            try {
                const res = await fetch(buildApiUrl("/api/v1/site-information"), {
                    headers: { Accept: "application/json" },
                    cache: "no-store",
                });

                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }

                const json: SiteInformationResponse = await res.json();
                if (isMounted && json?.success && json.settings) {
                    setSettings(json.settings);
                } else if (isMounted) {
                    setSettings(FALLBACK_SETTINGS);
                }
            } catch (err) {
                console.error("Failed to fetch site information:", err);
                if (isMounted) {
                    setSettings(FALLBACK_SETTINGS);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }

        fetchSiteInfo();
        return () => {
            isMounted = false;
        };
    }, []);

    const bannerTagline =
        settings?.site_tagline ||
        settings?.site_motto ||
        FALLBACK_SETTINGS.site_tagline;

    return (
        <main className="min-h-screen bg-gray-50/40 dark:bg-gray-950">
            {/* Top Hero Banner with Overlay Image */}
            <ContactBanner
                siteName={settings?.website_name || FALLBACK_SETTINGS.website_name}
                tagline={bannerTagline}
                bgImageUrl={
                    settings?.branding?.site_logo_black ||
                    settings?.branding?.site_logo_white ||
                    undefined
                }
            />

            {/* Overlapping Modern Grid: Dynamic Info Cards + Contact Form */}
            <section className="container mx-auto px-4 -mt-12 md:-mt-16 pb-16 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    <div className="lg:col-span-5">
                        <ContactInfoCards settings={settings} loading={loading} />
                    </div>

                    <div className="lg:col-span-7">
                        <ContactForm />
                    </div>
                </div>
            </section>

            {/* Bottom Dynamic Location Map */}
            <ContactMap
                addresses={settings?.contact?.addresses}
                loading={loading}
            />
        </main>
    );
}