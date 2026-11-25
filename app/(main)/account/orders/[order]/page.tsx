"use client";

import React, { Suspense } from "react";
import { useParams } from "next/navigation";
import { OrderDetailView } from "@/components/Account/Order/OrderDetailView";

function OrderDetailFallback() {
    return (
        <div
            aria-hidden="true"
            className="container mx-auto px-4 py-10 max-w-6xl animate-pulse space-y-6"
        >
            <div className="h-5 w-40 rounded bg-gray-200 dark:bg-gray-800" />
            <div className="h-28 rounded-3xl bg-gray-200/80 dark:bg-gray-800/80" />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 h-80 rounded-3xl bg-gray-200/80 dark:bg-gray-800/80" />
                <div className="lg:col-span-4 h-72 rounded-3xl bg-gray-200/70 dark:bg-gray-800/60" />
            </div>
        </div>
    );
}

function OrderDetailContent() {
    const params = useParams<{ order?: string | string[] }>();
    const rawOrder = params?.order;
    const orderParam = Array.isArray(rawOrder)
        ? rawOrder[0] ?? ""
        : rawOrder ?? "";

    return <OrderDetailView orderIdentifier={orderParam} />;
}

export default function OrderDetailsPage() {
    return (
        <Suspense fallback={<OrderDetailFallback />}>
            <OrderDetailContent />
        </Suspense>
    );
}