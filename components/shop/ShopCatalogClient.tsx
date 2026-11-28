// components/shop/ShopCatalogClient.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
    ChevronRight,
    Search,
    SlidersHorizontal,
    Grid,
    List,
    ChevronDown,
    ChevronLeft,
    Loader2,
    X,
    RotateCcw,
} from "lucide-react";
import { ProductCard } from "@/components/Products/ProductCard";
import { buildApiUrl } from "@/lib/api-url";
import {
    normalizeShopProduct,
    type ShopCategoryItem,
    type ShopBrandItem,
    type ShopAttributeItem,
    type RawShopProduct,
    type NormalizedShopProduct,
    type ShopPaginationMeta,
} from "@/types/shop";


const DIVIDE_BY_100 = true;

function toMinorInput(majorValue: string): string {
    const num = Number(majorValue);
    if (!majorValue.trim() || Number.isNaN(num) || num < 0) return "";
    return String(DIVIDE_BY_100 ? Math.round(num * 100) : Math.round(num));
}

export default function ShopCatalogClient() {
    const searchParams = useSearchParams();

    const [categories, setCategories] = useState<ShopCategoryItem[]>([]);
    const [brands, setBrands] = useState<ShopBrandItem[]>([]);
    const [attributes, setAttributes] = useState<ShopAttributeItem[]>([]);

    // Filter states initialized from URL query if present
    const [searchInput, setSearchInput] = useState(
        () => searchParams.get("search") || ""
    );
    const [selectedCategory, setSelectedCategory] = useState(
        () => searchParams.get("category") || ""
    );
    const [selectedBrand, setSelectedBrand] = useState(
        () => searchParams.get("brand") || ""
    );
    const [minPriceInput, setMinPriceInput] = useState(
        () => searchParams.get("min_price") || ""
    );
    const [maxPriceInput, setMaxPriceInput] = useState(
        () => searchParams.get("max_price") || ""
    );
    const [inStockOnly, setInStockOnly] = useState(
        () => searchParams.get("in_stock") === "true"
    );
    const [sortBy, setSortBy] = useState(
        () => searchParams.get("sort") || "newest"
    );
    const [page, setPage] = useState(
        () => Number(searchParams.get("page")) || 1
    );
    const [perPage, setPerPage] = useState(20);

    // Applied filter snapshot for API fetch
    const [applied, setApplied] = useState({
        search: searchParams.get("search") || "",
        category: searchParams.get("category") || "",
        brand: searchParams.get("brand") || "",
        minPrice: searchParams.get("min_price") || "",
        maxPrice: searchParams.get("max_price") || "",
        inStock: searchParams.get("in_stock") === "true",
    });

    const [view, setView] = useState<"grid" | "list">("grid");
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

    const [products, setProducts] = useState<NormalizedShopProduct[]>([]);
    const [meta, setMeta] = useState<ShopPaginationMeta>({
        current_page: 1,
        last_page: 1,
        per_page: 20,
        total: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load Categories, Brands, and Attributes
    useEffect(() => {
        const controller = new AbortController();

        async function loadFacets() {
            try {
                const [catRes, brandRes, attrRes] = await Promise.all([
                    fetch(buildApiUrl("/api/v1/categories"), {
                        headers: { Accept: "application/json" },
                        next: { revalidate: 3600 },
                        signal: controller.signal,
                    }).catch(() => null),
                    fetch(buildApiUrl("/api/v1/brands"), {
                        headers: { Accept: "application/json" },
                        next: { revalidate: 3600 },
                        signal: controller.signal,
                    }).catch(() => null),
                    fetch(buildApiUrl("/api/v1/attributes"), {
                        headers: { Accept: "application/json" },
                        cache: "no-store",
                        signal: controller.signal,
                    }).catch(() => null),
                ]);

                if (catRes?.ok) {
                    const catJson = await catRes.json();
                    const list = Array.isArray(catJson?.data) ? catJson.data : [];
                    if (!controller.signal.aborted) setCategories(list);
                }

                if (brandRes?.ok) {
                    const brandJson = await brandRes.json();
                    const list = Array.isArray(brandJson?.data) ? brandJson.data : [];
                    if (!controller.signal.aborted) setBrands(list);
                }

                if (attrRes?.ok) {
                    const attrJson = await attrRes.json();
                    const list = Array.isArray(attrJson?.data) ? attrJson.data : [];
                    if (!controller.signal.aborted) setAttributes(list);
                }
            } catch {
                // Ignore facet load error
            }
        }

        loadFacets();
        return () => controller.abort();
    }, []);

    // Fetch Products from /api/v1/products
    useEffect(() => {
        const controller = new AbortController();
        let active = true;

        async function fetchProducts() {
            setLoading(true);
            setError(null);

            try {
                const params = new URLSearchParams();
                params.set("page", String(page));
                params.set("per_page", String(Math.min(50, Math.max(1, perPage))));
                params.set("sort", sortBy);

                if (applied.search.trim()) params.set("search", applied.search.trim());
                if (applied.category) params.set("category", applied.category);
                if (applied.brand) params.set("brand", applied.brand);

                const minMinor = toMinorInput(applied.minPrice);
                const maxMinor = toMinorInput(applied.maxPrice);
                if (minMinor) params.set("min_price", minMinor);
                if (maxMinor) params.set("max_price", maxMinor);
                if (applied.inStock) params.set("in_stock", "true");

                const res = await fetch(
                    buildApiUrl(`/api/v1/products?${params.toString()}`),
                    {
                        method: "GET",
                        headers: { Accept: "application/json" },
                        cache: "no-store",
                        signal: controller.signal,
                    }
                );

                const json = await res.json().catch(() => null);
                if (!res.ok) {
                    throw new Error(
                        json?.message || `Failed to load products (${res.status}).`
                    );
                }

                const rawList: RawShopProduct[] = Array.isArray(json?.data)
                    ? json.data
                    : Array.isArray(json?.data?.data)
                        ? json.data.data
                        : [];

                const mapped = rawList
                    .map(normalizeShopProduct)
                    .filter((item): item is NormalizedShopProduct => Boolean(item));

                const responseMeta = json?.meta || json?.data || {};

                if (active && !controller.signal.aborted) {
                    setProducts(mapped);
                    setMeta({
                        current_page: Number(responseMeta.current_page) || page,
                        last_page: Number(responseMeta.last_page) || 1,
                        per_page: Number(responseMeta.per_page) || perPage,
                        total: Number(responseMeta.total) ?? mapped.length,
                    });
                }
            } catch (err) {
                if (active && !controller.signal.aborted) {
                    setProducts([]);
                    setError(
                        err instanceof Error
                            ? err.message
                            : "Unable to load products right now."
                    );
                }
            } finally {
                if (active && !controller.signal.aborted) {
                    setLoading(false);
                }
            }
        }

        fetchProducts();
        return () => {
            active = false;
            controller.abort();
        };
    }, [applied, sortBy, page, perPage]);

    const handleApplyFilters = useCallback(
        (e?: React.FormEvent) => {
            if (e) e.preventDefault();
            setPage(1);
            setApplied({
                search: searchInput,
                category: selectedCategory,
                brand: selectedBrand,
                minPrice: minPriceInput,
                maxPrice: maxPriceInput,
                inStock: inStockOnly,
            });
            setMobileFiltersOpen(false);
        },
        [
            searchInput,
            selectedCategory,
            selectedBrand,
            minPriceInput,
            maxPriceInput,
            inStockOnly,
        ]
    );

    const handleResetAll = useCallback(() => {
        setSearchInput("");
        setSelectedCategory("");
        setSelectedBrand("");
        setMinPriceInput("");
        setMaxPriceInput("");
        setInStockOnly(false);
        setSortBy("newest");
        setPage(1);
        setApplied({
            search: "",
            category: "",
            brand: "",
            minPrice: "",
            maxPrice: "",
            inStock: false,
        });
    }, []);

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                <Link href="/" className="hover:text-emerald-600 transition-colors">
                    Home
                </Link>
                <ChevronRight className="h-4 w-4" />
                <span className="text-gray-800 dark:text-gray-200 font-medium">
                    Shop
                </span>
            </nav>

            {/* Top Header & Search Bar */}
            <div className="bg-gradient-to-r from-emerald-900 via-green-800 to-emerald-950 rounded-3xl p-6 sm:p-8 md:p-10 mb-8 text-white shadow-sm">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                            Store Catalog
                        </span>
                        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-1">
                            Shop All Products
                        </h1>
                        <p className="text-sm text-emerald-100/85 mt-1">
                            Filter by category, brand, availability, and price range.
                        </p>
                    </div>

                    <form
                        onSubmit={handleApplyFilters}
                        className="flex items-center gap-2 w-full lg:w-auto lg:min-w-[360px]"
                    >
                        <div className="relative flex-1">
                            <Search className="h-4 w-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                                type="text"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                placeholder="Search products..."
                                className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-white text-gray-900 placeholder:text-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                            />
                            {searchInput && (
                                <button
                                    type="button"
                                    onClick={() => setSearchInput("")}
                                    aria-label="Clear search"
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                        <button
                            type="submit"
                            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-colors shrink-0 cursor-pointer"
                        >
                            Search
                        </button>
                    </form>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar Filters */}
                <aside
                    className={`lg:col-span-1 ${mobileFiltersOpen ? "block" : "hidden lg:block"
                        }`}
                >
                    <form
                        onSubmit={handleApplyFilters}
                        className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 sticky top-28 space-y-6 shadow-2xs"
                    >
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                                Filters
                            </h2>
                            <button
                                type="button"
                                onClick={handleResetAll}
                                className="inline-flex items-center gap-1 text-xs font-semibold text-red-500 hover:underline cursor-pointer"
                            >
                                <RotateCcw className="h-3 w-3" />
                                <span>Reset</span>
                            </button>
                        </div>

                        {/* Category Filter */}
                        {categories.length > 0 && (
                            <div className="pb-5 border-b border-gray-100 dark:border-gray-800">
                                <label
                                    htmlFor="shop-category"
                                    className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-2"
                                >
                                    Category
                                </label>
                                <select
                                    id="shop-category"
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                                >
                                    <option value="">All Categories</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.slug}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Brand Filter */}
                        {brands.length > 0 && (
                            <div className="pb-5 border-b border-gray-100 dark:border-gray-800">
                                <label
                                    htmlFor="shop-brand"
                                    className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-2"
                                >
                                    Brand
                                </label>
                                <select
                                    id="shop-brand"
                                    value={selectedBrand}
                                    onChange={(e) => setSelectedBrand(e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                                >
                                    <option value="">All Brands</option>
                                    {brands.map((brand) => (
                                        <option key={brand.id} value={brand.slug}>
                                            {brand.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Price Range */}
                        <div className="pb-5 border-b border-gray-100 dark:border-gray-800">
                            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-2.5">
                                Price Range
                            </h3>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    min={0}
                                    step="any"
                                    value={minPriceInput}
                                    onChange={(e) => setMinPriceInput(e.target.value)}
                                    placeholder="Min"
                                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-transparent"
                                />
                                <span className="text-gray-400">-</span>
                                <input
                                    type="number"
                                    min={0}
                                    step="any"
                                    value={maxPriceInput}
                                    onChange={(e) => setMaxPriceInput(e.target.value)}
                                    placeholder="Max"
                                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-transparent"
                                />
                            </div>
                        </div>

                        {/* Availability */}
                        <div className="pb-5 border-b border-gray-100 dark:border-gray-800">
                            <label className="flex items-center gap-2.5 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={inStockOnly}
                                    onChange={(e) => setInStockOnly(e.target.checked)}
                                    className="h-4 w-4 rounded accent-emerald-600 cursor-pointer"
                                />
                                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    In Stock Only
                                </span>
                            </label>
                        </div>

                        {/* Attributes Preview (from /api/v1/attributes) */}
                        {attributes.length > 0 && (
                            <div className="space-y-3">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                                    Attributes
                                </h3>
                                {attributes.slice(0, 3).map((attr) => {
                                    const vals = Array.isArray(attr.values) ? attr.values : [];
                                    return (
                                        <div key={attr.id}>
                                            <p className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                                                {attr.name}
                                            </p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {vals.slice(0, 6).map((v, i) => {
                                                    const label =
                                                        typeof v === "string"
                                                            ? v
                                                            : v.name || v.value || String(v.id ?? i);
                                                    return (
                                                        <span
                                                            key={`${attr.id}-${label}-${i}`}
                                                            className="px-2 py-0.5 rounded-md text-[11px] bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
                                                        >
                                                            {label}
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold transition-colors cursor-pointer"
                        >
                            Apply Filters
                        </button>
                    </form>
                </aside>

                {/* Product Section */}
                <div className="lg:col-span-3">
                    {/* Toolbar */}
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => setMobileFiltersOpen((prev) => !prev)}
                                className="lg:hidden inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold cursor-pointer"
                            >
                                <SlidersHorizontal className="h-4 w-4" />
                                <span>Filters</span>
                            </button>

                            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
                                <button
                                    type="button"
                                    onClick={() => setView("grid")}
                                    aria-label="Grid view"
                                    className={`p-2 rounded-lg transition-colors cursor-pointer ${view === "grid"
                                            ? "bg-white dark:bg-gray-700 shadow-2xs"
                                            : ""
                                        }`}
                                >
                                    <Grid className="h-4 w-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setView("list")}
                                    aria-label="List view"
                                    className={`p-2 rounded-lg transition-colors cursor-pointer ${view === "list"
                                            ? "bg-white dark:bg-gray-700 shadow-2xs"
                                            : ""
                                        }`}
                                >
                                    <List className="h-4 w-4" />
                                </button>
                            </div>

                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                <span className="font-bold text-gray-900 dark:text-white">
                                    {meta.total}
                                </span>{" "}
                                products found
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500 hidden sm:block">
                                    Sort by:
                                </span>
                                <div className="relative">
                                    <select
                                        value={sortBy}
                                        onChange={(e) => {
                                            setSortBy(e.target.value);
                                            setPage(1);
                                        }}
                                        className="appearance-none pl-3 pr-8 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                                    >
                                        <option value="newest">Newest</option>
                                        <option value="price_asc">Price: Low to High</option>
                                        <option value="price_desc">Price: High to Low</option>
                                        <option value="name_asc">Name: A to Z</option>
                                        <option value="name_desc">Name: Z to A</option>
                                    </select>
                                    <ChevronDown className="h-4 w-4 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                </div>
                            </div>

                            <select
                                aria-label="Items per page"
                                value={perPage}
                                onChange={(e) => {
                                    setPerPage(Number(e.target.value));
                                    setPage(1);
                                }}
                                className="px-2.5 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-semibold bg-white dark:bg-gray-900 cursor-pointer"
                            >
                                <option value={12}>12 / page</option>
                                <option value={20}>20 / page</option>
                                <option value={36}>36 / page</option>
                                <option value={50}>50 / page</option>
                            </select>
                        </div>
                    </div>

                    {/* States */}
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="h-7 w-7 animate-spin text-emerald-600" />
                        </div>
                    ) : error ? (
                        <div
                            role="alert"
                            className="rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 p-6 text-sm text-red-700 dark:text-red-300"
                        >
                            {error}
                        </div>
                    ) : products.length > 0 ? (
                        <>
                            <div
                                className={`grid gap-4 md:gap-6 ${view === "grid"
                                        ? "grid-cols-2 md:grid-cols-3"
                                        : "grid-cols-1"
                                    }`}
                            >
                                {products.map((product) => (
                                    <ProductCard
                                        key={`${product.slug}-${product.id}`}
                                        id={product.id}
                                        title={product.title}
                                        price={product.price}
                                        originalPrice={product.originalPrice}
                                        image={product.image}
                                        slug={product.slug}
                                    />
                                ))}
                            </div>

                            {/* Pagination */}
                            {meta.last_page > 1 && (
                                <div className="mt-10 flex items-center justify-center gap-3">
                                    <button
                                        type="button"
                                        disabled={meta.current_page <= 1}
                                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                                        className="inline-flex items-center gap-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                        <span>Previous</span>
                                    </button>

                                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 px-2">
                                        Page {meta.current_page} of {meta.last_page}
                                    </span>

                                    <button
                                        type="button"
                                        disabled={meta.current_page >= meta.last_page}
                                        onClick={() =>
                                            setPage((p) => Math.min(meta.last_page, p + 1))
                                        }
                                        className="inline-flex items-center gap-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                                    >
                                        <span>Next</span>
                                        <ChevronRight className="h-4 w-4" />
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
                            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                                No products found
                            </h2>
                            <p className="text-sm text-gray-500 mb-6">
                                Try adjusting your search or filter criteria.
                            </p>
                            <button
                                type="button"
                                onClick={handleResetAll}
                                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-colors cursor-pointer"
                            >
                                Clear All Filters
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}