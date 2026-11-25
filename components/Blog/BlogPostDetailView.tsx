"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
    Calendar,
    ArrowLeft,
    Tag,
    Newspaper,
    Share2,
    Check,
    BookOpen,
    Clock,
    User,
    Sparkles,
    ChevronRight,
} from "lucide-react";

export interface BlogCategory {
    id?: number;
    name: string;
    slug: string;
}

export interface BlogAuthor {
    name?: string;
    avatar?: string | null;
}

export interface BlogMediaObject {
    url?: string | null;
    src?: string | null;
    path?: string | null;
    thumbnail_url?: string | null;
    image_url?: string | null;
}

export interface BlogPostDetail {
    id?: number | string;
    title: string;
    slug: string;
    excerpt?: string | null;
    content_html?: string | null;
    body_html?: string | null;
    content?: string | null;
    body?: string | null;
    published_at?: string | null;
    updated_at?: string | null;
    featured_image?: string | BlogMediaObject | null;
    image?: string | BlogMediaObject | null;
    categories?: BlogCategory[];
    author?: BlogAuthor | string | null;
    reading_time?: string | number | null;
}

interface SinglePostApiResponse {
    data?: BlogPostDetail | { post?: BlogPostDetail };
    post?: BlogPostDetail;
}

interface RelatedPostsApiResponse {
    data?: BlogPostDetail[] | { data?: BlogPostDetail[] };
}

interface BlogPostDetailViewProps {
    slug: string;
}

const DEFAULT_API_BASE = "https://ecommerce.goflixza.com/api/v1";

function resolveApiBase(): string {
    const raw =
        process.env.NEXT_PUBLIC_API_BASE_URL?.trim() ||
        process.env.NEXT_PUBLIC_API_URL?.trim() ||
        DEFAULT_API_BASE;
    const clean = raw.replace(/\/+$/, "");
    return clean.endsWith("/api/v1") ? clean : `${clean}/api/v1`;
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
        month: "long",
        day: "numeric",
    }).format(parsed);
}

function looksLikeHtml(text: string): boolean {
    return /<\/?[a-z][\s\S]*>/i.test(text);
}

function stripHtmlToText(html: string): string {
    return html
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function estimateReadTimeLabel(
    readingTime: string | number | null | undefined,
    rawText: string
): string {
    if (typeof readingTime === "number" && readingTime > 0) {
        return `${readingTime} min read`;
    }
    if (typeof readingTime === "string" && readingTime.trim()) {
        return readingTime.trim();
    }
    const words = rawText.trim().split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.ceil(words / 200));
    return `${minutes} min read`;
}

function resolveAuthorName(author?: BlogAuthor | string | null): string {
    if (!author) return "Bismillah Editorial";
    if (typeof author === "string") return author.trim() || "Bismillah Editorial";
    if (typeof author === "object" && typeof author.name === "string") {
        return author.name.trim() || "Bismillah Editorial";
    }
    return "Bismillah Editorial";
}

function RelatedPostSidebarItem({ item }: { item: BlogPostDetail }) {
    const [imgError, setImgError] = useState(false);
    const thumb = !imgError
        ? resolveMediaUrl(item.featured_image) || resolveMediaUrl(item.image)
        : null;

    return (
        <Link
            href={`/blog/${encodeURIComponent(item.slug)}`}
            className="group flex items-start gap-3.5 p-2.5 -mx-2.5 rounded-2xl hover:bg-emerald-50/70 dark:hover:bg-emerald-950/25 transition-colors"
        >
            <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-gray-800 dark:to-emerald-950/30 border border-gray-200/70 dark:border-gray-800 flex items-center justify-center">
                {thumb ? (
                    <img
                        src={thumb}
                        alt={item.title}
                        onError={() => setImgError(true)}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <Newspaper className="w-5 h-5 text-emerald-600/70 dark:text-emerald-400/70" />
                )}
            </div>

            <div className="min-w-0 flex-1">
                <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2 leading-snug">
                    {item.title}
                </h4>
                <span className="inline-flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                    <Calendar className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    {formatPublishedDate(item.published_at)}
                </span>
            </div>
        </Link>
    );
}

