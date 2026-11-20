"use client";

import { useState, useEffect, useCallback, useRef } from "react";

// ডক: ProductResource collection; prices in minor units
// আসল ফিল্ড নাম প্রথম published প্রোডাক্ট এলে মিলিয়ে নেবেন
export interface ApiProduct {
    id: number;
    name: string;
    slug: string;
    price_minor: number;          // minor units (পয়সা)
    compare_at_price_minor?: number | null;
    currency_code?: string;
    image_url?: string | null;
    thumbnail_url?: string | null;
    in_stock?: boolean;
    brand?: { id: number; name: string; slug: string } | null;
    category?: { id: number; name: string; slug: string } | null;
}

export type ProductSort = "newest" | "name_asc" | "name_desc" | "price_asc" | "price_desc";

export interface ProductQuery {
    search?: string;
    minPriceTaka?: number;   // UI থেকে টাকায় আসবে, hook পয়সায় পাঠাবে
    maxPriceTaka?: number;
    inStock?: boolean;
    sort?: ProductSort;
    page?: number;
    perPage?: number;        // ডক: <= 50
}

interface ProductsApiResponse {
    data: ApiProduct[];
    meta: { current_page: number; last_page: number; total: number; per_page: number };
}

function buildQueryString(q: ProductQuery): string {
    const params = new URLSearchParams();
    if (q.search) params.set("search", q.search);
    if (q.minPriceTaka != null && q.minPriceTaka > 0)
        params.set("min_price", String(Math.round(q.minPriceTaka * 100)));
    if (q.maxPriceTaka != null && q.maxPriceTaka > 0)
        params.set("max_price", String(Math.round(q.maxPriceTaka * 100)));
    if (q.inStock) params.set("in_stock", "1");
    if (q.sort) params.set("sort", q.sort);
    if (q.page && q.page > 1) params.set("page", String(q.page));
    params.set("per_page", String(Math.min(q.perPage ?? 12, 50)));
    return params.toString();
}

// basePath: "/categories/{slug}/products" অথবা "/brands/{slug}/products" অথবা "/products"
export function useProducts(basePath: string, query: ProductQuery) {
    const [products, setProducts] = useState<ApiProduct[]>([]);
    const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0, per_page: 12 });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // query অবজেক্ট প্রতি রেন্ডারে নতুন হলেও যেন অযথা refetch না হয়
    const queryString = buildQueryString(query);
    const abortRef = useRef<AbortController | null>(null);

    const fetchData = useCallback(async () => {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "");
        if (!baseUrl) {
            setError("API Base URL is not defined in .env.local");
            setIsLoading(false);
            return;
        }

        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        try {
            setIsLoading(true);
            setError(null);

            const res = await fetch(`${baseUrl}${basePath}?${queryString}`, {
                headers: { Accept: "application/json" },
                signal: controller.signal,
            });
            if (!res.ok) throw new Error(`Failed to fetch products (HTTP ${res.status})`);

            const result: ProductsApiResponse = await res.json();
            setProducts(result.data ?? []);
            setMeta({
                current_page: result.meta?.current_page ?? 1,
                last_page: result.meta?.last_page ?? 1,
                total: result.meta?.total ?? 0,
                per_page: result.meta?.per_page ?? 12,
            });
        } catch (err) {
            if (controller.signal.aborted) return;
            setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            if (!controller.signal.aborted) setIsLoading(false);
        }
    }, [basePath, queryString]);

    useEffect(() => {
        fetchData();
        return () => abortRef.current?.abort();
    }, [fetchData]);

    return { products, meta, isLoading, error, refetch: fetchData };
}

// convenience wrappers — আগের নামগুলোই রাখলাম যাতে ইমপোর্ট কম বদলাতে হয়
export function useCategoryProducts(slug: string, query: ProductQuery = {}) {
    return useProducts(`/categories/${encodeURIComponent(slug)}/products`, query);
}

export function useBrandProducts(slug: string, query: ProductQuery = {}) {
    return useProducts(`/brands/${encodeURIComponent(slug)}/products`, query);
}