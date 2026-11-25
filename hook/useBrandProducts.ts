"use client";

import { useState, useEffect } from "react";
import type { ProductSort, ApiProduct } from "@/hook/useCategoryProducts";

export interface UseBrandProductsOptions {
    minPriceTaka?: number;
    maxPriceTaka?: number;
    sort?: ProductSort | "";
    page?: number;
    perPage?: number;
    search?: string;
    inStock?: boolean;
}

export interface PaginationMeta {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface BrandProductsApiResponse {
    data?: ApiProduct[];
    meta?: Partial<PaginationMeta>;
}

function resolveApiBase(): string {
    const raw =
        process.env.NEXT_PUBLIC_API_BASE_URL?.trim() ||
        process.env.NEXT_PUBLIC_API_URL?.trim() ||
        "https://ecommerce.goflixza.com/api/v1";
    const clean = raw.replace(/\/+$/, "");
    return clean.endsWith("/api/v1") ? clean : `${clean}/api/v1`;
}

export function useBrandProducts(
    slug: string,
    options: UseBrandProductsOptions = {}
) {
    const {
        minPriceTaka,
        maxPriceTaka,
        sort,
        page = 1,
        perPage = 12,
        search,
        inStock,
    } = options;

    const [products, setProducts] = useState<ApiProduct[]>([]);
    const [meta, setMeta] = useState<PaginationMeta>({
        current_page: page,
        last_page: 1,
        per_page: perPage,
        total: 0,
    });
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!slug) return;

        const controller = new AbortController();
        const baseUrl = resolveApiBase();

        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("per_page", String(Math.min(Math.max(perPage, 1), 50)));

        if (search && search.trim()) {
            params.set("search", search.trim());
        }
        if (typeof minPriceTaka === "number" && minPriceTaka > 0) {
            params.set("min_price", String(Math.round(minPriceTaka * 100)));
        }
        if (typeof maxPriceTaka === "number" && maxPriceTaka > 0) {
            params.set("max_price", String(Math.round(maxPriceTaka * 100)));
        }
        if (inStock) {
            params.set("in_stock", "1");
        }
        if (sort) {
            params.set("sort", sort);
        }

        async function run() {
            try {
                setIsLoading(true);
                setError(null);

                const res = await fetch(
                    `${baseUrl}/brands/${encodeURIComponent(slug)}/products?${params.toString()}`,
                    {
                        headers: { Accept: "application/json" },
                        signal: controller.signal,
                        cache: "no-store",
                    }
                );

                if (!res.ok) {
                    throw new Error(`Failed to fetch brand products (HTTP ${res.status})`);
                }

                const json: BrandProductsApiResponse = await res.json();
                const items = Array.isArray(json?.data) ? json.data : [];

                setProducts(items);
                setMeta({
                    current_page: json?.meta?.current_page ?? page,
                    last_page: json?.meta?.last_page ?? 1,
                    per_page: json?.meta?.per_page ?? perPage,
                    total: typeof json?.meta?.total === "number" ? json.meta.total : items.length,
                });
            } catch (err) {
                if (controller.signal.aborted) return;
                setError(
                    err instanceof Error ? err.message : "Failed to load brand products"
                );
            } finally {
                if (!controller.signal.aborted) {
                    setIsLoading(false);
                }
            }
        }

        run();
        return () => controller.abort();
    }, [slug, minPriceTaka, maxPriceTaka, sort, page, perPage, search, inStock]);

    return {
        products,
        total: meta.total,
        meta,
        isLoading,
        error,
    };
}