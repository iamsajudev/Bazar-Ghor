// app/(main)/offers/page.tsx
import { Suspense } from "react";
import OffersClient, {
    type OfferProductItem,
} from "@/components/Offers/OffersClient";
import { buildApiUrl } from "@/lib/api-url";

const DIVIDE_BY_100 = true; // Set false if backend already returns major units

interface RawVariant {
    id?: number | string;
    regular_price_minor?: number;
    sale_price_minor?: number | null;
    effective_price_minor?: number;
    price_minor?: number;
    compare_at_price_minor?: number | null;
}

interface RawProduct {
    id: number | string;
    name?: string;
    title?: string;
    slug: string;
    rating?: number;
    price_minor?: number;
    compare_at_price_minor?: number | null;
    sale_price_minor?: number | null;
    regular_price_minor?: number | null;
    thumbnail_url?: string | null;
    image_url?: string | null;
    primary_image?: { url?: string | null } | null;
    variants?: RawVariant[];
}

interface RawDeal {
    id: number | string;
    name?: string;
    title?: string;
    slug?: string;
    items?: RawProduct[];
    products?: RawProduct[];
}

function toMajorAmount(minor?: number | null): number {
    if (typeof minor !== "number" || Number.isNaN(minor)) return 0;
    return DIVIDE_BY_100 ? Number((minor / 100).toFixed(2)) : minor;
}

function extractList<T>(payload: unknown): T[] {
    if (!payload || typeof payload !== "object") return [];
    const obj = payload as { data?: unknown };
    if (Array.isArray(obj.data)) return obj.data as T[];
    if (
        obj.data &&
        typeof obj.data === "object" &&
        Array.isArray((obj.data as { data?: unknown }).data)
    ) {
        return (obj.data as { data: T[] }).data;
    }
    return [];
}

function normalizeProduct(raw: RawProduct): OfferProductItem | null {
    if (!raw || !raw.slug) return null;

    const title = (raw.name || raw.title || "").trim();
    if (!title) return null;

    const variant = raw.variants?.[0];

    const rawEffective =
        variant?.effective_price_minor ??
        variant?.sale_price_minor ??
        raw.sale_price_minor ??
        raw.price_minor ??
        variant?.regular_price_minor ??
        raw.regular_price_minor ??
        0;

    const rawOriginal =
        variant?.compare_at_price_minor ??
        raw.compare_at_price_minor ??
        variant?.regular_price_minor ??
        raw.regular_price_minor ??
        null;

    const price = toMajorAmount(rawEffective);
    const originalPrice =
        typeof rawOriginal === "number" && rawOriginal > rawEffective
            ? toMajorAmount(rawOriginal)
            : undefined;

    const image =
        raw.primary_image?.url?.trim() ||
        raw.thumbnail_url?.trim() ||
        raw.image_url?.trim() ||
        "/images/product-not-found.webp";

    return {
        id: raw.id,
        title,
        slug: raw.slug,
        price,
        originalPrice,
        image,
        rating: typeof raw.rating === "number" ? raw.rating : 0,
    };
}

async function fetchJsonSafe(url: string): Promise<unknown> {
    try {
        const res = await fetch(url, {
            method: "GET",
            headers: { Accept: "application/json" },
            cache: "no-store",
        });
        if (!res.ok) return null;
        return await res.json();
    } catch {
        return null;
    }
}

async function OffersContent() {
    const [dealsJson, flashJson, productsJson] = await Promise.all([
        fetchJsonSafe(buildApiUrl("/api/v1/deals?per_page=20&page=1")),
        fetchJsonSafe(buildApiUrl("/api/v1/flash-sales?per_page=20&page=1")),
        fetchJsonSafe(
            buildApiUrl("/api/v1/products?per_page=50&page=1&sort=newest")
        ),
    ]);

    const mergedMap = new Map<string | number, OfferProductItem>();

    const deals = [
        ...extractList<RawDeal>(dealsJson),
        ...extractList<RawDeal>(flashJson),
    ];

    for (const deal of deals) {
        const dealProducts = [
            ...(Array.isArray(deal.items) ? deal.items : []),
            ...(Array.isArray(deal.products) ? deal.products : []),
        ];
        for (const item of dealProducts) {
            const mapped = normalizeProduct(item);
            if (mapped) {
                mergedMap.set(mapped.slug, mapped);
            }
        }
    }

    const catalogProducts = extractList<RawProduct>(productsJson);
    for (const prod of catalogProducts) {
        const mapped = normalizeProduct(prod);
        if (
            mapped &&
            mapped.originalPrice &&
            mapped.originalPrice > mapped.price &&
            !mergedMap.has(mapped.slug)
        ) {
            mergedMap.set(mapped.slug, mapped);
        }
    }

    const initialProducts = Array.from(mergedMap.values());

    return <OffersClient initialProducts={initialProducts} />;
}

function OffersLoadingFallback() {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="h-40 w-full rounded-3xl bg-gray-200/80 dark:bg-gray-800/80 animate-pulse mb-8" />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {Array.from({ length: 6 }).map((_, idx) => (
                    <div
                        key={idx}
                        className="h-64 rounded-2xl bg-gray-100 dark:bg-gray-900 animate-pulse"
                    />
                ))}
            </div>
        </div>
    );
}

export default function OffersPage() {
    return (
        <Suspense fallback={<OffersLoadingFallback />}>
            <OffersContent />
        </Suspense>
    );
}