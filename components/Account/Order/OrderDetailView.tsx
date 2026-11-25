"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    Package,
    MapPin,
    CreditCard,
    Calendar,
    Copy,
    Check,
    Printer,
    Phone,
    Mail,
    ShoppingBag,
    AlertCircle,
    RefreshCw,
} from "lucide-react";

export interface OrderMediaObject {
    url?: string | null;
    src?: string | null;
    path?: string | null;
    thumbnail_url?: string | null;
    image_url?: string | null;
}

export interface RawOrderItem {
    id?: number | string;
    order_id?: number | string;
    product_id?: number | string;
    name?: string | null;
    title?: string | null;
    product_name?: string | null;
    slug?: string | null;
    product_slug?: string | null;
    sku?: string | null;
    variant?: string | null;
    variant_name?: string | null;
    options?: string | Record<string, string> | null;
    quantity?: number | string | null;
    qty?: number | string | null;
    price?: number | string | null;
    unit_price?: number | string | null;
    unit_price_minor?: number | string | null;
    total?: number | string | null;
    subtotal?: number | string | null;
    line_total?: number | string | null;
    line_total_minor?: number | string | null;
    discount_minor?: number | string | null;
    tax_minor?: number | string | null;
    image?: string | OrderMediaObject | null;
    thumbnail?: string | OrderMediaObject | null;
    product?: {
        name?: string | null;
        slug?: string | null;
        image?: string | OrderMediaObject | null;
        thumbnail?: string | OrderMediaObject | null;
    } | null;
}

export interface RawShippingAddress {
    id?: number | string;
    order_id?: number | string;
    type?: string | null;
    full_name?: string | null;
    name?: string | null;
    recipient_name?: string | null;
    phone?: string | null;
    mobile?: string | null;
    email?: string | null;
    address?: string | null;
    address_line_1?: string | null;
    line1?: string | null;
    line2?: string | null;
    street?: string | null;
    city?: string | null;
    state?: string | null;
    region?: string | null;
    district?: string | null;
    area?: string | null;
    postal_code?: string | null;
    zip?: string | null;
    country?: string | null;
    country_code?: string | null;
}

export interface RawOrderRecord {
    id?: number | string;
    order_number?: string | null;
    order_code?: string | null;
    code?: string | null;
    invoice_number?: string | null;
    status?: string | null;
    order_status?: string | null;
    payment_status?: string | null;
    payment_method?: string | null;
    payment_gateway?: string | null;
    currency?: string | null;
    currency_code?: string | null;
    currency_symbol?: string | null;
    subtotal?: number | string | null;
    sub_total?: number | string | null;
    subtotal_minor?: number | string | null;
    shipping_cost?: number | string | null;
    shipping_fee?: number | string | null;
    shipping_minor?: number | string | null;
    delivery_charge?: number | string | null;
    discount?: number | string | null;
    discount_amount?: number | string | null;
    discount_minor?: number | string | null;
    coupon_discount?: number | string | null;
    tax?: number | string | null;
    tax_amount?: number | string | null;
    tax_minor?: number | string | null;
    total?: number | string | null;
    grand_total?: number | string | null;
    total_amount?: number | string | null;
    total_minor?: number | string | null;
    notes?: string | null;
    note?: string | null;
    created_at?: string | null;
    placed_at?: string | null;
    updated_at?: string | null;
    items?: RawOrderItem[] | null;
    order_items?: RawOrderItem[] | null;
    addresses?: RawShippingAddress[] | null;
    shipping_address?: RawShippingAddress | string | null;
    address?: RawShippingAddress | string | null;
    customer?: RawShippingAddress | null;
    user?: RawShippingAddress | null;
}

interface OrderApiResponse {
    data?: RawOrderRecord | { order?: RawOrderRecord };
    order?: RawOrderRecord;
    message?: string;
}

