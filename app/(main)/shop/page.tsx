// app/(main)/shop/page.tsx
import { Suspense } from "react";
import ShopCatalogClient from "@/components/shop/ShopCatalogClient";

function ShopFallback() {
    return (
        <div className="container mx-auto px-4 py-8 space-y-6">
            <div className="h-32 w-full rounded-3xl bg-gray-200/80 dark:bg-gray-800/80 animate-pulse" />
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

export default function ShopPage() {
    return (
        <Suspense fallback={<ShopFallback />}>
            <ShopCatalogClient />
        </Suspense>
    );
}