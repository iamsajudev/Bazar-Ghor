"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
    ChevronDown,
    ChevronRight,
    HelpCircle,
    Mail,
    Phone,
    MessageCircle,
    Search,
    Sparkles,
    X,
    ChevronsDownUp,
} from "lucide-react";
import { FAQ_DATA } from "@/data/faqs";

interface ApiFaqCategory {
    id?: number | string;
    name?: string | null;
    slug?: string | null;
}

interface ApiFaqItem {
    id?: number | string;
    question?: string | null;
    answer?: string | null;
    category?: string | ApiFaqCategory | null;
    category_name?: string | null;
    status?: string | boolean | null;
    active?: boolean | null;
    sort_order?: number | string | null;
    featured_faq?: boolean | number | null;
    is_featured?: boolean | number | null;
    featured?: boolean | number | null;
}

interface FaqApiResponse {
    data?: ApiFaqItem[] | { data?: ApiFaqItem[] };
    categories?: ApiFaqCategory[];
    faqs?: ApiFaqItem[];
}

interface NormalizedFaqItem {
    id: string;
    question: string;
    answer: string;
    category: string;
    categorySlug?: string;
    sortOrder: number;
    featured: boolean;
}

interface GroupedFaqCategory {
    category: string;
    slug?: string;
    questions: NormalizedFaqItem[];
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

function isFaqActive(item: ApiFaqItem): boolean {
    if (item.active === false) return false;
    if (typeof item.status === "boolean") return item.status;
    if (typeof item.status === "string") {
        const normalized = item.status.trim().toLowerCase();
        if (["inactive", "draft", "disabled", "0", "false"].includes(normalized)) {
            return false;
        }
    }
    return true;
}

function isFaqFeatured(item: ApiFaqItem): boolean {
    const val: unknown = item.featured_faq;
    if (typeof val === "boolean") return val;
    if (typeof val === "number") return val === 1;
    if (typeof val === "string") {
        const normalized = val.trim().toLowerCase();
        return normalized === "1" || normalized === "true";
    }
    return false;
}

function resolveFaqCategoryMeta(item: ApiFaqItem): {
    name: string;
    slug?: string;
} {
    if (item.category && typeof item.category === "object") {
        const name = item.category.name?.trim() || item.category_name?.trim() || "General";
        const slug = item.category.slug?.trim() || undefined;
        return { name, slug };
    }
    if (typeof item.category_name === "string" && item.category_name.trim()) {
        return { name: item.category_name.trim() };
    }
    if (typeof item.category === "string" && item.category.trim()) {
        return { name: item.category.trim() };
    }
    return { name: "General" };
}

function buildFallbackGroups(): GroupedFaqCategory[] {
    if (!Array.isArray(FAQ_DATA)) return [];
    return FAQ_DATA.map((group, gIdx) => ({
        category: group.category,
        questions: (group.questions || []).map((item, qIdx) => ({
            id: `fallback-${gIdx}-${qIdx}`,
            question: item.q,
            answer: item.a,
            category: group.category,
            sortOrder: qIdx,
            featured: qIdx === 0 && gIdx === 0,
        })),
    }));
}

function groupApiFaqs(
    rawList: ApiFaqItem[],
    apiCategories?: ApiFaqCategory[]
): GroupedFaqCategory[] {
    const activeItems = rawList
        .filter(
            (item) =>
                isFaqActive(item) &&
                typeof item.question === "string" &&
                item.question.trim().length > 0 &&
                typeof item.answer === "string" &&
                item.answer.trim().length > 0
        )
        .map((item, idx) => {
            const catMeta = resolveFaqCategoryMeta(item);
            return {
                id: String(item.id ?? `api-faq-${idx}`),
                question: item.question!.trim(),
                answer: item.answer!.trim(),
                category: catMeta.name,
                categorySlug: catMeta.slug,
                sortOrder: Number(item.sort_order ?? idx) || idx,
                featured: isFaqFeatured(item),
            };
        })
        .sort((a, b) => a.sortOrder - b.sortOrder);

    if (activeItems.length === 0) return [];

    const map = new Map<string, GroupedFaqCategory>();

    if (Array.isArray(apiCategories)) {
        for (const cat of apiCategories) {
            const name = cat?.name?.trim();
            if (name && !map.has(name)) {
                map.set(name, {
                    category: name,
                    slug: cat?.slug?.trim() || undefined,
                    questions: [],
                });
            }
        }
    }

    for (const faq of activeItems) {
        const existing = map.get(faq.category);
        if (existing) {
            existing.questions.push(faq);
        } else {
            map.set(faq.category, {
                category: faq.category,
                slug: faq.categorySlug,
                questions: [faq],
            });
        }
    }

    return Array.from(map.values()).filter((group) => group.questions.length > 0);
}

function FaqSkeleton() {
    return (
        <div
            aria-hidden="true"
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-pulse"
        >
            <div className="lg:col-span-3 space-y-2.5">
                <div className="h-11 rounded-2xl bg-gray-200/80 dark:bg-gray-800/80" />
                <div className="h-11 rounded-2xl bg-gray-200/70 dark:bg-gray-800/60" />
                <div className="h-11 rounded-2xl bg-gray-200/70 dark:bg-gray-800/60" />
            </div>
            <div className="lg:col-span-9 space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div
                        key={i}
                        className="h-16 rounded-2xl bg-gray-200/80 dark:bg-gray-800/80"
                    />
                ))}
            </div>
        </div>
    );
}

