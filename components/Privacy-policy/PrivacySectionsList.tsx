// components/privacy-policy/PrivacySectionsList.tsx
"use client";

import { PrivacySectionItem } from "@/types/privacy-policy";


interface PrivacySectionsListProps {
    sections?: PrivacySectionItem[];
    rawContent?: string | null;
    loading?: boolean;
    error?: string | null;
}

function decodeHtmlEntities(input: string): string {
    if (!input) return "";

    if (typeof window !== "undefined") {
        const textarea = document.createElement("textarea");
        textarea.innerHTML = input;
        return textarea.value;
    }

    return input
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
        .replace(/&apos;/g, "'")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&amp;/g, "&");
}

function isHtmlString(value: string): boolean {
    return /<[a-z][\s\S]*>/i.test(value);
}

export default function PrivacySectionsList({
    sections = [],
    rawContent,
    loading = false,
    error = null,
}: PrivacySectionsListProps) {
    if (loading) {
        return (
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 sm:p-8 md:p-10 space-y-6 animate-pulse">
                {[1, 2, 3].map((n) => (
                    <div key={n} className="space-y-3">
                        <div className="h-6 w-52 bg-gray-200 dark:bg-gray-800 rounded" />
                        <div className="h-4 w-full bg-gray-100 dark:bg-gray-800/70 rounded" />
                        <div className="h-4 w-5/6 bg-gray-100 dark:bg-gray-800/70 rounded" />
                    </div>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div
                role="alert"
                className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-2xl p-6 text-sm"
            >
                {error}
            </div>
        );
    }

    if (sections.length > 0) {
        return (
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 sm:p-8 md:p-10 space-y-8">
                {sections.map((section, idx) => {
                    const heading = decodeHtmlEntities(
                        section.title ||
                        section.heading ||
                        section.label ||
                        `Section ${idx + 1}`
                    );
                    const listItems = section.items || section.bullets || [];
                    const rawText =
                        section.html ||
                        (typeof section.content === "string" ? section.content : null) ||
                        (typeof section.body === "string" ? section.body : null) ||
                        section.description ||
                        null;

                    const decodedText = rawText ? decodeHtmlEntities(rawText) : null;

                    const arrayParagraphs = Array.isArray(section.paragraphs)
                        ? section.paragraphs
                        : Array.isArray(section.content)
                            ? section.content
                            : Array.isArray(section.body)
                                ? section.body
                                : [];

                    return (
                        <article
                            key={section.id ?? idx}
                            className="pb-7 border-b border-gray-100 dark:border-gray-800 last:border-none last:pb-0"
                        >
                            <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-3 flex items-baseline gap-2.5">
                                <span className="text-xs font-extrabold text-emerald-600 tabular-nums">
                                    {String(idx + 1).padStart(2, "0")}.
                                </span>
                                <span>{heading}</span>
                            </h2>

                            {decodedText &&
                                (isHtmlString(decodedText) ? (
                                    <div
                                        className="prose prose-sm sm:prose-base dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 leading-relaxed"
                                        dangerouslySetInnerHTML={{ __html: decodedText }}
                                    />
                                ) : (
                                    <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                                        {decodedText}
                                    </p>
                                ))}

                            {arrayParagraphs.length > 0 && (
                                <div className="space-y-3 mt-2">
                                    {arrayParagraphs.map((para, pIdx) => (
                                        <p
                                            key={pIdx}
                                            className="text-sm md:text-base text-gray-600 dark:text-gray-300 leading-relaxed"
                                        >
                                            {decodeHtmlEntities(para)}
                                        </p>
                                    ))}
                                </div>
                            )}

                            {listItems.length > 0 && (
                                <ul className="mt-3.5 space-y-2 list-disc pl-5 text-sm md:text-base text-gray-600 dark:text-gray-300">
                                    {listItems.map((item, lIdx) => (
                                        <li key={lIdx} className="leading-relaxed">
                                            {decodeHtmlEntities(item)}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </article>
                    );
                })}
            </div>
        );
    }

    if (rawContent) {
        const decodedHtml = decodeHtmlEntities(rawContent);
        return (
            <div className="">
                {isHtmlString(decodedHtml) ? (
                    <div
                        className="prose prose-sm sm:prose-base dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: decodedHtml }}
                    />
                ) : (
                    <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                        {decodedHtml}
                    </p>
                )}
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-8 text-center text-sm text-gray-500">
            Privacy policy content is currently unavailable.
        </div>
    );
}