function PostDetailSkeleton() {
    return (
        <div
            aria-hidden="true"
            className="container mx-auto px-4 py-10 animate-pulse"
        >
            <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-800 mb-6" />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-6">
                    <div className="space-y-3">
                        <div className="h-5 w-36 rounded-full bg-emerald-100 dark:bg-emerald-950/50" />
                        <div className="h-9 w-full rounded-xl bg-gray-200 dark:bg-gray-800" />
                        <div className="h-9 w-4/5 rounded-xl bg-gray-200 dark:bg-gray-800" />
                        <div className="h-4 w-56 rounded bg-gray-100 dark:bg-gray-800/70" />
                    </div>
                    <div className="w-full h-72 md:h-[420px] rounded-3xl bg-gray-200 dark:bg-gray-800" />
                    <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200/80 dark:border-gray-800 p-8 space-y-3">
                        <div className="h-4 w-full rounded bg-gray-100 dark:bg-gray-800" />
                        <div className="h-4 w-full rounded bg-gray-100 dark:bg-gray-800" />
                        <div className="h-4 w-11/12 rounded bg-gray-100 dark:bg-gray-800" />
                        <div className="h-4 w-3/4 rounded bg-gray-100 dark:bg-gray-800" />
                    </div>
                </div>

                <aside className="lg:col-span-4 space-y-6">
                    <div className="h-52 rounded-3xl bg-gray-200/80 dark:bg-gray-800/80" />
                    <div className="h-72 rounded-3xl bg-gray-200/70 dark:bg-gray-800/60" />
                </aside>
            </div>
        </div>
    );
}

