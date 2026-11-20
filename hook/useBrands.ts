"use client";

import { useState, useEffect } from "react";

export interface ApiBrand {
    id: number;
    name: string;
    slug: string;
    logo_media_id: number | null;
    logo_url: string | null;
    icon_url: string | null;
    thumbnail_url: string | null;
    banner_url: string | null;
}

interface BrandsApiResponse {
    data: ApiBrand[];
}

// ✅ মডিউল-লেভেল ক্যাশ — যত কম্পোনেন্ট ব্যবহার করুক, একটাই রিকোয়েস্ট
let brandsCache: ApiBrand[] | null = null;
let inflightRequest: Promise<ApiBrand[]> | null = null;

async function fetchBrandsOnce(): Promise<ApiBrand[]> {
    if (brandsCache) return brandsCache;
    if (inflightRequest) return inflightRequest;

    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "");
    if (!baseUrl) throw new Error("API Base URL is not defined in .env.local");

    inflightRequest = fetch(`${baseUrl}/brands`, {
        headers: { Accept: "application/json" },
    })
        .then(async (res) => {
            if (!res.ok) throw new Error(`Failed to fetch brands (HTTP ${res.status})`);
            const result: BrandsApiResponse = await res.json();
            brandsCache = result.data ?? [];
            return brandsCache;
        })
        .finally(() => {
            inflightRequest = null;
        });

    return inflightRequest;
}

export function useBrands() {
    const [brands, setBrands] = useState<ApiBrand[]>(brandsCache ?? []);
    const [isLoading, setIsLoading] = useState(!brandsCache);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        fetchBrandsOnce()
            .then((data) => {
                if (cancelled) return;
                setBrands(data);
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

    return { brands, isLoading, error };
}