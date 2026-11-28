// app/(main)/refund-policy/page.tsx
"use client";

import { useEffect, useState } from "react";
import RefundHeroBanner from "@/components/refund-policy/RefundHeroBanner";
import RefundSectionsList from "@/components/refund-policy/RefundSectionsList";
import { buildApiUrl } from "@/lib/api-url";
import { RefundPolicyApiResponse, RefundPolicyData } from "@/types/refund-policy";

export default function RefundPolicyPage() {
    const [policy, setPolicy] = useState<RefundPolicyData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const controller = new AbortController();
        let active = true;

        async function loadRefundPolicy() {
            setLoading(true);
            setError(null);

            try {
                const res = await fetch(buildApiUrl("/api/v1/refund"), {
                    method: "GET",
                    headers: { Accept: "application/json" },
                    cache: "no-store",
                    signal: controller.signal,
                });

                if (!res.ok) {
                    throw new Error(`Failed to load refund policy (${res.status})`);
                }

                const json: RefundPolicyApiResponse = await res.json();
                const data = json?.data ?? json;

                if (active && !controller.signal.aborted) {
                    setPolicy(data || null);
                }
            } catch (err) {
                if (active && !controller.signal.aborted) {
                    setError(
                        err instanceof Error
                            ? err.message
                            : "Unable to load refund policy right now."
                    );
                }
            } finally {
                if (active && !controller.signal.aborted) {
                    setLoading(false);
                }
            }
        }

        loadRefundPolicy();
        return () => {
            active = false;
            controller.abort();
        };
    }, []);

    const title = policy?.title || "Refund Policy";
    const subtitle = policy?.seo?.meta_description || policy?.subtitle;
    const updatedAt = policy?.updated_at || policy?.last_updated;
    const rawContent =
        policy?.body_html || policy?.content || policy?.body || null;

    return (
        <main className="min-h-screen bg-gray-50/50 dark:bg-gray-950">
            <RefundHeroBanner
                title={title}
                subtitle={subtitle}
                updatedAt={updatedAt}
            />

            <section className="container mx-auto px-4 py-12 md:py-16 max-w-4xl">
                <RefundSectionsList
                    sections={policy?.sections}
                    rawContent={rawContent}
                    loading={loading}
                    error={error}
                />
            </section>
        </main>
    );
}