export function BlogPostDetailView({ slug }: BlogPostDetailViewProps) {
    const [post, setPost] = useState<BlogPostDetail | null>(null);
    const [relatedPosts, setRelatedPosts] = useState<BlogPostDetail[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [imgError, setImgError] = useState<boolean>(false);
    const [copied, setCopied] = useState<boolean>(false);

    const loadPostAndSidebar = useCallback(async (targetSlug: string) => {
        if (!targetSlug) {
            setError("Invalid blog post URL.");
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        setImgError(false);

        const baseUrl = resolveApiBase();
        const encodedSlug = encodeURIComponent(targetSlug);

        try {
            const [postRes, listRes] = await Promise.allSettled([
                fetch(`${baseUrl}/blog/posts/${encodedSlug}`, {
                    headers: { Accept: "application/json" },
                    cache: "no-store",
                }),
                fetch(`${baseUrl}/blog/posts?page=1&per_page=6`, {
                    headers: { Accept: "application/json" },
                    cache: "no-store",
                }),
            ]);

            if (listRes.status === "fulfilled" && listRes.value.ok) {
                const listJson =
                    (await listRes.value.json()) as RelatedPostsApiResponse;
                const rawList: BlogPostDetail[] = Array.isArray(listJson?.data)
                    ? listJson.data
                    : Array.isArray(listJson?.data?.data)
                        ? listJson.data.data
                        : [];

                const others = rawList
                    .filter((item) => item?.slug && item.slug !== targetSlug)
                    .slice(0, 4);
                setRelatedPosts(others);
            } else {
                setRelatedPosts([]);
            }

            if (postRes.status !== "fulfilled" || !postRes.value.ok) {
                const status =
                    postRes.status === "fulfilled" ? postRes.value.status : 500;
                throw new Error(
                    status === 404
                        ? "Blog post not found."
                        : `Failed to load blog post (${status})`
                );
            }

            const json =
                (await postRes.value.json()) as SinglePostApiResponse & BlogPostDetail;
            const resolvedPost: BlogPostDetail | null =
                (json?.data &&
                    typeof json.data === "object" &&
                    "post" in json.data
                    ? json.data.post
                    : (json?.data as BlogPostDetail | undefined)) ||
                json?.post ||
                (json?.title ? json : null);

            if (!resolvedPost || !resolvedPost.title) {
                throw new Error("Blog post content is unavailable.");
            }

            setPost(resolvedPost);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to load post");
            setPost(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadPostAndSidebar(slug);
    }, [slug, loadPostAndSidebar]);

    const handleShare = async () => {
        if (typeof window === "undefined") return;
        const shareUrl = window.location.href;

        try {
            if (navigator.share) {
                await navigator.share({
                    title: post?.title || "Blog Article",
                    url: shareUrl,
                });
                return;
            }
        } catch {
            // Fallback to clipboard copy below
        }

        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 2000);
        } catch {
            // Ignore clipboard errors
        }
    };

    const richHtml = useMemo(() => {
        if (!post) return null;
        return (
            post.content_html?.trim() ||
            post.body_html?.trim() ||
            (post.content && looksLikeHtml(post.content)
                ? post.content.trim()
                : null) ||
            (post.body && looksLikeHtml(post.body) ? post.body.trim() : null)
        );
    }, [post]);

    const paragraphs = useMemo(() => {
        if (!post || richHtml) return [];
        const plain =
            post.content?.trim() || post.body?.trim() || post.excerpt?.trim() || "";
        if (!plain) return [];
        return plain
            .split(/\n{2,}|\r\n{2,}/)
            .map((p) => p.trim())
            .filter(Boolean);
    }, [post, richHtml]);

    const readTimeText = useMemo(() => {
        if (!post) return "2 min read";
        const textSource = richHtml
            ? stripHtmlToText(richHtml)
            : paragraphs.join(" ") || post.excerpt || "";
        return estimateReadTimeLabel(post.reading_time, textSource);
    }, [post, richHtml, paragraphs]);

    if (loading) {
        return <PostDetailSkeleton />;
    }

    if (error || !post) {
        return (
            <div className="container mx-auto px-4 py-16 max-w-3xl text-center">
                <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-10 shadow-xs space-y-4">
                    <BookOpen className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto" />
                    <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
                        {error || "Article Not Found"}
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                        The article you are looking for may have been moved or removed.
                    </p>
                    <div className="pt-2 flex items-center justify-center gap-3">
                        <Link
                            href="/blog"
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Back to Blog</span>
                        </Link>
                        {slug && (
                            <button
                                type="button"
                                onClick={() => void loadPostAndSidebar(slug)}
                                className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                            >
                                Retry
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    const coverImage = !imgError
        ? resolveMediaUrl(post.featured_image) || resolveMediaUrl(post.image)
        : null;

    const categories = Array.isArray(post.categories) ? post.categories : [];
    const authorName = resolveAuthorName(post.author);

    return (
        <div className="container mx-auto px-4 py-8 md:py-12">
            {/* Top Breadcrumb Bar */}
            <div className="mb-8 flex items-center justify-between gap-4">
                <Link
                    href="/blog"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 text-xs md:text-sm font-bold text-gray-700 dark:text-gray-200 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors group shadow-2xs"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span>Back to All Posts</span>
                </Link>

                <button
                    type="button"
                    onClick={() => void handleShare()}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200/80 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs font-bold text-gray-700 dark:text-gray-200 hover:border-emerald-500 transition-colors cursor-pointer shadow-2xs"
                >
                    {copied ? (
                        <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Link Copied</span>
                        </>
                    ) : (
                        <>
                            <Share2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span>Share Article</span>
                        </>
                    )}
                </button>
            </div>

            {/* Main 2-Column Layout: Article + Right Sidebar */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
                {/* Left / Main Article Column */}
                <article className="lg:col-span-8 min-w-0">
                    <header className="mb-7">
                        {categories.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                                {categories.map((cat, idx) => (
                                    <span
                                        key={`${cat.slug}-${idx}`}
                                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40"
                                    >
                                        <Tag className="w-3 h-3 shrink-0" />
                                        <span>{cat.name}</span>
                                    </span>
                                ))}
                            </div>
                        )}

                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-[1.2] mb-5">
                            {post.title}
                        </h1>

                        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs md:text-sm text-gray-500 dark:text-gray-400 pb-6 border-b border-gray-200/80 dark:border-gray-800">
                            <span className="inline-flex items-center gap-1.5">
                                <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                <span className="font-semibold text-gray-700 dark:text-gray-200">
                                    {authorName}
                                </span>
                            </span>

                            <span className="inline-flex items-center gap-1.5">
                                <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                <span>{formatPublishedDate(post.published_at)}</span>
                            </span>

                            <span className="inline-flex items-center gap-1.5">
                                <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                <span>{readTimeText}</span>
                            </span>
                        </div>
                    </header>

                    {/* Cover Image */}
                    <div className="mb-8 rounded-3xl overflow-hidden border border-gray-200/80 dark:border-gray-800 bg-gradient-to-br from-emerald-50 via-gray-50 to-teal-50 dark:from-gray-800 dark:via-gray-900 dark:to-emerald-950/30 shadow-xs">
                        {coverImage ? (
                            <img
                                src={coverImage}
                                alt={post.title}
                                onError={() => setImgError(true)}
                                className="w-full max-h-[460px] object-cover"
                            />
                        ) : (
                            <div className="h-56 md:h-72 w-full flex flex-col items-center justify-center gap-2.5 text-emerald-600/70 dark:text-emerald-400/70 p-6">
                                <Newspaper className="w-12 h-12" />
                                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                                    Featured Article
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Summary / Excerpt Box */}
                    {post.excerpt && (
                        <div className="mb-8 p-5 md:p-6 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border-l-4 border-emerald-600 text-sm md:text-base font-medium text-gray-700 dark:text-gray-300 leading-relaxed">
                            {post.excerpt}
                        </div>
                    )}

                    {/* Clean Article Body */}
                    <div className="bg-white dark:bg-gray-900 py-6 sm:py-8 md:py-5">
                        {richHtml ? (
                            <div
                                className="prose prose-sm sm:prose-base dark:prose-invert max-w-none prose-headings:font-extrabold prose-headings:tracking-tight prose-p:leading-relaxed prose-a:text-emerald-600 hover:prose-a:underline prose-img:rounded-2xl"
                                dangerouslySetInnerHTML={{ __html: richHtml }}
                            />
                        ) : paragraphs.length > 0 ? (
                            <div className="space-y-4 text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                                {paragraphs.map((para, i) => (
                                    <p key={i}>{para}</p>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                No additional content available for this post.
                            </p>
                        )}
                    </div>

                    {/* Bottom Navigation */}
                    <div className="mt-8 pt-6 flex items-center justify-between">
                        <Link
                            href="/blog"
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-900 dark:bg-gray-800 hover:bg-emerald-600 text-white text-xs md:text-sm font-bold transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Explore More Articles</span>
                        </Link>
                    </div>
                </article>

                {/* Right Sticky Sidebar */}
                <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
                    {/* Brand / Journal Highlight Card */}
                    <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200/80 dark:border-gray-800 p-6 shadow-xs">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 mb-3">
                            <Sparkles className="w-3 h-3" />
                            <span>Bismillah Body Oil</span>
                        </div>
                        <h2 className="text-lg font-extrabold text-gray-900 dark:text-white leading-snug mb-2">
                            Botanical Care &amp; Scent Notes
                        </h2>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-4">
                            Explore pure oil blends, application tips, and fragrance guides crafted for everyday comfort.
                        </p>
                        <Link
                            href="/products"
                            className="inline-flex items-center justify-between w-full px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors"
                        >
                            <span>Browse Body Oils</span>
                            <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>

                    {/* Recent / Related Posts */}
                    {relatedPosts.length > 0 && (
                        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200/80 dark:border-gray-800 p-6 shadow-xs">
                            <h3 className="text-sm font-extrabold uppercase tracking-wider text-gray-900 dark:text-white mb-4">
                                More From Journal
                            </h3>
                            <div className="divide-y divide-gray-100 dark:divide-gray-800 space-y-3 [&>a:not(:first-child)]:pt-3">
                                {relatedPosts.map((item, idx) => (
                                    <RelatedPostSidebarItem
                                        key={`${item.slug}-${idx}`}
                                        item={item}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Topics / Categories */}
                    {categories.length > 0 && (
                        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200/80 dark:border-gray-800 p-6 shadow-xs">
                            <h3 className="text-sm font-extrabold uppercase tracking-wider text-gray-900 dark:text-white mb-3.5">
                                Post Topics
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {categories.map((cat, idx) => (
                                    <Link
                                        key={`${cat.slug}-${idx}`}
                                        href="/blog"
                                        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-emerald-600 hover:text-white transition-colors"
                                    >
                                        {cat.name}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </aside>
            </div>
        </div>
    );
}

export default BlogPostDetailView;