"use client";

import React, { Suspense } from "react";
import { useParams } from "next/navigation";
import { BlogPostDetailView } from "@/components/Blog/BlogPostDetailView";

function BlogPostSlugFallback() {
    return (
        <div
            aria-hidden="true"
            className="container mx-auto px-4 py-10 max-w-5xl animate-pulse space-y-6"
        >
            <div className="h-6 w-48 rounded bg-gray-200 dark:bg-gray-800" />
            <div className="h-72 rounded-3xl bg-gray-200/80 dark:bg-gray-800/80" />
            <div className="h-40 rounded-2xl bg-gray-200/70 dark:bg-gray-800/60" />
        </div>
    );
}

function BlogPostSlugContent() {
    const params = useParams<{ slug?: string | string[] }>();
    const rawSlug = params?.slug;
    const slug = Array.isArray(rawSlug) ? rawSlug[0] ?? "" : rawSlug ?? "";

    return <BlogPostDetailView slug={slug} />;
}

export default function BlogPostSlugPage() {
    return (
        <Suspense fallback={<BlogPostSlugFallback />}>
            <BlogPostSlugContent />
        </Suspense>
    );
}