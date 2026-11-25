"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
    Search,
    ChevronLeft,
    ChevronRight,
    BookOpen,
} from "lucide-react";
import {
    BlogPostCard,
    type BlogCategory,
    type BlogPostItem,
} from "@/components/Blog/BlogPostCard";

interface BlogPostsApiResponse {
    current_page?: number;
    last_page?: number;
    per_page?: number;
    total?: number;
    from?: number | null;
    to?: number | null;
    data?: BlogPostItem[] | { data?: BlogPostItem[] };
}

const DEFAULT_API_BASE = "https://ecommerce.goflixza.com/api/v1";
const BLOG_BANNER_IMAGE = "/images/blogs/blog-banner.jpg";
const PER_PAGE = 9;

function resolveApiBase(): string {
    const raw =
        process.env.NEXT_PUBLIC_API_BASE_URL?.trim() ||
        process.env.NEXT_PUBLIC_API_URL?.trim() ||
        DEFAULT_API_BASE;
    const clean = raw.replace(/\/+$/, "");
    return clean.endsWith("/api/v1") ? clean : `${clean}/api/v1`;
}

function BlogCardSkeleton() {
    return (
        <div
            aria-hidden="true"
            className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 overflow-hidden shadow-xs animate-pulse flex flex-col"
        >
            <div className="w-full h-48 bg-gray-200 dark:bg-gray-800" />
            <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-2.5">
                    <div className="h-3 w-28 rounded bg-emerald-100 dark:bg-emerald-950/50" />
                    <div className="h-5 w-full rounded bg-gray-200 dark:bg-gray-800" />
                    <div className="h-5 w-3/4 rounded bg-gray-200 dark:bg-gray-800" />
                    <div className="h-3.5 w-full rounded bg-gray-100 dark:bg-gray-800/70" />
                </div>
                <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <div className="h-3 w-24 rounded bg-gray-200 dark:bg-gray-800" />
                    <div className="h-4 w-20 rounded bg-gray-200 dark:bg-gray-800" />
                </div>
            </div>
        </div>
    );
}

