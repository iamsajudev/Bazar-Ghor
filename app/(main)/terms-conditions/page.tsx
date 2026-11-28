// app/(main)/terms-conditions/page.tsx
"use client";

import { useEffect, useState } from "react";
import TermsHeroBanner from "@/components/terms-conditions/TermsHeroBanner";
import TermsSectionsList from "@/components/terms-conditions/TermsSectionsList";
import { buildApiUrl } from "@/lib/api-url";
import { TermsApiResponse, TermsPageData } from "@/types/terms-conditions";

export default function TermsConditionsPage() {
    const [termsData, setTermsData] = useState<TermsPageData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const controller = new AbortController();
        let active = true;

        async function loadTerms() {
            setLoading(true);
            setError(null);

            try {
                const res = await fetch(buildApiUrl("/api/v1/terms"), {
                    method: "GET",
                    headers: { Accept: "application/json" },
                    cache: "no-store",
                    signal: controller.signal,
                });

                if (!res.ok) {
                    throw new Error(`Failed to load terms & conditions (${res.status})`);
                }

                const json: TermsApiResponse = await res.json();
                const data = json?.data ?? json;

                if (active && !controller.signal.aborted) {
                    setTermsData(data || null);
                }
            } catch (err) {
                if (active && !controller.signal.aborted) {
                    setError(
                        err instanceof Error
                            ? err.message
                            : "Unable to load terms & conditions right now."
                    );
                }
            } finally {
                if (active && !controller.signal.aborted) {
                    setLoading(false);
                }
            }
        }

        loadTerms();
        return () => {
            active = false;
            controller.abort();
        };
    }, []);

    const title = termsData?.title || "Terms & Conditions";
    const subtitle = termsData?.seo?.meta_description || termsData?.subtitle;
    const rawContent =
        termsData?.body_html || termsData?.content || termsData?.body || null;

    return (
        <main className="min-h-screen bg-gray-50/50 dark:bg-gray-950">
            <TermsHeroBanner
                title={title}
                subtitle={subtitle}
                effectiveDate={termsData?.effective_date}
                expirationDate={termsData?.expiration_date}
            />

            <section className="container mx-auto px-4 py-12 md:py-16">
                <TermsSectionsList
                    sections={termsData?.sections}
                    rawContent={rawContent}
                    loading={loading}
                    error={error}
                />
            </section>
        </main>
    );
}