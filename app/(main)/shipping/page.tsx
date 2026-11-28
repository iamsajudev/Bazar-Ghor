// app/(main)/shipping/page.tsx
import { Suspense } from "react";
import ShippingPageClient from "@/components/shipping/ShippingPageClient";

function ShippingFallback() {
    return (
        <div className="container mx-auto px-4 py-10 space-y-6">
            <div className="h-40 w-full rounded-3xl bg-gray-200/80 dark:bg-gray-800/80 animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {[1, 2, 3].map((n) => (
                    <div
                        key={n}
                        className="h-36 rounded-2xl bg-gray-100 dark:bg-gray-900 animate-pulse"
                    />
                ))}
            </div>
        </div>
    );
}

export default function ShippingPage() {
    return (
        <Suspense fallback={<ShippingFallback />}>
            <ShippingPageClient />
        </Suspense>
    );
}