"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Calendar, ArrowRight, Tag, Newspaper } from "lucide-react";

export interface BlogCategory {
    id?: number;
    name: string;
    slug: string;
}

export interface BlogMediaObject {
    url?: string | null;
    src?: string | null;
    path?: string | null;
    thumbnail_url?: string | null;
    image_url?: string | null;
}

export interface BlogPostItem {
    id?: number | string;
    title: string;
    slug: string;
    excerpt?: string | null;
    published_at?: string | null;
    featured_image?: string | BlogMediaObject | null;
    categories?: BlogCategory[];
}

interface BlogPostCardProps {
    post: BlogPostItem;
}

function resolveMediaUrl(value: unknown): string | null {
    if (typeof value === "string") {
        const trimmed = value.trim();
        return trimmed.length > 0 ? trimmed : null;
    }

    if (value && typeof value === "object") {
        const record = value as Record<string, unknown>;
        const candidate =
            record.url ??
            record.src ??
            record.path ??
            record.thumbnail_url ??
            record.image_url;

        if (typeof candidate === "string") {
            const trimmed = candidate.trim();
            return trimmed.length > 0 ? trimmed : null;
        }
    }

    return null;
}

function formatPublishedDate(dateStr?: string | null): string {
    if (!dateStr) return "Recently Published";
    const parsed = new Date(dateStr);
    if (Number.isNaN(parsed.getTime())) return dateStr;
    return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    }).format(parsed);
}

export function BlogPostCard({ post }: BlogPostCardProps) {
    const [imgError, setImgError] = useState(false);

    const imageUrl = !imgError ? resolveMediaUrl(post.featured_image) : null;
    const categories = Array.isArray(post.categories) ? post.categories : [];

    return (
        <article className="group bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 hover:border-emerald-500/40 shadow-xs hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col h-full">
            <Link
                href={`/blog/${encodeURIComponent(post.slug)}`}
                className="relative block w-full h-48 bg-gradient-to-br from-emerald-50 via-gray-50 to-teal-50 dark:from-gray-800 dark:via-gray-900 dark:to-emerald-950/30 overflow-hidden"
            >
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={post.title}
                        loading="lazy"
                        onError={() => setImgError(true)}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-emerald-600/70 dark:text-emerald-400/70 p-4">
                        <Newspaper className="w-9 h-9" />
                        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                            Journal Article
                        </span>
                    </div>
                )}
            </Link>

            <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                    {categories.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-2.5">
                            {categories.slice(0, 2).map((cat, idx) => (
                                <span
                                    key={`${cat.slug}-${idx}`}
                                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 max-w-full truncate"
                                >
                                    <Tag className="w-2.5 h-2.5 shrink-0" />
                                    <span className="truncate">{cat.name}</span>
                                </span>
                            ))}
                        </div>
                    )}

                    <Link href={`/blog/${encodeURIComponent(post.slug)}`}>
                        <h2 className="text-base md:text-lg font-extrabold text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2 mb-2 leading-snug">
                            {post.title}
                        </h2>
                    </Link>

                    {post.excerpt && (
                        <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 leading-relaxed">
                            {post.excerpt}
                        </p>
                    )}
                </div>

                <div className="pt-3.5 mt-auto border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-2 text-xs">
                    <span className="inline-flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                        <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        {formatPublishedDate(post.published_at)}
                    </span>

                    <Link
                        href={`/blog/${encodeURIComponent(post.slug)}`}
                        className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors group/link"
                    >
                        <span>Read More</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>
        </article>
    );
}

export default BlogPostCard;