interface NormalizedLineItem {
    id: string;
    name: string;
    slug?: string;
    sku?: string;
    variant?: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
    imageUrl: string | null;
}

interface NormalizedShippingInfo {
    name?: string;
    phone?: string;
    email?: string;
    addressLines: string[];
}

interface NormalizedOrder {
    id: string;
    reference: string;
    status: string;
    paymentStatus?: string;
    paymentMethod?: string;
    createdAt?: string;
    subtotal: number;
    shipping: number;
    discount: number;
    tax: number;
    total: number;
    currencyLabel: string;
    notes?: string;
    items: NormalizedLineItem[];
    shippingInfo: NormalizedShippingInfo;
}

interface OrderDetailViewProps {
    orderIdentifier: string;
}

function safeDecode(value: string): string {
    try {
        return decodeURIComponent(value);
    } catch {
        return value;
    }
}

function toNumber(val: unknown, fallback = 0): number {
    if (typeof val === "number") {
        return Number.isFinite(val) ? val : fallback;
    }
    if (typeof val === "string") {
        const cleaned = val.replace(/[^0-9.-]+/g, "");
        const parsed = Number(cleaned);
        return Number.isFinite(parsed) ? parsed : fallback;
    }
    return fallback;
}

function resolveMediaUrl(value: unknown): string | null {
    if (typeof value === "string") {
        const trimmed = value.trim();
        return trimmed.length > 0 ? trimmed : null;
    }

    if (value && typeof value === "object") {
        const record = value as Record<string, unknown>;
        const candidate =
            record.url ??
            record.src ??
            record.path ??
            record.thumbnail_url ??
            record.image_url;

        if (typeof candidate === "string") {
            const trimmed = candidate.trim();
            return trimmed.length > 0 ? trimmed : null;
        }
    }

    return null;
}

function formatDateTime(dateStr?: string | null): string | undefined {
    if (!dateStr) return undefined;
    const parsed = new Date(dateStr);
    if (Number.isNaN(parsed.getTime())) return dateStr;
    return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(parsed);
}

function resolveCurrencyLabel(raw: RawOrderRecord): string {
    if (raw.currency_symbol?.trim()) return raw.currency_symbol.trim();
    const code = (raw.currency_code || raw.currency || "BDT").trim().toUpperCase();
    if (code === "BDT") return "৳";
    if (code === "USD") return "$";
    if (code === "EUR") return "€";
    if (code === "GBP") return "£";
    return code;
}

function formatMoney(amount: number, currencyLabel: string): string {
    const formatted = amount.toLocaleString("en-US", {
        minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
        maximumFractionDigits: 2,
    });
    return currencyLabel ? `${currencyLabel} ${formatted}` : formatted;
}

function resolveVariantLabel(
    options?: string | Record<string, string> | null,
    variant?: string | null,
    variantName?: string | null
): string | undefined {
    if (typeof variantName === "string" && variantName.trim()) {
        return variantName.trim();
    }
    if (typeof variant === "string" && variant.trim()) {
        return variant.trim();
    }
    if (typeof options === "string" && options.trim()) {
        return options.trim();
    }
    if (options && typeof options === "object") {
        const entries = Object.entries(options)
            .filter(([, v]) => Boolean(v))
            .map(([k, v]) => `${k}: ${v}`);
        if (entries.length > 0) return entries.join(", ");
    }
    return undefined;
}

