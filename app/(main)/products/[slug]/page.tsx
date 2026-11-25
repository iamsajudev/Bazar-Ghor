import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ProductDetailsClient } from "@/components/Products/ProductDetailsClient/ProductDetailsClient";

interface ApiVariant {
    id: number;
    sku: string;
    regular_price_minor: number;
    sale_price_minor?: number | null;
    effective_price_minor: number;
    in_stock: boolean;
}

// API Response Type Definition (Defensive)
interface ApiProductDetail {
    id: number;
    name: string;
    slug: string;
    price_minor: number;
    compare_at_price_minor?: number | null;
    currency_code?: string;
    description?: string | null;
    short_description?: string | null;
    image_url?: string | null;
    thumbnail_url?: string | null;
    gallery?: { url: string }[] | null;
    in_stock: boolean;
    stock_quantity?: number;
    brand?: { id: number; name: string; slug: string } | null;
    category?: { id: number; name: string; slug: string } | null;
    attributes?: Record<string, unknown> | null;
    rating?: number | null;
    review_count?: number;
    sku?: string;
    barcode?: string;
    country_of_origin?: string;
    warranty?: string;
    delivery_time?: string;
    return_policy?: string;
    variants?: ApiVariant[] | null;
}

function resolveApiBase(): string {
    const raw =
        process.env.NEXT_PUBLIC_API_BASE_URL?.trim() ||
        process.env.NEXT_PUBLIC_API_URL?.trim() ||
        "https://ecommerce.goflixza.com/api/v1";
    const clean = raw.replace(/\/+$/, "");
    return clean.endsWith("/api/v1") ? clean : `${clean}/api/v1`;
}

const API_BASE = resolveApiBase();

async function getProduct(slug: string): Promise<ApiProductDetail | null> {
    const res = await fetch(`${API_BASE}/products/${encodeURIComponent(slug)}`, {
        headers: {
            Accept: "application/json",
        },
        cache: "no-store",
    });

    if (res.status === 404 || res.status === 403) {
        return null;
    }

    if (!res.ok) {
        throw new Error(`Failed to fetch product: ${res.status}`);
    }

    const data = await res.json();
    return data?.data ?? data;
}

function ProductDetailsSkeleton() {
    return (
        <div className="container mx-auto px-4 py-8 md:py-12 animate-pulse">
            {/* Breadcrumb Skeleton */}
            <div className="flex items-center gap-2 mb-6">
                <div className="h-4 w-14 rounded bg-gray-200 dark:bg-gray-800" />
                <div className="h-4 w-4 rounded bg-gray-200 dark:bg-gray-800" />
                <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-800" />
                <div className="h-4 w-4 rounded bg-gray-200 dark:bg-gray-800" />
                <div className="h-4 w-40 rounded bg-gray-200 dark:bg-gray-800" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                {/* Left: Image Gallery Skeleton */}
                <div className="lg:col-span-6 space-y-4">
                    <div className="relative aspect-square w-full rounded-3xl border border-gray-100 dark:border-gray-800 bg-gray-100/90 dark:bg-gray-800/60 flex items-center justify-center overflow-hidden">
                        <div className="h-10 w-10 rounded-full border-2 border-emerald-500/30 border-t-emerald-600 animate-spin" />
                    </div>

                    <div className="grid grid-cols-4 gap-3">
                        {Array.from({ length: 4 }).map((_, idx) => (
                            <div
                                key={idx}
                                className="aspect-square rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-100 dark:bg-gray-800/60"
                            />
                        ))}
                    </div>
                </div>

                {/* Right: Product Info Skeleton */}
                <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2.5">
                            <div className="h-6 w-24 rounded-full bg-emerald-100/80 dark:bg-emerald-900/30" />
                            <div className="h-6 w-20 rounded-full bg-gray-100 dark:bg-gray-800" />
                        </div>

                        <div className="space-y-2.5">
                            <div className="h-8 w-11/12 rounded-xl bg-gray-200 dark:bg-gray-800" />
                            <div className="h-8 w-7/12 rounded-xl bg-gray-200 dark:bg-gray-800" />
                        </div>

                        <div className="flex items-baseline gap-3 pt-1">
                            <div className="h-9 w-28 rounded-xl bg-orange-100 dark:bg-orange-950/40" />
                            <div className="h-5 w-20 rounded-lg bg-gray-100 dark:bg-gray-800" />
                        </div>

                        <div className="space-y-2 pt-2">
                            <div className="h-4 w-full rounded bg-gray-100 dark:bg-gray-800/80" />
                            <div className="h-4 w-full rounded bg-gray-100 dark:bg-gray-800/80" />
                            <div className="h-4 w-4/5 rounded bg-gray-100 dark:bg-gray-800/80" />
                        </div>

                        {/* Variant Chips Skeleton */}
                        <div className="pt-3 space-y-2.5">
                            <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-800" />
                            <div className="flex flex-wrap gap-2.5">
                                <div className="h-10 w-24 rounded-xl bg-gray-100 dark:bg-gray-800" />
                                <div className="h-10 w-24 rounded-xl bg-gray-100 dark:bg-gray-800" />
                                <div className="h-10 w-24 rounded-xl bg-gray-100 dark:bg-gray-800" />
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons Skeleton */}
                    <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row gap-3">
                        <div className="h-12 w-32 rounded-xl bg-gray-100 dark:bg-gray-800" />
                        <div className="h-12 flex-1 rounded-xl bg-gray-200 dark:bg-gray-800" />
                        <div className="h-12 flex-1 rounded-xl bg-orange-100 dark:bg-orange-950/40" />
                    </div>
                </div>
            </div>
        </div>
    );
}

async function ProductContent({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const product = await getProduct(slug);

    if (!product) {
        notFound();
    }

    return <ProductDetailsClient product={product} />;
}

export default function ProductPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    return (
        <Suspense fallback={<ProductDetailsSkeleton />}>
            <ProductContent params={params} />
        </Suspense>
    );
}