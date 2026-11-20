"use client";

import { useState, useEffect } from "react";

export interface ApiCategory {
    id: number;
    parent_id: number | null;
    name: string;
    slug: string;
    image_id: number | null;
    image_url: string | null;
    icon_url: string | null;
    thumbnail_url: string | null;
    banner_url: string | null;
}

interface CategoryApiResponse {
    data: ApiCategory[];
}

// ✅ মডিউল-লেভেল ক্যাশ: হেডার + কারুসেল + অন্য কম্পোনেন্ট = একটাই রিকোয়েস্ট
let categoriesCache: ApiCategory[] | null = null;
let inflightRequest: Promise<ApiCategory[]> | null = null;

async function fetchCategoriesOnce(): Promise<ApiCategory[]> {
    if (categoriesCache) return categoriesCache;
    if (inflightRequest) return inflightRequest;

    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "");
    if (!baseUrl) throw new Error("API Base URL is not defined in .env.local");

    inflightRequest = fetch(`${baseUrl}/categories`, {
        headers: { Accept: "application/json" },
    })
        .then(async (res) => {
            if (!res.ok) throw new Error(`Failed to fetch categories (HTTP ${res.status})`);
            const result: CategoryApiResponse = await res.json();
            categoriesCache = result.data ?? [];
            return categoriesCache;
        })
        .finally(() => {
            inflightRequest = null;
        });

    return inflightRequest;
}

export function useCategories() {
    const [categories, setCategories] = useState<ApiCategory[]>(categoriesCache ?? []);
    const [isLoading, setIsLoading] = useState(!categoriesCache);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        fetchCategoriesOnce()
            .then((data) => {
                if (cancelled) return;
                setCategories(data);
                setIsLoading(false);
            })
            .catch((err) => {
                if (cancelled) return;
                setError(err instanceof Error ? err.message : "Something went wrong");
                setIsLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, []);

    return { categories, isLoading, error };
}