function normalizeShipping(raw: RawOrderRecord): NormalizedShippingInfo {
    const arrayAddress =
        Array.isArray(raw.addresses) && raw.addresses.length > 0
            ? raw.addresses.find((a) => a.type?.toLowerCase() === "shipping") ||
            raw.addresses[0]
            : null;

    const sourceObj =
        arrayAddress ||
        (raw.shipping_address && typeof raw.shipping_address === "object"
            ? raw.shipping_address
            : null) ||
        (raw.address && typeof raw.address === "object" ? raw.address : null);

    const contactFallback = raw.customer || raw.user || null;

    const name =
        sourceObj?.recipient_name?.trim() ||
        sourceObj?.full_name?.trim() ||
        sourceObj?.name?.trim() ||
        contactFallback?.name?.trim() ||
        undefined;

    const phone =
        sourceObj?.phone?.trim() ||
        sourceObj?.mobile?.trim() ||
        contactFallback?.phone?.trim() ||
        undefined;

    const email =
        sourceObj?.email?.trim() || contactFallback?.email?.trim() || undefined;

    const addressLines: string[] = [];

    if (typeof raw.shipping_address === "string" && raw.shipping_address.trim()) {
        addressLines.push(raw.shipping_address.trim());
    } else if (typeof raw.address === "string" && raw.address.trim()) {
        addressLines.push(raw.address.trim());
    } else if (sourceObj) {
        const line1 =
            sourceObj.line1?.trim() ||
            sourceObj.address?.trim() ||
            sourceObj.address_line_1?.trim() ||
            sourceObj.street?.trim();
        if (line1) addressLines.push(line1);

        if (sourceObj.line2?.trim()) {
            addressLines.push(sourceObj.line2.trim());
        }

        const areaParts = [
            sourceObj.area?.trim(),
            sourceObj.city?.trim() || sourceObj.district?.trim(),
            sourceObj.region?.trim() || sourceObj.state?.trim(),
            sourceObj.postal_code?.trim() || sourceObj.zip?.trim(),
        ].filter(Boolean);

        const uniqueAreaParts = areaParts.filter(
            (val, index, arr) => index === 0 || val !== arr[index - 1]
        );

        if (uniqueAreaParts.length > 0) {
            addressLines.push(uniqueAreaParts.join(", "));
        }

        const country =
            sourceObj.country?.trim() || sourceObj.country_code?.trim();
        if (country) {
            addressLines.push(country);
        }
    }

    return { name, phone, email, addressLines };
}

function normalizeOrder(raw: RawOrderRecord, fallbackRef: string): NormalizedOrder {
    const rawItems = Array.isArray(raw.items)
        ? raw.items
        : Array.isArray(raw.order_items)
            ? raw.order_items
            : [];

    const items: NormalizedLineItem[] = rawItems.map((item, idx) => {
        const qty = Math.max(1, toNumber(item.quantity ?? item.qty, 1));
        const unitPrice = toNumber(
            item.unit_price_minor ?? item.unit_price ?? item.price,
            0
        );
        const explicitTotal =
            item.line_total_minor ?? item.line_total ?? item.total ?? item.subtotal;
        const lineTotal =
            explicitTotal !== undefined && explicitTotal !== null
                ? toNumber(explicitTotal, unitPrice * qty)
                : unitPrice * qty;

        const name =
            item.product_name?.trim() ||
            item.name?.trim() ||
            item.title?.trim() ||
            item.product?.name?.trim() ||
            `Item #${idx + 1}`;

        const slug =
            item.slug?.trim() ||
            item.product_slug?.trim() ||
            item.product?.slug?.trim() ||
            undefined;

        const imageUrl =
            resolveMediaUrl(item.image) ||
            resolveMediaUrl(item.thumbnail) ||
            resolveMediaUrl(item.product?.image) ||
            resolveMediaUrl(item.product?.thumbnail);

        return {
            id: String(item.id ?? item.product_id ?? `item-${idx}`),
            name,
            slug,
            sku: item.sku?.trim() || undefined,
            variant: resolveVariantLabel(
                item.options,
                item.variant,
                item.variant_name
            ),
            quantity: qty,
            unitPrice,
            lineTotal,
            imageUrl,
        };
    });

    const computedSubtotal = items.reduce((acc, cur) => acc + cur.lineTotal, 0);
    const rawSubtotal = raw.subtotal_minor ?? raw.subtotal ?? raw.sub_total;
    const subtotal =
        rawSubtotal !== undefined && rawSubtotal !== null
            ? toNumber(rawSubtotal, computedSubtotal)
            : computedSubtotal;

    const shipping = toNumber(
        raw.shipping_minor ??
        raw.shipping_cost ??
        raw.shipping_fee ??
        raw.delivery_charge,
        0
    );
    const discount = toNumber(
        raw.discount_minor ??
        raw.discount ??
        raw.discount_amount ??
        raw.coupon_discount,
        0
    );
    const tax = toNumber(raw.tax_minor ?? raw.tax ?? raw.tax_amount, 0);

    const rawTotal =
        raw.total_minor ?? raw.grand_total ?? raw.total ?? raw.total_amount;
    const total =
        rawTotal !== undefined && rawTotal !== null
            ? toNumber(rawTotal, subtotal + shipping + tax - discount)
            : subtotal + shipping + tax - discount;

    const reference =
        raw.order_number?.trim() ||
        raw.order_code?.trim() ||
        raw.invoice_number?.trim() ||
        raw.code?.trim() ||
        (raw.id !== undefined ? String(raw.id) : fallbackRef);

    const status = raw.status?.trim() || raw.order_status?.trim() || "Placed";
    const currencyLabel = resolveCurrencyLabel(raw);

    return {
        id: String(raw.id ?? reference),
        reference,
        status,
        paymentStatus: raw.payment_status?.trim() || undefined,
        paymentMethod:
            raw.payment_method?.trim() || raw.payment_gateway?.trim() || undefined,
        createdAt: formatDateTime(raw.created_at ?? raw.placed_at),
        subtotal,
        shipping,
        discount,
        tax,
        total,
        currencyLabel,
        notes: raw.notes?.trim() || raw.note?.trim() || undefined,
        items,
        shippingInfo: normalizeShipping(raw),
    };
}

