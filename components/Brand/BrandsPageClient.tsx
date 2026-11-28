// components/brands/BrandsPageClient.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
    ChevronRight,
    Search,
    Award,
    ArrowRight,
    Loader2,
    X,
} from "lucide-react";
import { ProductCard } from "@/components/Products/ProductCard";
import { buildApiUrl } from "@/lib/api-url";

const PLACEHOLDER_LOGO = "/images/logo-main.png";
const DIVIDE_BY_100 = true;

export interface BrandRecord {
    id: number | string;
    name: string;
    slug: string;
    description?: string | null;
    logo_url?: string | null;
    thumbnail_url?: string | null;
    icon_url?: string | null;
}

interface RawBrandProduct {
    id: number | string;
    name?: string;
    title?: string;
    slug: string;
    price_minor?: number;
    compare_at_price_minor?: number | null;
    sale_price_minor?: number | null;
    regular_price_minor?: number | null;
    thumbnail_url?: string | null;
    image_url?: string | null;
    primary_image?: { url?: string | null } | null;
    variants?: Array<{
        regular_price_minor?: number;
        sale_price_minor?: number | null;
        effective_price_minor?: number;
        price_minor?: number;
        compare_at_price_minor?: number | null;
    }>;
}

interface MappedProduct {
    id: number | string;
    title: string;
    slug: string;
    price: number;
    originalPrice?: number;
    image: string;
}

interface BrandsPageClientProps {
    initialBrands: BrandRecord[];
}

function getBrandLogo(brand: BrandRecord): string {
    return (
        brand.logo_url?.trim() ||
        brand.thumbnail_url?.trim() ||
        brand.icon_url?.trim() ||
        PLACEHOLDER_LOGO
    );
}

function toMajorAmount(minor?: number | null): number {
    if (typeof minor !== "number" || Number.isNaN(minor)) return 0;
    return DIVIDE_BY_100 ? Number((minor / 100).toFixed(2)) : minor;
}

function mapProduct(raw: RawBrandProduct): MappedProduct | null {
    if (!raw || !raw.slug) return null;
    const title = (raw.name || raw.title || "").trim();
    if (!title) return null;

    const variant = raw.variants?.[0];
    const rawEffective =
        variant?.effective_price_minor ??
        variant?.sale_price_minor ??
        raw.sale_price_minor ??
        raw.price_minor ??
        variant?.regular_price_minor ??
        raw.regular_price_minor ??
        0;

    const rawOriginal =
        variant?.compare_at_price_minor ??
        raw.compare_at_price_minor ??
        variant?.regular_price_minor ??
        raw.regular_price_minor ??
        null;

    const price = toMajorAmount(rawEffective);
    const originalPrice =
        typeof rawOriginal === "number" && rawOriginal > rawEffective
            ? toMajorAmount(rawOriginal)
            : undefined;

    const image =
        raw.primary_image?.url?.trim() ||
        raw.thumbnail_url?.trim() ||
        raw.image_url?.trim() ||
        "/images/product-not-found.webp";

    return {
        id: raw.id,
        title,
        slug: raw.slug,
        price,
        originalPrice,
        image,
    };
}

