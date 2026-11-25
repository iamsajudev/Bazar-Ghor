"use client";

import React from "react";
import { useParams } from "next/navigation";
import { BlogPostDetailView } from "@/components/Blog/BlogPostDetailView";

export default function BlogPostSlugPage() {
    const params = useParams<{ slug?: string | string[] }>();
    const rawSlug = params?.slug;
    const slug = Array.isArray(rawSlug) ? rawSlug[0] ?? "" : rawSlug ?? "";

    return <BlogPostDetailView slug={slug} />;
}