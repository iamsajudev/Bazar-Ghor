import { notFound } from "next/navigation";
import { BrandClient } from "@/components/Brand/BrandClient";

export const instant = false;

interface BrandDetail {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    is_active: boolean;
    logo_url?: string | null;
    banner_url?: string | null;
}

async function getBrand(slug: string): Promise<BrandDetail | null> {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "");
    if (!baseUrl) return null;

    try {
        const res = await fetch(`${baseUrl}/brands/${encodeURIComponent(slug)}`, {
            headers: { Accept: "application/json" },
        });
        if (!res.ok) return null;
        const json = await res.json();
        return json.data ?? null;
    } catch {
        return null;
    }
}

export default async function BrandPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    const brand = await getBrand(slug);
    if (!brand || brand.is_active === false) notFound();

    return <BrandClient brand={brand} />;
}