export default function BrandsPageClient({ initialBrands }: BrandsPageClientProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
    const [products, setProducts] = useState<MappedProduct[]>([]);
    const [productsLoading, setProductsLoading] = useState(false);

    const filteredBrands = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return initialBrands;
        return initialBrands.filter(
            (b) =>
                b.name.toLowerCase().includes(q) ||
                b.slug.toLowerCase().includes(q) ||
                (b.description && b.description.toLowerCase().includes(q))
        );
    }, [initialBrands, searchQuery]);

    const selectedBrand = useMemo(
        () => initialBrands.find((b) => b.slug === selectedSlug) || null,
        [initialBrands, selectedSlug]
    );

    useEffect(() => {
        if (!selectedSlug) {
            setProducts([]);
            return;
        }

        const controller = new AbortController();
        setProductsLoading(true);
        setProducts([]);

        const url = buildApiUrl(
            `/api/v1/brands/${encodeURIComponent(selectedSlug)}/products?per_page=20&page=1&sort=newest`
        );

        fetch(url, {
            method: "GET",
            headers: { Accept: "application/json" },
            cache: "no-store",
            signal: controller.signal,
        })
            .then(async (res) => {
                if (!res.ok) throw new Error("Failed");
                return res.json();
            })
            .then((json) => {
                const list: RawBrandProduct[] = Array.isArray(json?.data)
                    ? json.data
                    : Array.isArray(json?.data?.data)
                        ? json.data.data
                        : [];
                const mapped = list
                    .map(mapProduct)
                    .filter((item): item is MappedProduct => Boolean(item));
                setProducts(mapped);
            })
            .catch(() => {
                if (!controller.signal.aborted) {
                    setProducts([]);
                }
            })
            .finally(() => {
                if (!controller.signal.aborted) {
                    setProductsLoading(false);
                }
            });

        return () => controller.abort();
    }, [selectedSlug]);

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                <Link href="/" className="hover:text-green-600 transition-colors">
                    Home
                </Link>
                <ChevronRight className="h-4 w-4" />
                <span className="text-gray-800 dark:text-gray-200 font-medium">
                    Brands
                </span>
            </nav>

            {/* Header Banner */}
            <div className="relative bg-gradient-to-r from-emerald-800 via-green-700 to-emerald-900 rounded-3xl p-8 md:p-12 mb-8 overflow-hidden text-white shadow-md">
                <div className="absolute -right-16 -top-16 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center shrink-0">
                            <Award className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-extrabold mb-1">
                                All Brands
                            </h1>
                            <p className="text-white/90 text-sm md:text-base">
                                Browse all partner brands and discover their collections.
                            </p>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="relative w-full md:w-72">
                        <Search className="h-4 w-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search brand..."
                            className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-white text-gray-900 placeholder:text-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 shadow-sm"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => setSearchQuery("")}
                                aria-label="Clear search"
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Brands Grid */}
            {filteredBrands.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-5 mb-12">
                    {filteredBrands.map((brand) => {
                        const isSelected = selectedSlug === brand.slug;
                        const logoUrl = getBrandLogo(brand);

                        return (
                            <div
                                key={brand.id}
                                className={`group bg-white dark:bg-gray-900 rounded-2xl border p-4 flex flex-col items-center justify-between transition-all ${
                                    isSelected
                                        ? "border-green-600 ring-2 ring-green-500/20 shadow-md"
                                        : "border-gray-100 dark:border-gray-800 hover:border-green-500/50 hover:shadow-md"
                                }`}
                            >
                                <button
                                    type="button"
                                    onClick={() =>
                                        setSelectedSlug(isSelected ? null : brand.slug)
                                    }
                                    title={brand.name}
                                    className="w-full h-24 flex items-center justify-center p-2 cursor-pointer"
                                >
                                    <img
                                        src={logoUrl}
                                        alt={brand.name}
                                        className="max-w-full max-h-full object-contain grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-300 opacity-80 group-hover:opacity-100"
                                        onError={(e) => {
                                            const img = e.currentTarget;
                                            if (img.dataset.fallbackApplied) return;
                                            img.dataset.fallbackApplied = "true";
                                            img.src = PLACEHOLDER_LOGO;
                                        }}
                                    />
                                </button>

                                <div className="w-full pt-3 mt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-2 text-xs">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setSelectedSlug(
                                                isSelected ? null : brand.slug
                                            )
                                        }
                                        className="font-semibold text-gray-800 dark:text-gray-200 hover:text-green-600 truncate cursor-pointer text-left"
                                    >
                                        {brand.name}
                                    </button>

                                    <Link
                                        href={`/brand/${brand.slug}`}
                                        className="inline-flex items-center gap-0.5 text-green-600 hover:text-green-700 font-semibold shrink-0"
                                    >
                                        <span>View</span>
                                        <ArrowRight className="h-3.5 w-3.5" />
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-12 text-center mb-12">
                    <p className="text-sm text-gray-500">
                        No brands found matching &ldquo;{searchQuery}&rdquo;.
                    </p>
                </div>
            )}

            {/* Selected Brand Products Preview */}
            {selectedBrand && (
                <section className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 md:p-8 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100 dark:border-gray-800">
                        <div>
                            <span className="text-xs font-bold uppercase tracking-wider text-green-600">
                                Brand Products
                            </span>
                            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mt-0.5">
                                {selectedBrand.name}
                            </h2>
                        </div>

                        <div className="flex items-center gap-3">
                            <Link
                                href={`/brand/${selectedBrand.slug}`}
                                className="inline-flex items-center gap-1.5 text-sm font-semibold text-green-600 hover:text-green-700"
                            >
                                <span>Open Brand Page</span>
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                            <button
                                type="button"
                                onClick={() => setSelectedSlug(null)}
                                aria-label="Close products"
                                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    {productsLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-6 w-6 animate-spin text-green-600" />
                        </div>
                    ) : products.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                            {products.map((prod) => (
                                <ProductCard
                                    key={prod.id}
                                    id={Number(prod.id) || 0}
                                    title={prod.title}
                                    price={prod.price}
                                    originalPrice={prod.originalPrice}
                                    image={prod.image}
                                    slug={prod.slug}
                                />
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 py-10 text-center">
                            No products available for {selectedBrand.name} right now.
                        </p>
                    )}
                </section>
            )}
        </div>
    );
}