import { Suspense } from "react";
import { notFound } from "next/navigation";
import { BrandClient } from "@/components/Brand/BrandClient";

interface BrandDetail {
    id: number;
    name: string;
    slug: string;
    description?: string | null;
    is_active?: boolean;
    logo_media_id?: number | null;
    logo_url?: string | null;
    banner_url?: string | null;
}

function resolveApiBase(): string {
    const raw =
        process.env.NEXT_PUBLIC_API_BASE_URL?.trim() ||
        process.env.NEXT_PUBLIC_API_URL?.trim() ||
        "https://ecommerce.goflixza.com/api/v1";
    const clean = raw.replace(/\/+$/, "");
    return clean.endsWith("/api/v1") ? clean : `${clean}/api/v1`;
}

async function getBrand(slug: string): Promise<BrandDetail | null> {
    const baseUrl = resolveApiBase();

    try {
        const res = await fetch(`${baseUrl}/brands/${encodeURIComponent(slug)}`, {
            headers: { Accept: "application/json" },
            cache: "no-store",
        });
        if (!res.ok) return null;
        const json = await res.json();
        return json?.data ?? json ?? null;
    } catch {
        return null;
    }
}

function BrandFallback() {
    return (
        <div
            aria-hidden="true"
            className="container mx-auto px-4 py-10 space-y-6 animate-pulse"
        >
            <div className="h-44 w-full rounded-2xl bg-gray-200 dark:bg-gray-800" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="h-60 rounded-xl bg-gray-200/80 dark:bg-gray-800/80" />
                <div className="h-60 rounded-xl bg-gray-200/80 dark:bg-gray-800/80" />
                <div className="h-60 rounded-xl bg-gray-200/80 dark:bg-gray-800/80" />
                <div className="h-60 rounded-xl bg-gray-200/80 dark:bg-gray-800/80" />
            </div>
        </div>
    );
}

async function BrandContent({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;

    const brand = await getBrand(slug);
    if (!brand || brand.is_active === false) {
        notFound();
    }

    return <BrandClient brand={brand} />;
}

export default function BrandPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    return (
        <Suspense fallback={<BrandFallback />}>
            <BrandContent params={params} />
        </Suspense>
    );
}