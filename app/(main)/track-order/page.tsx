// app/(main)/track-order/page.tsx
import { Suspense } from "react";
import TrackOrderClient from "@/components/track-order/TrackOrderClient";

function TrackOrderFallback() {
    return (
        <div className="container mx-auto px-4 py-10 space-y-6 max-w-5xl">
            <div className="h-40 w-full rounded-3xl bg-gray-200/80 dark:bg-gray-800/80 animate-pulse" />
            <div className="h-36 w-full rounded-3xl bg-gray-100 dark:bg-gray-900 animate-pulse" />
        </div>
    );
}

export default function TrackOrderPage() {
    return (
        <Suspense fallback={<TrackOrderFallback />}>
            <TrackOrderClient />
        </Suspense>
    );
}