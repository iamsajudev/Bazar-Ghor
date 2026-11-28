// app/(main)/brands/page.tsx
import { Suspense } from "react";
import { buildApiUrl } from "@/lib/api-url";
import BrandsPageClient, { BrandRecord } from "@/components/Brand/BrandsPageClient";

async function loadBrands(): Promise<BrandRecord[]> {
    try {
        const res = await fetch(buildApiUrl("/api/v1/brands"), {
            method: "GET",
            headers: { Accept: "application/json" },
            next: { revalidate: 3600 },
        });
        if (!res.ok) return [];
        const json = await res.json();
        if (Array.isArray(json?.data)) return json.data as BrandRecord[];
        if (Array.isArray(json?.data?.data)) return json.data.data as BrandRecord[];
        return [];
    } catch {
        return [];
    }
}

async function BrandsContent() {
    const brands = await loadBrands();
    return <BrandsPageClient initialBrands={brands} />;
}

function BrandsFallback() {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="h-36 w-full rounded-3xl bg-gray-200/80 dark:bg-gray-800/80 animate-pulse mb-8" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-5">
                {Array.from({ length: 12 }).map((_, idx) => (
                    <div
                        key={idx}
                        className="h-40 rounded-2xl bg-gray-100 dark:bg-gray-900 animate-pulse"
                    />
                ))}
            </div>
        </div>
    );
}

export default function BrandsPage() {
    return (
        <Suspense fallback={<BrandsFallback />}>
            <BrandsContent />
        </Suspense>
    );
}