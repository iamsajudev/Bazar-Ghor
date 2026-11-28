// app/(main)/privacy-policy/page.tsx
"use client";

import { useEffect, useState } from "react";
import { buildApiUrl } from "@/lib/api-url";
import { PrivacyPolicyApiResponse, PrivacyPolicyData } from "@/types/privacy-policy";
import PrivacyHeroBanner from "@/components/Privacy-policy/PrivacyHeroBanner";
import PrivacySectionsList from "@/components/Privacy-policy/PrivacySectionsList";

export default function PrivacyPolicyPage() {
    const [policy, setPolicy] = useState<PrivacyPolicyData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const controller = new AbortController();
        let active = true;

        async function loadPrivacyPolicy() {
            setLoading(true);
            setError(null);

            try {
                const res = await fetch(buildApiUrl("/api/v1/privacy"), {
                    method: "GET",
                    headers: { Accept: "application/json" },
                    cache: "no-store",
                    signal: controller.signal,
                });

                if (!res.ok) {
                    throw new Error(`Failed to load privacy policy (${res.status})`);
                }

                const json: PrivacyPolicyApiResponse = await res.json();
                const data = json?.data ?? json;

                if (active && !controller.signal.aborted) {
                    setPolicy(data || null);
                }
            } catch (err) {
                if (active && !controller.signal.aborted) {
                    setError(
                        err instanceof Error
                            ? err.message
                            : "Unable to load privacy policy right now."
                    );
                }
            } finally {
                if (active && !controller.signal.aborted) {
                    setLoading(false);
                }
            }
        }

        loadPrivacyPolicy();
        return () => {
            active = false;
            controller.abort();
        };
    }, []);

    const title = policy?.title || "Privacy Policy";
    const subtitle = policy?.seo?.meta_description || policy?.subtitle;
    const updatedAt = policy?.updated_at || policy?.last_updated;
    const rawContent =
        policy?.body_html || policy?.content || policy?.body || null;

    return (
        <main className="min-h-screen bg-gray-50/50 dark:bg-gray-950">
            <PrivacyHeroBanner
                title={title}
                subtitle={subtitle}
                updatedAt={updatedAt}
            />

            <section className="container mx-auto px-4 py-12 md:py-16">
                <PrivacySectionsList
                    sections={policy?.sections}
                    rawContent={rawContent}
                    loading={loading}
                    error={error}
                />
            </section>
        </main>
    );
}