function getStatusBadgeClass(status: string): string {
    const normalized = status.toLowerCase();
    if (
        normalized.includes("deliver") ||
        normalized.includes("complet") ||
        normalized.includes("paid") ||
        normalized.includes("success")
    ) {
        return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/50";
    }
    if (
        normalized.includes("cancel") ||
        normalized.includes("fail") ||
        normalized.includes("refund") ||
        normalized.includes("reject")
    ) {
        return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/50";
    }
    if (
        normalized.includes("ship") ||
        normalized.includes("process") ||
        normalized.includes("confirm") ||
        normalized.includes("pack")
    ) {
        return "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800/50";
    }
    return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/50";
}

function OrderLineItemThumb({
    src,
    alt,
}: {
    src: string | null;
    alt: string;
}) {
    const [failed, setFailed] = useState(false);

    if (!src || failed) {
        return (
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gray-100 dark:bg-gray-800 border border-gray-200/70 dark:border-gray-700 flex items-center justify-center shrink-0 text-gray-400">
                <Package className="w-6 h-6" />
            </div>
        );
    }

    return (
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200/70 dark:border-gray-700 overflow-hidden shrink-0">
            <img
                src={src}
                alt={alt}
                onError={() => setFailed(true)}
                className="w-full h-full object-cover"
            />
        </div>
    );
}

function OrderDetailSkeleton() {
    return (
        <div
            aria-hidden="true"
            className="container mx-auto px-4 py-10 max-w-6xl animate-pulse space-y-6"
        >
            <div className="h-5 w-36 rounded bg-gray-200 dark:bg-gray-800" />
            <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200/80 dark:border-gray-800 p-6 md:p-8 space-y-3">
                <div className="h-7 w-64 rounded-xl bg-gray-200 dark:bg-gray-800" />
                <div className="h-4 w-48 rounded bg-gray-100 dark:bg-gray-800" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 bg-white dark:bg-gray-900 rounded-3xl border border-gray-200/80 dark:border-gray-800 p-6 space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div
                            key={i}
                            className="h-20 rounded-2xl bg-gray-100 dark:bg-gray-800"
                        />
                    ))}
                </div>
                <div className="lg:col-span-4 space-y-6">
                    <div className="h-52 rounded-3xl bg-gray-200/80 dark:bg-gray-800/80" />
                    <div className="h-44 rounded-3xl bg-gray-200/70 dark:bg-gray-800/60" />
                </div>
            </div>
        </div>
    );
}