export default function BlogPage() {
    const [posts, setPosts] = useState<BlogPostItem[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [lastPage, setLastPage] = useState<number>(1);
    const [totalPosts, setTotalPosts] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [searchQuery, setSearchQuery] = useState<string>("");
    const [selectedCategory, setSelectedCategory] = useState<string>("all");

    const fetchBlogPosts = useCallback(async (pageToLoad: number) => {
        setLoading(true);
        setError(null);

        try {
            const baseUrl = resolveApiBase();
            const url = `${baseUrl}/blog/posts?page=${pageToLoad}&per_page=${PER_PAGE}`;

            const res = await fetch(url, {
                headers: { Accept: "application/json" },
                cache: "no-store",
            });

            if (!res.ok) {
                throw new Error(`Failed to load blog posts (${res.status})`);
            }

            const json = (await res.json()) as BlogPostsApiResponse;
            const list: BlogPostItem[] = Array.isArray(json?.data)
                ? json.data
                : Array.isArray(json?.data?.data)
                    ? json.data.data
                    : [];

            setPosts(list);
            setCurrentPage(Number(json?.current_page) || pageToLoad);
            setLastPage(Number(json?.last_page) || 1);
            setTotalPosts(Number(json?.total) || list.length);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to load blog posts");
            setPosts([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void fetchBlogPosts(currentPage);
    }, [currentPage, fetchBlogPosts]);

    const availableCategories = useMemo<BlogCategory[]>(() => {
        const map = new Map<string, BlogCategory>();
        for (const post of posts) {
            if (Array.isArray(post.categories)) {
                for (const cat of post.categories) {
                    if (cat?.slug && cat?.name && !map.has(cat.slug)) {
                        map.set(cat.slug, cat);
                    }
                }
            }
        }
        return Array.from(map.values());
    }, [posts]);

    const filteredPosts = useMemo<BlogPostItem[]>(() => {
        const q = searchQuery.trim().toLowerCase();

        return posts.filter((post) => {
            const matchesCategory =
                selectedCategory === "all" ||
                (Array.isArray(post.categories) &&
                    post.categories.some((c) => c.slug === selectedCategory));

            if (!matchesCategory) return false;

            if (!q) return true;

            const inTitle = post.title?.toLowerCase().includes(q);
            const inExcerpt = post.excerpt?.toLowerCase().includes(q);
            const inCategory = Array.isArray(post.categories)
                ? post.categories.some((c) => c.name?.toLowerCase().includes(q))
                : false;

            return Boolean(inTitle || inExcerpt || inCategory);
        });
    }, [posts, selectedCategory, searchQuery]);

    const handlePageChange = (nextPage: number) => {
        if (nextPage < 1 || nextPage > lastPage || nextPage === currentPage) return;
        setCurrentPage(nextPage);
        if (typeof window !== "undefined") {
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 md:py-10">
            {/* Hardcoded Banner Section with Left-Aligned Title & Overlay */}
            <section className="relative w-full min-h-[210px] md:min-h-[260px] rounded-3xl overflow-hidden mb-8 border border-gray-200/80 dark:border-gray-800 shadow-sm flex items-center">
                <img
                    src={BLOG_BANNER_IMAGE}
                    alt="Bismillah Body Oil Blog Banner"
                    className="absolute inset-0 w-full h-full object-cover object-center"
                />
                <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-r from-gray-950/85 via-gray-950/60 to-gray-950/25"
                />

                <div className="relative z-10 w-full px-6 py-8 md:px-10 md:py-10">
                    <div className="max-w-xl text-left">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 mb-3">
                            <BookOpen className="w-3.5 h-3.5" />
                            Stories &amp; Guides
                        </span>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                            Our Blog
                        </h1>
                        <p className="text-xs md:text-sm text-gray-200/90 mt-2 leading-relaxed">
                            {totalPosts > 0
                                ? `Showing ${filteredPosts.length} of ${totalPosts} published articles on body oil care & wellness`
                                : "Latest articles, fragrance guides, and natural body oil insights"}
                        </p>
                    </div>
                </div>
            </section>

            {/* Filter & Search Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                {availableCategories.length > 0 ? (
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                        <button
                            type="button"
                            onClick={() => setSelectedCategory("all")}
                            className={`px-4 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer ${selectedCategory === "all"
                                ? "bg-emerald-600 text-white shadow-xs"
                                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                                }`}
                        >
                            All Posts
                        </button>

                        {availableCategories.map((cat) => {
                            const isSelected = selectedCategory === cat.slug;
                            return (
                                <button
                                    key={cat.slug}
                                    type="button"
                                    onClick={() => setSelectedCategory(cat.slug)}
                                    className={`px-4 py-1.5 rounded-full text-xs font-bold max-w-[240px] truncate shrink-0 transition-all cursor-pointer ${isSelected
                                        ? "bg-emerald-600 text-white shadow-xs"
                                        : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                                        }`}
                                    title={cat.name}
                                >
                                    {cat.name}
                                </button>
                            );
                        })}
                    </div>
                ) : (
                    <div />
                )}

                <div className="relative w-full md:w-72 shrink-0">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search articles..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <BlogCardSkeleton key={i} />
                    ))}
                </div>
            ) : error ? (
                <div className="rounded-2xl border border-dashed border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 p-10 text-center">
                    <p className="text-sm font-semibold text-rose-600 dark:text-rose-400 mb-3">
                        {error}
                    </p>
                    <button
                        type="button"
                        onClick={() => void fetchBlogPosts(currentPage)}
                        className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors cursor-pointer"
                    >
                        Try Again
                    </button>
                </div>
            ) : filteredPosts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {filteredPosts.map((post, index) => (
                        <BlogPostCard
                            key={`${post.slug}-${index}`}
                            post={post}
                        />
                    ))}
                </div>
            ) : (
                <div className="rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/40 p-12 text-center">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        No blog posts found matching your filter.
                    </p>
                    {(searchQuery || selectedCategory !== "all") && (
                        <button
                            type="button"
                            onClick={() => {
                                setSearchQuery("");
                                setSelectedCategory("all");
                            }}
                            className="mt-3 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors cursor-pointer"
                        >
                            Reset Filters
                        </button>
                    )}
                </div>
            )}

            {lastPage > 1 && (
                <div className="mt-12 flex items-center justify-center gap-2">
                    <button
                        type="button"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage <= 1 || loading}
                        className="inline-flex items-center gap-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs font-bold text-gray-700 dark:text-gray-200 hover:border-emerald-500 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        <span>Previous</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                        {Array.from({ length: lastPage }, (_, idx) => idx + 1).map(
                            (pageNum) => (
                                <button
                                    key={pageNum}
                                    type="button"
                                    onClick={() => handlePageChange(pageNum)}
                                    disabled={loading}
                                    className={`w-9 h-9 rounded-xl text-xs font-bold transition-all cursor-pointer ${pageNum === currentPage
                                        ? "bg-emerald-600 text-white shadow-xs"
                                        : "border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 hover:border-emerald-500"
                                        }`}
                                >
                                    {pageNum}
                                </button>
                            )
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage >= lastPage || loading}
                        className="inline-flex items-center gap-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs font-bold text-gray-700 dark:text-gray-200 hover:border-emerald-500 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                    >
                        <span>Next</span>
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
}