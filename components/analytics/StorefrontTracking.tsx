// components/analytics/StorefrontTracking.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import Script from "next/script";
import { buildApiUrl } from "@/lib/api-url";
import type { TrackingApiResponse, TrackingConfigItem } from "./types";

const CONSENT_STORAGE_KEY = "storefront_tracking_consent";

declare global {
    interface Window {
        dataLayer?: unknown[];
        gtag?: (...args: unknown[]) => void;
        fbq?: ((...args: unknown[]) => void) & {
            callMethod?: (...args: unknown[]) => void;
            queue?: unknown[];
            loaded?: boolean;
            version?: string;
        };
        _fbq?: unknown;
    }
}

function normalizeProvider(provider: string): "ga4" | "meta" | "unknown" {
    const key = provider.trim().toLowerCase();
    if (key === "ga4" || key === "gtag" || key === "google_analytics") {
        return "ga4";
    }
    if (
        key === "meta" ||
        key === "meta_pixel" ||
        key === "facebook" ||
        key === "facebook_pixel" ||
        key === "fb_pixel"
    ) {
        return "meta";
    }
    return "unknown";
}

export default function StorefrontTracking() {
    const [trackers, setTrackers] = useState<TrackingConfigItem[]>([]);
    const [consentGiven, setConsentGiven] = useState<boolean>(false);
    const [showConsentPrompt, setShowConsentPrompt] = useState<boolean>(false);

    useEffect(() => {
        if (typeof window === "undefined") return;
        const saved = window.localStorage.getItem(CONSENT_STORAGE_KEY);
        if (saved === "granted") {
            setConsentGiven(true);
            setShowConsentPrompt(false);
        } else if (saved === "denied") {
            setConsentGiven(false);
            setShowConsentPrompt(false);
        }
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        let active = true;

        async function loadTrackingIds() {
            try {
                const res = await fetch(buildApiUrl("/api/v1/storefront/tracking"), {
                    method: "GET",
                    headers: { Accept: "application/json" },
                    cache: "no-store",
                    signal: controller.signal,
                });

                if (!res.ok) return;
                const json: TrackingApiResponse = await res.json();
                const list = Array.isArray(json?.data) ? json.data : [];

                const validList = list.filter(
                    (item) =>
                        item &&
                        item.public_identifier &&
                        item.public_identifier.trim().length > 0 &&
                        item.is_active !== false
                );

                if (active && !controller.signal.aborted) {
                    setTrackers(validList);
                    const needsConsent = validList.some(
                        (item) => item.consent_required === true
                    );
                    const savedConsent =
                        typeof window !== "undefined"
                            ? window.localStorage.getItem(CONSENT_STORAGE_KEY)
                            : null;
                    if (needsConsent && !savedConsent) {
                        setShowConsentPrompt(true);
                    }
                }
            } catch {
                // Ignore network errors silently
            }
        }

        loadTrackingIds();
        return () => {
            active = false;
            controller.abort();
        };
    }, []);

    const handleAcceptConsent = useCallback(() => {
        setConsentGiven(true);
        setShowConsentPrompt(false);
        if (typeof window !== "undefined") {
            window.localStorage.setItem(CONSENT_STORAGE_KEY, "granted");
        }
    }, []);

    const handleDeclineConsent = useCallback(() => {
        setConsentGiven(false);
        setShowConsentPrompt(false);
        if (typeof window !== "undefined") {
            window.localStorage.setItem(CONSENT_STORAGE_KEY, "denied");
        }
    }, []);

    const enabledTrackers = trackers.filter((item) => {
        if (item.consent_required === true) {
            return consentGiven;
        }
        return true;
    });

    const ga4Trackers = enabledTrackers.filter(
        (t) => normalizeProvider(t.provider) === "ga4"
    );
    const metaTrackers = enabledTrackers.filter(
        (t) => normalizeProvider(t.provider) === "meta"
    );

    return (
        <>
            {/* Google Analytics 4 (GA4) */}
            {ga4Trackers.map((tracker) => {
                const measurementId = tracker.public_identifier.trim();
                return (
                    <span key={`ga4-${measurementId}`} className="hidden">
                        <Script
                            src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(
                                measurementId
                            )}`}
                            strategy="afterInteractive"
                        />
                        <Script
                            id={`ga4-init-${measurementId}`}
                            strategy="afterInteractive"
                        >
                            {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                window.gtag = gtag;
                gtag('js', new Date());
                gtag('config', '${measurementId}', { send_page_view: true });
              `}
                        </Script>
                    </span>
                );
            })}

            {/* Meta Pixel */}
            {metaTrackers.map((tracker) => {
                const pixelId = tracker.public_identifier.trim();
                return (
                    <Script
                        key={`meta-${pixelId}`}
                        id={`meta-pixel-${pixelId}`}
                        strategy="afterInteractive"
                    >
                        {`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${pixelId}');
              fbq('track', 'PageView');
            `}
                    </Script>
                );
            })}

            {/* Consent Prompt (only when consent_required: true and not yet decided) */}
            {showConsentPrompt && (
                <div
                    role="dialog"
                    aria-label="Analytics consent"
                    className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 rounded-2xl bg-slate-900 text-white border border-slate-700/80 p-4 shadow-2xl"
                >
                    <p className="text-xs sm:text-sm font-semibold">
                        Analytics &amp; Cookies Preference
                    </p>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        We use analytics tags to improve store performance and shopping
                        experience.
                    </p>
                    <div className="mt-3 flex items-center justify-end gap-2">
                        <button
                            type="button"
                            onClick={handleDeclineConsent}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                            Decline
                        </button>
                        <button
                            type="button"
                            onClick={handleAcceptConsent}
                            className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer"
                        >
                            Accept
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}