export function OrderDetailView({ orderIdentifier }: OrderDetailViewProps) {
    const [order, setOrder] = useState<NormalizedOrder | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState<boolean>(false);

    const loadOrder = useCallback(async (identifier: string) => {
        const cleanId = safeDecode(identifier || "").trim();
        if (!cleanId) {
            setError("Invalid order reference.");
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const encoded = encodeURIComponent(cleanId);
            const res = await fetch(`/api/orders/${encoded}`, {
                method: "GET",
                headers: {
                    Accept: "application/json",
                },
                cache: "no-store",
            });

            if (res.status === 401 || res.status === 403) {
                setOrder(null);
                setError("Please sign in to view this order's details.");
                setLoading(false);
                return;
            }

            if (!res.ok) {
                let message =
                    res.status === 404
                        ? `Order "${cleanId}" was not found.`
                        : `Unable to load order details (${res.status}).`;
                try {
                    const errBody = (await res.json()) as { message?: string };
                    if (errBody?.message) message = errBody.message;
                } catch {
                    // Keep fallback message
                }
                setOrder(null);
                setError(message);
                setLoading(false);
                return;
            }

            const json = (await res.json()) as OrderApiResponse & RawOrderRecord;
            const candidate: RawOrderRecord | null =
                (json?.data &&
                    typeof json.data === "object" &&
                    "order" in json.data
                    ? (json.data.order as RawOrderRecord)
                    : (json?.data as RawOrderRecord | undefined)) ||
                json?.order ||
                (json?.id !== undefined ||
                    json?.order_number ||
                    json?.items ||
                    json?.order_items
                    ? json
                    : null);

            if (!candidate) {
                setOrder(null);
                setError("Order information is unavailable.");
                setLoading(false);
                return;
            }

            setOrder(normalizeOrder(candidate, cleanId));
            setLoading(false);
        } catch (err: unknown) {
            setOrder(null);
            setError(
                err instanceof Error ? err.message : "Network error while loading order."
            );
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadOrder(orderIdentifier);
    }, [orderIdentifier, loadOrder]);

    const handleCopyOrderRef = async () => {
        if (!order || typeof window === "undefined") return;
        try {
            await navigator.clipboard.writeText(order.reference);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 2000);
        } catch {
            // Ignore clipboard errors
        }
    };

    const handlePrint = () => {
        if (typeof window !== "undefined") {
            window.print();
        }
    };

    const totalQuantity = useMemo(() => {
        if (!order) return 0;
        return order.items.reduce((sum, item) => sum + item.quantity, 0);
    }, [order]);

    if (loading) {
        return <OrderDetailSkeleton />;
    }

    if (error || !order) {
        return (
            <div className="container mx-auto px-4 py-14 max-w-2xl">
                <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200/80 dark:border-gray-800 p-8 sm:p-10 text-center shadow-2xs space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
                        <AlertCircle className="w-7 h-7" />
                    </div>
                    <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
                        Order Details Unavailable
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
                        {error || "We could not find details for this order."}
                    </p>
                    <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                        <Link
                            href="/account"
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Back to Account</span>
                        </Link>
                        {orderIdentifier && (
                            <button
                                type="button"
                                onClick={() => void loadOrder(orderIdentifier)}
                                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                            >
                                <RefreshCw className="w-4 h-4" />
                                <span>Retry</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 md:py-12 max-w-6xl">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4 print:hidden">
                <Link
                    href="/account"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-200 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors group shadow-2xs"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span>Back to Account</span>
                </Link>

                <button
                    type="button"
                    onClick={handlePrint}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-200 hover:border-emerald-500 transition-colors cursor-pointer shadow-2xs"
                >
                    <Printer className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Print Summary</span>
                </button>
            </div>

            <section className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200/80 dark:border-gray-800 p-6 sm:p-8 mb-8 shadow-2xs">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2.5">
                            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full">
                                Order Details
                            </span>
                            <span
                                className={`text-xs font-bold px-3 py-1 rounded-full border capitalize ${getStatusBadgeClass(
                                    order.status
                                )}`}
                            >
                                {order.status}
                            </span>
                            {order.paymentStatus && (
                                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 capitalize">
                                    Payment: {order.paymentStatus}
                                </span>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="text-xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight break-all">
                                Order #{order.reference}
                            </h1>
                            <button
                                type="button"
                                onClick={() => void handleCopyOrderRef()}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-600 dark:text-gray-300 hover:border-emerald-500 transition-colors cursor-pointer print:hidden shrink-0"
                                title="Copy order number"
                            >
                                {copied ? (
                                    <>
                                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                                        <span>Copied</span>
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-3.5 h-3.5" />
                                        <span>Copy</span>
                                    </>
                                )}
                            </button>
                        </div>

                        {order.createdAt && (
                            <p className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                <span>Placed on {order.createdAt}</span>
                            </p>
                        )}
                    </div>

                    <div className="md:text-right bg-gray-50 dark:bg-gray-800/60 rounded-2xl px-5 py-4 border border-gray-200/60 dark:border-gray-800 shrink-0">
                        <span className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                            Order Total
                        </span>
                        <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mt-0.5 block">
                            {formatMoney(order.total, order.currencyLabel)}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            {totalQuantity} {totalQuantity === 1 ? "item" : "items"}
                        </span>
                    </div>
                </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <section className="lg:col-span-8 bg-white dark:bg-gray-900 rounded-3xl border border-gray-200/80 dark:border-gray-800 p-6 sm:p-8 shadow-2xs">
                    <div className="flex items-center justify-between gap-2 pb-5 mb-5 border-b border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-2.5">
                            <ShoppingBag className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">
                                Items in Your Order
                            </h2>
                        </div>
                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                            {order.items.length}{" "}
                            {order.items.length === 1 ? "product" : "products"}
                        </span>
                    </div>

                    {order.items.length > 0 ? (
                        <div className="divide-y divide-gray-100 dark:divide-gray-800">
                            {order.items.map((item) => (
                                <div
                                    key={item.id}
                                    className="py-4 first:pt-0 last:pb-0 flex items-start justify-between gap-4"
                                >
                                    <div className="flex items-start gap-4 min-w-0 flex-1">
                                        <OrderLineItemThumb
                                            src={item.imageUrl}
                                            alt={item.name}
                                        />

                                        <div className="min-w-0 flex-1 space-y-1">
                                            {item.slug ? (
                                                <Link
                                                    href={`/products/${encodeURIComponent(
                                                        item.slug
                                                    )}`}
                                                    className="text-sm sm:text-base font-bold text-gray-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors line-clamp-2"
                                                >
                                                    {item.name}
                                                </Link>
                                            ) : (
                                                <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white line-clamp-2">
                                                    {item.name}
                                                </h3>
                                            )}

                                            {item.variant && (
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    Variant: {item.variant}
                                                </p>
                                            )}

                                            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400 pt-0.5">
                                                <span>Qty: {item.quantity}</span>
                                                {item.unitPrice > 0 && (
                                                    <span>
                                                        Unit:{" "}
                                                        {formatMoney(
                                                            item.unitPrice,
                                                            order.currencyLabel
                                                        )}
                                                    </span>
                                                )}
                                                {item.sku && <span>SKU: {item.sku}</span>}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-right shrink-0">
                                        <span className="text-sm sm:text-base font-extrabold text-gray-900 dark:text-white">
                                            {formatMoney(
                                                item.lineTotal,
                                                order.currencyLabel
                                            )}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400 py-6 text-center">
                            No line items listed for this order.
                        </p>
                    )}

                    {order.notes && (
                        <div className="mt-6 pt-5 border-t border-gray-100 dark:border-gray-800">
                            <span className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                                Order Note
                            </span>
                            <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/60 p-3.5 rounded-2xl">
                                {order.notes}
                            </p>
                        </div>
                    )}
                </section>

                <aside className="lg:col-span-4 space-y-6">
                    <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200/80 dark:border-gray-800 p-6 shadow-2xs">
                        <div className="flex items-center gap-2 mb-4">
                            <CreditCard className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            <h2 className="text-base font-extrabold text-gray-900 dark:text-white">
                                Payment Summary
                            </h2>
                        </div>

                        <div className="space-y-2.5 text-sm">
                            <div className="flex items-center justify-between text-gray-600 dark:text-gray-400">
                                <span>Subtotal</span>
                                <span className="font-semibold text-gray-900 dark:text-white">
                                    {formatMoney(order.subtotal, order.currencyLabel)}
                                </span>
                            </div>

                            <div className="flex items-center justify-between text-gray-600 dark:text-gray-400">
                                <span>Shipping</span>
                                <span className="font-semibold text-gray-900 dark:text-white">
                                    {order.shipping === 0
                                        ? "Free"
                                        : formatMoney(order.shipping, order.currencyLabel)}
                                </span>
                            </div>

                            {order.discount > 0 && (
                                <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400">
                                    <span>Discount</span>
                                    <span className="font-semibold">
                                        -{formatMoney(order.discount, order.currencyLabel)}
                                    </span>
                                </div>
                            )}

                            {order.tax > 0 && (
                                <div className="flex items-center justify-between text-gray-600 dark:text-gray-400">
                                    <span>Tax</span>
                                    <span className="font-semibold text-gray-900 dark:text-white">
                                        {formatMoney(order.tax, order.currencyLabel)}
                                    </span>
                                </div>
                            )}

                            <div className="pt-3 mt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-base font-extrabold text-gray-900 dark:text-white">
                                <span>Total</span>
                                <span className="text-emerald-700 dark:text-emerald-400">
                                    {formatMoney(order.total, order.currencyLabel)}
                                </span>
                            </div>
                        </div>

                        {order.paymentMethod && (
                            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                                <span>Payment Method</span>
                                <span className="font-bold text-gray-800 dark:text-gray-200">
                                    {order.paymentMethod}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200/80 dark:border-gray-800 p-6 shadow-2xs">
                        <div className="flex items-center gap-2 mb-4">
                            <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            <h2 className="text-base font-extrabold text-gray-900 dark:text-white">
                                Delivery Information
                            </h2>
                        </div>

                        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                            {order.shippingInfo.name && (
                                <p className="font-bold text-gray-900 dark:text-white">
                                    {order.shippingInfo.name}
                                </p>
                            )}

                            {order.shippingInfo.addressLines.length > 0 ? (
                                <div className="space-y-0.5 text-xs sm:text-sm leading-relaxed">
                                    {order.shippingInfo.addressLines.map((line, i) => (
                                        <p key={i}>{line}</p>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Delivery address not listed on order record.
                                </p>
                            )}

                            {order.shippingInfo.phone && (
                                <p className="inline-flex items-center gap-2 text-xs sm:text-sm pt-1">
                                    <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                    <span>{order.shippingInfo.phone}</span>
                                </p>
                            )}

                            {order.shippingInfo.email && (
                                <p className="flex items-center gap-2 text-xs sm:text-sm">
                                    <Mail className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                    <span className="truncate">{order.shippingInfo.email}</span>
                                </p>
                            )}
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}

export default OrderDetailView;