export default function FAQsPage() {
    const fallbackGroups = useMemo(() => buildFallbackGroups(), []);
    const [faqGroups, setFaqGroups] = useState<GroupedFaqCategory[]>(fallbackGroups);
    const [loading, setLoading] = useState<boolean>(true);

    const [activeCategory, setActiveCategory] = useState<string>(
        fallbackGroups[0]?.category || "All"
    );
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [onlyFeatured, setOnlyFeatured] = useState<boolean>(false);
    const [openIds, setOpenIds] = useState<Record<string, boolean>>({});

    const loadFaqs = useCallback(async () => {
        setLoading(true);
        const baseUrl = resolveApiBase();
        const endpoints = [`${baseUrl}/faq`, `${baseUrl}/cms/faq`, `${baseUrl}/faqs`];

        for (const endpoint of endpoints) {
            try {
                const res = await fetch(endpoint, {
                    headers: { Accept: "application/json" },
                    cache: "no-store",
                });

                if (!res.ok) continue;

                const json = (await res.json()) as FaqApiResponse | ApiFaqItem[];
                const payload: FaqApiResponse = Array.isArray(json) ? { data: json } : json;

                const list: ApiFaqItem[] = Array.isArray(payload?.data)
                    ? payload.data
                    : Array.isArray(payload?.data?.data)
                        ? payload.data.data
                        : Array.isArray(payload?.faqs)
                            ? payload.faqs
                            : [];

                const grouped = groupApiFaqs(list, payload?.categories);
                if (grouped.length > 0) {
                    setFaqGroups(grouped);
                    setActiveCategory((prev) =>
                        prev === "All" || grouped.some((g) => g.category === prev)
                            ? prev
                            : grouped[0].category
                    );
                    setLoading(false);
                    return;
                }
            } catch {
                // Try next endpoint or fallback
            }
        }

        setFaqGroups(fallbackGroups);
        setLoading(false);
    }, [fallbackGroups]);

    useEffect(() => {
        void loadFaqs();
    }, [loadFaqs]);

    const allQuestions = useMemo(
        () => faqGroups.flatMap((g) => g.questions),
        [faqGroups]
    );

    const isFiltering =
        searchQuery.trim().length > 0 || onlyFeatured || activeCategory === "All";

    const visibleFAQs = useMemo<NormalizedFaqItem[]>(() => {
        const q = searchQuery.trim().toLowerCase();

        const baseList =
            q || onlyFeatured || activeCategory === "All"
                ? allQuestions
                : faqGroups.find((f) => f.category === activeCategory)?.questions || [];

        return baseList.filter((item) => {
            if (onlyFeatured && !item.featured) return false;
            if (!q) return true;
            return (
                item.question.toLowerCase().includes(q) ||
                item.answer.toLowerCase().includes(q) ||
                item.category.toLowerCase().includes(q)
            );
        });
    }, [allQuestions, faqGroups, activeCategory, searchQuery, onlyFeatured]);

    const toggleQuestion = (id: string) => {
        setOpenIds((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const allVisibleOpen =
        visibleFAQs.length > 0 && visibleFAQs.every((item) => Boolean(openIds[item.id]));

    const handleToggleAllVisible = () => {
        if (allVisibleOpen) {
            setOpenIds((prev) => {
                const next = { ...prev };
                for (const item of visibleFAQs) {
                    delete next[item.id];
                }
                return next;
            });
        } else {
            setOpenIds((prev) => {
                const next = { ...prev };
                for (const item of visibleFAQs) {
                    next[item.id] = true;
                }
                return next;
            });
        }
    };

    return (
        <div className="container mx-auto px-4 py-10 md:py-14">
            {/* Breadcrumb */}
            <nav
                aria-label="Breadcrumb"
                className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-6"
            >
                <Link
                    href="/"
                    className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                    Home
                </Link>
                <ChevronRight className="h-4 w-4 text-gray-400" />
                <span className="text-gray-900 dark:text-white font-semibold">
                    FAQs
                </span>
            </nav>

            {/* Modern Hero Header + Search */}
            <div className="bg-gradient-to-br from-emerald-50/90 via-white to-teal-50/70 dark:from-gray-900 dark:via-gray-900 dark:to-emerald-950/25 rounded-3xl border border-gray-200/80 dark:border-gray-800 p-7 sm:p-10 md:p-12 mb-10 text-center shadow-2xs">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-600 text-white shadow-sm mb-4">
                    <HelpCircle className="h-7 w-7" />
                </div>

                <h1 className="text-3xl sm:text-4xl md:text-[42px] font-extrabold text-gray-900 dark:text-white tracking-tight mb-3">
                    Frequently Asked Questions
                </h1>

                <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-7 leading-relaxed">
                    Quick answers about orders, delivery, botanical body oils, returns, and customer care.
                </p>

                {/* Search & Featured Controls */}
                <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <div className="relative flex-1">
                        <Search className="h-4 w-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search questions or keywords..."
                            className="w-full pl-11 pr-10 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 transition-all"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => setSearchQuery("")}
                                aria-label="Clear search"
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 cursor-pointer"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={() => setOnlyFeatured((prev) => !prev)}
                        className={`inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold border transition-all cursor-pointer shrink-0 ${onlyFeatured
                                ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                                : "bg-white dark:bg-gray-950 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:border-emerald-500"
                            }`}
                    >
                        <Sparkles className="h-4 w-4" />
                        <span>Featured</span>
                    </button>
                </div>
            </div>

            {loading ? (
                <FaqSkeleton />
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left Category Sidebar */}
                    <aside className="lg:col-span-3 lg:sticky lg:top-28">
                        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200/80 dark:border-gray-800 p-4 shadow-2xs">
                            <div className="flex items-center justify-between px-3 py-2 mb-2">
                                <h2 className="text-xs font-extrabold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                    Categories
                                </h2>
                                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300">
                                    {allQuestions.length}
                                </span>
                            </div>

                            <nav className="space-y-1">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setActiveCategory("All");
                                        setSearchQuery("");
                                        setOnlyFeatured(false);
                                    }}
                                    className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all cursor-pointer ${activeCategory === "All" && !searchQuery && !onlyFeatured
                                            ? "bg-emerald-600 text-white shadow-xs"
                                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/70"
                                        }`}
                                >
                                    <span>All Questions</span>
                                    <span
                                        className={`text-xs px-2 py-0.5 rounded-full ${activeCategory === "All" &&
                                                !searchQuery &&
                                                !onlyFeatured
                                                ? "bg-white/20 text-white"
                                                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                                            }`}
                                    >
                                        {allQuestions.length}
                                    </span>
                                </button>

                                {faqGroups.map((cat) => {
                                    const isSelected =
                                        activeCategory === cat.category &&
                                        !searchQuery &&
                                        !onlyFeatured;

                                    return (
                                        <button
                                            key={cat.slug || cat.category}
                                            type="button"
                                            onClick={() => {
                                                setActiveCategory(cat.category);
                                                setSearchQuery("");
                                                setOnlyFeatured(false);
                                            }}
                                            className={`w-full flex items-center justify-between gap-2 px-4 py-3 rounded-2xl text-sm font-semibold transition-all cursor-pointer text-left ${isSelected
                                                    ? "bg-emerald-600 text-white shadow-xs"
                                                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/70"
                                                }`}
                                            title={cat.category}
                                        >
                                            <span className="truncate">{cat.category}</span>
                                            <span
                                                className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${isSelected
                                                        ? "bg-white/20 text-white"
                                                        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                                                    }`}
                                            >
                                                {cat.questions.length}
                                            </span>
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>
                    </aside>

                    {/* Right Accordion List */}
                    <div className="lg:col-span-9 min-w-0">
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                            <div className="min-w-0">
                                <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 dark:text-white truncate">
                                    {searchQuery
                                        ? `Search results for "${searchQuery}"`
                                        : onlyFeatured
                                            ? "Featured Questions"
                                            : activeCategory}
                                </h2>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                    {visibleFAQs.length}{" "}
                                    {visibleFAQs.length === 1 ? "question" : "questions"} available
                                </p>
                            </div>

                            {visibleFAQs.length > 0 && (
                                <button
                                    type="button"
                                    onClick={handleToggleAllVisible}
                                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs font-bold text-gray-700 dark:text-gray-200 hover:border-emerald-500 transition-colors cursor-pointer shrink-0"
                                >
                                    <ChevronsDownUp className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                                    <span>
                                        {allVisibleOpen ? "Collapse All" : "Expand All"}
                                    </span>
                                </button>
                            )}
                        </div>

                        {visibleFAQs.length > 0 ? (
                            <div className="space-y-3">
                                {visibleFAQs.map((faq) => {
                                    const isOpen = Boolean(openIds[faq.id]);

                                    return (
                                        <div
                                            key={faq.id}
                                            className={`rounded-2xl border transition-all duration-200 overflow-hidden ${isOpen
                                                    ? "bg-white dark:bg-gray-900 border-emerald-500/50 shadow-sm"
                                                    : "bg-white dark:bg-gray-900 border-gray-200/80 dark:border-gray-800 hover:border-emerald-500/30"
                                                }`}
                                        >
                                            <button
                                                type="button"
                                                onClick={() => toggleQuestion(faq.id)}
                                                aria-expanded={isOpen}
                                                className="w-full flex items-start justify-between gap-4 px-5 py-4 text-left hover:bg-gray-50/70 dark:hover:bg-gray-800/40 transition-colors cursor-pointer"
                                            >
                                                <div className="space-y-1.5 min-w-0 flex-1">
                                                    {(isFiltering || faq.featured) && (
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            {isFiltering && (
                                                                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full max-w-full truncate">
                                                                    {faq.category}
                                                                </span>
                                                            )}
                                                            {faq.featured && (
                                                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-0.5 rounded-full">
                                                                    <Sparkles className="h-2.5 w-2.5" />
                                                                    Featured
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}

                                                    <span className="block text-sm md:text-base font-bold text-gray-900 dark:text-white leading-snug">
                                                        {faq.question}
                                                    </span>
                                                </div>

                                                <span
                                                    className={`mt-0.5 w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${isOpen
                                                            ? "bg-emerald-600 text-white"
                                                            : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                                                        }`}
                                                >
                                                    <ChevronDown
                                                        className={`h-4 w-4 transition-transform duration-300 ${isOpen ? "rotate-180" : ""
                                                            }`}
                                                    />
                                                </span>
                                            </button>

                                            <div
                                                className={`grid transition-all duration-300 ease-out ${isOpen
                                                        ? "grid-rows-[1fr] opacity-100"
                                                        : "grid-rows-[0fr] opacity-0"
                                                    }`}
                                            >
                                                <div className="overflow-hidden">
                                                    <div className="px-5 pb-5 pt-1 border-t border-gray-100 dark:border-gray-800/80 text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                                                        {faq.answer}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-gray-900 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800 p-10 text-center space-y-3">
                                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    No matching questions found.
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Try another keyword or reset your active filters.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearchQuery("");
                                        setOnlyFeatured(false);
                                        if (faqGroups[0]) {
                                            setActiveCategory(faqGroups[0].category);
                                        }
                                    }}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer"
                                >
                                    Reset Filters
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Support CTA Banner */}
            <div className="mt-16 bg-gradient-to-r from-emerald-800 via-green-700 to-teal-800 rounded-3xl p-8 md:p-12 text-center shadow-sm">
                <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-3">
                    Still have questions?
                </h2>
                <p className="text-emerald-100/90 text-sm md:text-base mb-7 max-w-lg mx-auto leading-relaxed">
                    Our support team is here to help. Reach out to us and we&apos;ll respond as soon as possible.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
                    <a
                        href="tel:+8809612338833"
                        className="inline-flex items-center gap-2 bg-white text-emerald-900 px-6 py-3 rounded-xl font-bold text-sm hover:bg-emerald-50 transition-colors w-full sm:w-auto justify-center shadow-xs"
                    >
                        <Phone className="h-4 w-4" />
                        <span>Call Us</span>
                    </a>
                    <a
                        href="mailto:contact@bazarghor.com"
                        className="inline-flex items-center gap-2 bg-white/10 text-white border border-white/25 px-6 py-3 rounded-xl font-bold text-sm hover:bg-white/20 transition-colors w-full sm:w-auto justify-center"
                    >
                        <Mail className="h-4 w-4" />
                        <span>Email Support</span>
                    </a>
                    <a
                        href="https://wa.me/8809612338833"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-[#25D366] text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-[#1da851] transition-colors w-full sm:w-auto justify-center shadow-xs"
                    >
                        <MessageCircle className="h-4 w-4" />
                        <span>WhatsApp</span>
                    </a>
                </div>
            </div>
        </div>
    );
}