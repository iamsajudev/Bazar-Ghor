// app/(main)/new-arrivals/page.tsx
import { Suspense } from "react";
import NewArrivalsClient, {
    type NewArrivalProductItem,
} from "@/components/NewArrivals/NewArrivalsClient";
import { buildApiUrl } from "@/lib/api-url";

const DIVIDE_BY_100 = true;

interface RawVariant {
    regular_price_minor?: number;
    sale_price_minor?: number | null;
    effective_price_minor?: number;
    price_minor?: number;
    compare_at_price_minor?: number | null;
}

interface RawApiProduct {
    id: number | string;
    name?: string;
    title?: string;
    slug: string;
    rating?: number;
    is_new_arrival?: boolean;
    badges?: string[];
    price_minor?: number;
    compare_at_price_minor?: number | null;
    sale_price_minor?: number | null;
    regular_price_minor?: number | null;
    thumbnail_url?: string | null;
    image_url?: string | null;
    primary_image?: { url?: string | null } | null;
    variants?: RawVariant[];
}

function toMajorAmount(minor?: number | null): number {
    if (typeof minor !== "number" || Number.isNaN(minor)) return 0;
    return DIVIDE_BY_100 ? Number((minor / 100).toFixed(2)) : minor;
}

function isNewArrivalItem(raw: RawApiProduct): boolean {
    if (raw.is_new_arrival === true) return true;
    if (Array.isArray(raw.badges)) {
        return raw.badges.some((b) =>
            ["new", "new-arrival", "new_arrival"].includes(b.toLowerCase())
        );
    }
    return false;
}

function mapProduct(raw: RawApiProduct): NewArrivalProductItem | null {
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
        id: Number(raw.id) || 0,
        title,
        slug: raw.slug,
        price,
        originalPrice,
        image,
        rating: typeof raw.rating === "number" ? raw.rating : 0,
    };
}

async function fetchNewArrivals(): Promise<NewArrivalProductItem[]> {
    try {
        const res = await fetch(
            buildApiUrl("/api/v1/products?per_page=50&page=1&sort=newest"),
            {
                method: "GET",
                headers: { Accept: "application/json" },
                cache: "no-store",
            }
        );
        if (!res.ok) return [];
        const json = await res.json();
        const list: RawApiProduct[] = Array.isArray(json?.data)
            ? json.data
            : Array.isArray(json?.data?.data)
                ? json.data.data
                : [];

        const flagged = list.filter(isNewArrivalItem);
        const sourceList = flagged.length > 0 ? flagged : list.slice(0, 12);

        return sourceList
            .map(mapProduct)
            .filter((item): item is NewArrivalProductItem => Boolean(item));
    } catch {
        return [];
    }
}

async function NewArrivalsContent() {
    const products = await fetchNewArrivals();
    return <NewArrivalsClient initialProducts={products} />;
}

function NewArrivalsFallback() {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="h-24 w-full rounded-2xl bg-gray-100 dark:bg-gray-900 animate-pulse mb-8" />
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

export default function NewArrivalsPage() {
    return (
        <Suspense fallback={<NewArrivalsFallback />}>
            <NewArrivalsContent />
        </Suspense>
    );
}