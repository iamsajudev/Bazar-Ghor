"use client";

import { useState, useEffect, useCallback } from "react";

export interface ApiBrand {
    id: number;
    name: string;
    slug: string;
    description?: string | null;
    is_active?: boolean;
    logo_media_id?: number | null;
    logo_url?: string | null;
    icon_url?: string | null;
    thumbnail_url?: string | null;
    banner_url?: string | null;
}

interface BrandsApiResponse {
    data?: ApiBrand[];
}

let brandsCache: ApiBrand[] | null = null;
let inflightRequest: Promise<ApiBrand[]> | null = null;

function resolveApiBase(): string {
    const raw =
        process.env.NEXT_PUBLIC_API_BASE_URL?.trim() ||
        process.env.NEXT_PUBLIC_API_URL?.trim() ||
        "https://ecommerce.goflixza.com/api/v1";
    const clean = raw.replace(/\/+$/, "");
    return clean.endsWith("/api/v1") ? clean : `${clean}/api/v1`;
}

async function fetchBrandsOnce(forceRefresh = false): Promise<ApiBrand[]> {
    if (!forceRefresh && brandsCache) return brandsCache;
    if (!forceRefresh && inflightRequest) return inflightRequest;

    const baseUrl = resolveApiBase();

    inflightRequest = fetch(`${baseUrl}/brands`, {
        headers: { Accept: "application/json" },
        cache: "no-store",
    })
        .then(async (res) => {
            if (!res.ok) {
                throw new Error(`Failed to fetch brands (HTTP ${res.status})`);
            }
            const result: BrandsApiResponse | ApiBrand[] = await res.json();
            const list = Array.isArray(result)
                ? result
                : Array.isArray(result?.data)
                ? result.data
                : [];
            brandsCache = list;
            return brandsCache;
        })
        .finally(() => {
            inflightRequest = null;
        });

    return inflightRequest;
}

export function useBrands() {
    const [brands, setBrands] = useState<ApiBrand[]>(brandsCache ?? []);
    const [isLoading, setIsLoading] = useState<boolean>(!brandsCache);
    const [error, setError] = useState<string | null>(null);

    const loadBrands = useCallback(async (forceRefresh = false) => {
        try {
            if (!brandsCache || forceRefresh) {
                setIsLoading(true);
            }
            setError(null);
            const data = await fetchBrandsOnce(forceRefresh);
            setBrands(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load brands");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadBrands(false);
    }, [loadBrands]);

    return {
        brands,
        isLoading,
        error,
        refetch: () => loadBrands(true),
    };
}