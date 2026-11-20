"use client";

import { useState, useEffect } from "react";
import { ApiProduct } from "@/hook/useCategoryProducts";

interface ProductsApiResponse {
    data: ApiProduct[];
    meta: { current_page: number; last_page: number; total: number };
}

export function useBrandProducts(slug: string) {
    const [products, setProducts] = useState<ApiProduct[]>([]);
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!slug) return;
        const controller = new AbortController();

        const fetchProducts = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "");
                if (!baseUrl) throw new Error("API Base URL is not defined in .env.local");

                const res = await fetch(
                    `${baseUrl}/brands/${encodeURIComponent(slug)}/products`,
                    { headers: { Accept: "application/json" }, signal: controller.signal }
                );
                if (!res.ok) throw new Error(`Failed to fetch products (HTTP ${res.status})`);

                const result: ProductsApiResponse = await res.json();
                setProducts(result.data ?? []);
                setTotal(result.meta?.total ?? 0);
            } catch (err) {
                if (controller.signal.aborted) return;
                setError(err instanceof Error ? err.message : "Something went wrong");
            } finally {
                if (!controller.signal.aborted) setIsLoading(false);
            }
        };

        fetchProducts();
        return () => controller.abort();
    }, [slug]);

    return { products, total, isLoading, error };
}