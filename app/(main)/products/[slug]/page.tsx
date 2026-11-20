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
    attributes?: Record<string, any> | null;
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

async function getProduct(slug: string): Promise<ApiProductDetail | null> {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "");
    if (!baseUrl) return null;

    try {
        const res = await fetch(`${baseUrl}/products/${encodeURIComponent(slug)}`, {
            headers: { Accept: "application/json" },
            cache: "no-store",
        });

        if (!res.ok) {
            if (res.status === 404) return null;
            throw new Error(`Failed to fetch product: ${res.status}`);
        }

        const json = await res.json();
        return json.data ?? json;
    } catch (error) {
        console.error("Error fetching product:", error);
        return null;
    }
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
        <Suspense fallback={<div>Loading product...</div>}>
            <ProductContent params={params} />
        </Suspense>
    );
}