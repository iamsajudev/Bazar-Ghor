"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
    ChevronRight,
    CreditCard,
    Truck,
    ShieldCheck,
    MapPin,
    Phone,
    Mail,
    User,
    CheckCircle2,
    ShoppingBag,
    Tag,
    FileText,
    Loader2,
    AlertCircle,
} from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";

const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "") ||
    "https://ecommerce.goflixza.com/api/v1";

interface ShippingMethod {
    id: number | null;
    code: string;
    name: string;
    type?: string;
    delivery_label?: string | null;
    price_minor?: number;
    base_price_minor?: number;
}

interface ServerQuote {
    currency_code?: string;
    subtotal_minor: number;
    discount_minor?: number;
    tax_minor?: number;
    shipping_minor: number;
    total_minor: number;
    shipping_method_id?: number | null;
    default_shipping_applied?: boolean;
    eligible_payment_methods?: string[];
}

interface AreaOption {
    country_code: string;
    region_code: string;
    city: string;
    area: string;
    postal_prefix: string | null;
}

interface CheckoutFormData {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    area: string;
    zipCode: string;
    paymentMethod: "cod";
    orderNote: string;
}

interface SavedOrderSummary {
    order_number: string;
    status: string;
    total_minor: number;
    subtotal_minor: number;
    shipping_minor: number;
    currency_code: string;
    recipient_name: string;
    guest_email: string;
}

interface ApiErrorShape {
    message?: string;
    errors?: Record<string, string[] | string>;
}

interface OrderPayloadShape {
    id?: number | string;
    order_number?: string;
    status?: string;
    total_minor?: number;
    subtotal_minor?: number;
    shipping_minor?: number;
    currency_code?: string;
}

interface PlaceOrderResponseShape extends OrderPayloadShape {
    data?: OrderPayloadShape | null;
}

function extractApiError(data: ApiErrorShape | null | undefined, defaultMsg: string): string {
    if (data?.errors && typeof data.errors === "object") {
        for (const key of Object.keys(data.errors)) {
            const val = data.errors[key];
            if (Array.isArray(val) && val.length > 0 && typeof val[0] === "string") {
                return val[0];
            }
            if (typeof val === "string" && val.trim()) {
                return val;
            }
        }
    }
    if (typeof data?.message === "string" && data.message.trim()) {
        return data.message;
    }
    return defaultMsg;
}

function getMethodKey(method: ShippingMethod, index: number): string {
    return method.id !== null && method.id !== undefined
        ? `id:${method.id}`
        : `code:${method.code || index}`;
}

function formatMoney(minor: number, currency?: string): string {
    const amount = ((Number(minor) || 0) / 100).toFixed(2);
    return currency === "USD" ? `$${amount}` : `৳${amount}`;
}

export default function CheckOut() {
    const router = useRouter();
    const { items, guestToken, priceMapByVariant, fetchCart, clearCart } = useCartStore();
    const { user } = useAuthStore();

    const [loading, setLoading] = useState(false);
    const [optionsLoading, setOptionsLoading] = useState(false);
    const [quoteLoading, setQuoteLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const idempotencyKeyRef = useRef<string>("");

    const [shippingOptions, setShippingOptions] = useState<ShippingMethod[]>([]);
    const [selectedMethodKey, setSelectedMethodKey] = useState<string>("");
    const [serverQuote, setServerQuote] = useState<ServerQuote | null>(null);

    const [areasList, setAreasList] = useState<AreaOption[]>([]);
    const [areasLoading, setAreasLoading] = useState(true);
    const [defaultMethods, setDefaultMethods] = useState<ShippingMethod[]>([]);

    const [formData, setFormData] = useState<CheckoutFormData>({
        name: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        area: "",
        zipCode: "",
        paymentMethod: "cod",
        orderNote: "",
    });

    const [couponCode, setCouponCode] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);

    const uniqueCities = useMemo<string[]>(
        () => Array.from(new Set(areasList.map((a) => a.city))),
        [areasList]
    );

    const availableAreas = useMemo<string[]>(() => {
        if (!formData.city) return [];
        return areasList.filter((a) => a.city === formData.city).map((a) => a.area);
    }, [areasList, formData.city]);

    const selectedMethod = useMemo<ShippingMethod | null>(
        () =>
            shippingOptions.find((m, idx) => getMethodKey(m, idx) === selectedMethodKey) ??
            null,
        [shippingOptions, selectedMethodKey]
    );

    const displayMethod = selectedMethod ?? defaultMethods[0] ?? null;
    const isCalculating = optionsLoading || quoteLoading;

    useEffect(() => {
        if (!user) return;
        setFormData((prev) => ({
            ...prev,
            name: prev.name || user.name || "",
            email: prev.email || user.email || "",
            phone: prev.phone || user.phone || "",
        }));
    }, [user]);

    useEffect(() => {
        if (!idempotencyKeyRef.current && typeof window !== "undefined") {
            idempotencyKeyRef.current = window.crypto.randomUUID();
        }
    }, []);

    useEffect(() => {
        if (items.length === 0) {
            void fetchCart();
        }
    }, [items.length, fetchCart]);

    // 1. Parallel fetch for shipping areas & default methods
    useEffect(() => {
        let active = true;

        const fetchInitialData = async () => {
            try {
                const [resAreas, resMethods] = await Promise.all([
                    fetch(`${API_BASE}/shipping/areas`, {
                        headers: { Accept: "application/json" },
                    }),
                    fetch(`${API_BASE}/shipping/methods?country_code=BD`, {
                        headers: { Accept: "application/json" },
                    }),
                ]);

                if (!active) return;

                if (resAreas.ok) {
                    const dataAreas = (await resAreas.json()) as {
                        data?: { data?: AreaOption[] };
                    };
                    if (Array.isArray(dataAreas?.data?.data)) {
                        setAreasList(dataAreas.data.data);
                    }
                }

                if (resMethods.ok) {
                    const dataMethods = (await resMethods.json()) as {
                        data?: { methods?: ShippingMethod[] };
                    };
                    if (Array.isArray(dataMethods?.data?.methods)) {
                        setDefaultMethods(dataMethods.data.methods);
                    }
                }
            } catch (err) {
                console.warn("Failed to load initial shipping data:", err);
            } finally {
                if (active) setAreasLoading(false);
            }
        };

        void fetchInitialData();
        return () => {
            active = false;
        };
    }, []);

    const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedCity = e.target.value;
        setFormData((prev) => ({ ...prev, city: selectedCity, area: "" }));
        setSelectedMethodKey("");
        setShippingOptions([]);
        setServerQuote(null);
        setError(null);
    };

    const handleAreaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedArea = e.target.value;
        const matchedArea = areasList.find(
            (a) => a.city === formData.city && a.area === selectedArea
        );

        setFormData((prev) => ({
            ...prev,
            area: selectedArea,
            zipCode: matchedArea?.postal_prefix || prev.zipCode,
        }));
        setSelectedMethodKey("");
        setShippingOptions([]);
        setServerQuote(null);
        setError(null);
    };

    // 2. Fetch address-eligible shipping options
    const fetchShippingOptions = useCallback(async () => {
        if (!guestToken || items.length === 0 || !formData.city || !formData.area) {
            setOptionsLoading(false);
            return;
        }

        setOptionsLoading(true);
        setError(null);

        try {
            const res = await fetch(`${API_BASE}/shipping/options`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    "X-Guest-Cart-Token": guestToken,
                },
                body: JSON.stringify({
                    country_code: "BD",
                    city: formData.city,
                    area: formData.area,
                    postal_code: formData.zipCode.trim() || "1200",
                }),
            });

            const data = (await res.json().catch(() => ({}))) as ApiErrorShape & {
                data?: { shipping_methods?: ShippingMethod[] };
            };

            if (!res.ok) {
                setError(extractApiError(data, "Delivery is not available for this address."));
                setShippingOptions([]);
                setSelectedMethodKey("");
                setServerQuote(null);
                return;
            }

            const methods = data.data?.shipping_methods ?? [];
            setShippingOptions(methods);
            setSelectedMethodKey(methods.length > 0 ? getMethodKey(methods[0], 0) : "");
        } catch {
            setError("Network error while fetching shipping options.");
            setShippingOptions([]);
            setSelectedMethodKey("");
            setServerQuote(null);
        } finally {
            setOptionsLoading(false);
        }
    }, [guestToken, formData.city, formData.area, formData.zipCode, items.length]);

    useEffect(() => {
        if (!guestToken || !formData.area || items.length === 0) return;
        const timer = window.setTimeout(() => {
            void fetchShippingOptions();
        }, 300);
        return () => window.clearTimeout(timer);
    }, [fetchShippingOptions, guestToken, formData.area, items.length]);

    // 3. Fetch server-authoritative checkout quote with AbortController
    useEffect(() => {
        if (optionsLoading || !guestToken || items.length === 0 || !formData.city || !formData.area) {
            return;
        }

        const controller = new AbortController();

        const getQuote = async () => {
            setQuoteLoading(true);
            try {
                const payload: Record<string, string | number> = {
                    country_code: "BD",
                    city: formData.city,
                    area: formData.area,
                    postal_code: formData.zipCode.trim() || "1200",
                };

                if (selectedMethod && selectedMethod.id !== null && selectedMethod.id !== undefined) {
                    payload.shipping_method_id = selectedMethod.id;
                }
                if (appliedCoupon) {
                    payload.coupon_code = appliedCoupon;
                }

                const res = await fetch(`${API_BASE}/checkout/quote`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                        "X-Guest-Cart-Token": guestToken,
                    },
                    body: JSON.stringify(payload),
                    signal: controller.signal,
                });

                const data = (await res.json().catch(() => ({}))) as ApiErrorShape & {
                    data?: ServerQuote;
                };

                if (controller.signal.aborted) return;

                if (res.ok) {
                    const quote = (data?.data ?? data) as ServerQuote;
                    setServerQuote(quote);
                    setError(null);
                } else {
                    setError(extractApiError(data, "Unable to calculate totals."));
                    setServerQuote(null);
                }
            } catch (err) {
                if (err instanceof Error && err.name === "AbortError") return;
                setError("Network error while calculating quote.");
                setServerQuote(null);
            } finally {
                if (!controller.signal.aborted) {
                    setQuoteLoading(false);
                }
            }
        };

        void getQuote();
        return () => controller.abort();
    }, [
        optionsLoading,
        guestToken,
        selectedMethod,
        appliedCoupon,
        formData.city,
        formData.area,
        formData.zipCode,
        items.length,
    ]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleCouponToggle = () => {
        if (appliedCoupon) {
            setAppliedCoupon(null);
            setCouponCode("");
            return;
        }
        const trimmed = couponCode.trim().toUpperCase();
        if (!trimmed) {
            setError("Please enter a coupon code first.");
            return;
        }
        setError(null);
        setAppliedCoupon(trimmed);
    };

    const handlePlaceOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        if (loading) return;
        setError(null);

        if (items.length === 0) {
            setError("Your cart is empty.");
            return;
        }
        if (!guestToken) {
            setError("Guest cart session missing. Please refresh and try again.");
            return;
        }
        if (!formData.name.trim()) {
            setError("Full Name is required.");
            return;
        }
        if (!formData.phone.trim()) {
            setError("Phone Number is required.");
            return;
        }
        if (!formData.email.trim()) {
            setError("Email Address is required.");
            return;
        }
        if (!formData.address.trim()) {
            setError("Delivery Address is required.");
            return;
        }
        if (!formData.city) {
            setError("Please select a City.");
            return;
        }
        if (!formData.area) {
            setError("Please select an Area.");
            return;
        }

        if (!idempotencyKeyRef.current && typeof window !== "undefined") {
            idempotencyKeyRef.current = window.crypto.randomUUID();
        }

        const trimmedName = formData.name.trim();
        const trimmedEmail = formData.email.trim();
        const trimmedPhone = formData.phone.trim();

        setLoading(true);
        try {
            const payload: Record<string, string | number> = {
                idempotency_key: idempotencyKeyRef.current,
                guest_email: trimmedEmail,
                recipient_name: trimmedName,
                phone: trimmedPhone,
                line1: formData.address.trim(),
                country_code: "BD",
                region: formData.city,
                city: formData.city,
                area: formData.area,
                postal_code: formData.zipCode.trim() || "1200",
                payment_method: formData.paymentMethod,
            };

            if (selectedMethod && selectedMethod.id !== null && selectedMethod.id !== undefined) {
                payload.shipping_method_id = selectedMethod.id;
            }
            if (appliedCoupon) {
                payload.coupon_code = appliedCoupon;
            }
            if (formData.orderNote.trim()) {
                payload.notes = formData.orderNote.trim();
            }

            const res = await fetch(`${API_BASE}/checkout/place`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    "X-Guest-Cart-Token": guestToken,
                },
                body: JSON.stringify(payload),
            });

            const data = (await res.json().catch(() => ({}))) as ApiErrorShape &
                PlaceOrderResponseShape;

            if (!res.ok) {
                throw new Error(extractApiError(data, `Order failed (${res.status})`));
            }

            const orderPayload = data?.data ?? data;
            const orderNumber = String(
                orderPayload?.order_number || orderPayload?.id || data?.order_number || ""
            );

            if (typeof window !== "undefined") {
                if (orderNumber) {
                    const summary: SavedOrderSummary = {
                        order_number: orderNumber,
                        status: orderPayload?.status || "pending",
                        total_minor: Number(orderPayload?.total_minor ?? serverQuote?.total_minor ?? 0),
                        subtotal_minor: Number(
                            orderPayload?.subtotal_minor ?? serverQuote?.subtotal_minor ?? 0
                        ),
                        shipping_minor: Number(
                            orderPayload?.shipping_minor ?? serverQuote?.shipping_minor ?? 0
                        ),
                        currency_code:
                            orderPayload?.currency_code || serverQuote?.currency_code || "BDT",
                        recipient_name: trimmedName,
                        guest_email: trimmedEmail,
                    };

                    sessionStorage.setItem(`order_summary_${orderNumber}`, JSON.stringify(summary));
                }

                idempotencyKeyRef.current = window.crypto.randomUUID();
            }

            clearCart();
            router.push(`/order-success?id=${encodeURIComponent(orderNumber)}`);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    if (items.length === 0 && !loading) {
        return (
            <div className="container mx-auto px-4 py-20 text-center min-h-[60vh] flex flex-col items-center justify-center">
                <ShoppingBag className="h-20 w-20 text-gray-300 mb-4" />
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                    Your cart is empty
                </h1>
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 bg-[#f76b1c] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#e05a12] transition-colors shadow-sm"
                >
                    Continue Shopping <ChevronRight className="h-4 w-4" />
                </Link>
            </div>
        );
    }

    return (
        <div className="mx-auto px-4 pt-20 pb-8 container max-w-6xl">
            <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                <Link href="/" className="hover:text-[#f76b1c] transition-colors">
                    Home
                </Link>
                <ChevronRight className="h-4 w-4" />
                <span className="text-gray-800 dark:text-gray-200 font-medium">Checkout</span>
            </nav>

            {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3 text-red-600 dark:text-red-400">
                    <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                    <p className="text-sm font-medium">{error}</p>
                </div>
            )}

            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white mb-8">
                Secure Checkout
            </h1>

            <form
                onSubmit={handlePlaceOrder}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
            >
                <div className="lg:col-span-7 space-y-6">
                    {/* Shipping Info */}
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-xs">
                        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-5 flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-[#f76b1c]" /> Shipping Information
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1.5 block">
                                    Full Name <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Your full name"
                                        className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-transparent focus:ring-2 focus:ring-[#f76b1c] outline-none text-sm transition-all"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1.5 block">
                                    Phone Number <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
                                    <input
                                        type="tel"
                                        name="phone"
                                        required
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="017XXXXXXXX"
                                        className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-transparent focus:ring-2 focus:ring-[#f76b1c] outline-none text-sm transition-all"
                                    />
                                </div>
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1.5 block">
                                    Email Address <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="you@example.com"
                                        className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-transparent focus:ring-2 focus:ring-[#f76b1c] outline-none text-sm transition-all"
                                    />
                                </div>
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1.5 block">
                                    Delivery Address <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    name="address"
                                    required
                                    rows={3}
                                    value={formData.address}
                                    onChange={handleChange}
                                    placeholder="House No, Road No, Area..."
                                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-transparent focus:ring-2 focus:ring-[#f76b1c] outline-none text-sm resize-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1.5 block">
                                    City / Region <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="city"
                                    value={formData.city}
                                    onChange={handleCityChange}
                                    disabled={areasLoading}
                                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 focus:ring-2 focus:ring-[#f76b1c] outline-none text-sm transition-all cursor-pointer disabled:opacity-50"
                                >
                                    <option value="">
                                        {areasLoading ? "Loading cities..." : "Select City"}
                                    </option>
                                    {uniqueCities.map((city) => (
                                        <option key={city} value={city}>
                                            {city}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1.5 block">
                                    Area / Thana <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="area"
                                    value={formData.area}
                                    onChange={handleAreaChange}
                                    disabled={areasLoading || availableAreas.length === 0}
                                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 focus:ring-2 focus:ring-[#f76b1c] outline-none text-sm transition-all cursor-pointer disabled:opacity-50"
                                >
                                    <option value="">Select Area</option>
                                    {availableAreas.map((area) => (
                                        <option key={area} value={area}>
                                            {area}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="md:col-span-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1.5 block">
                                    Postal / Zip Code
                                </label>
                                <input
                                    type="text"
                                    name="zipCode"
                                    value={formData.zipCode}
                                    onChange={handleChange}
                                    placeholder="1200"
                                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-transparent focus:ring-2 focus:ring-[#f76b1c] outline-none text-sm transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Payment Method */}
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-xs">
                        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-5 flex items-center gap-2">
                            <CreditCard className="h-5 w-5 text-[#f76b1c]" /> Payment Method
                        </h2>
                        <div className="space-y-3">
                            <label
                                className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.paymentMethod === "cod"
                                        ? "border-[#f76b1c] bg-orange-50/40 dark:bg-orange-950/10"
                                        : "border-gray-200 dark:border-gray-700"
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="cod"
                                        checked={formData.paymentMethod === "cod"}
                                        onChange={handleChange}
                                        className="w-4 h-4 accent-[#f76b1c]"
                                    />
                                    <div>
                                        <span className="font-bold text-sm block text-gray-900 dark:text-white">
                                            Cash on Delivery
                                        </span>
                                        <p className="text-xs text-gray-500">
                                            Pay securely when your order arrives
                                        </p>
                                    </div>
                                </div>
                                <Truck className="h-5 w-5 text-gray-400" />
                            </label>
                        </div>
                    </div>

                    {/* Order Notes */}
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-xs">
                        <h2 className="text-base font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                            <FileText className="h-4 w-4 text-[#f76b1c]" /> Order Notes (Optional)
                        </h2>
                        <textarea
                            name="orderNote"
                            rows={2}
                            value={formData.orderNote}
                            onChange={handleChange}
                            placeholder="Any special instructions?"
                            className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-transparent focus:ring-2 focus:ring-[#f76b1c] outline-none text-sm resize-none"
                        />
                    </div>
                </div>

                {/* Order Summary Sidebar */}
                <div className="lg:col-span-5 sticky top-24">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-xs space-y-6">
                        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 border-b border-gray-100 dark:border-gray-800 pb-4">
                            Order Summary ({items.length} items)
                        </h2>

                        <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
                            {items.map((item) => {
                                const unitPrice =
                                    Number(item.price) ||
                                    Number(priceMapByVariant[item.variant_id]) ||
                                    0;
                                const lineMinor = Math.round(
                                    unitPrice * (Number(item.quantity) || 1) * 100
                                );
                                return (
                                    <div key={item.variant_id} className="flex items-center gap-3">
                                        <div className="relative w-14 h-14 bg-gray-50 dark:bg-gray-800 rounded-xl overflow-hidden shrink-0 border border-gray-100 dark:border-gray-700">
                                            <Image
                                                src={item.image || "/images/placeholder.png"}
                                                alt={item.name}
                                                fill
                                                sizes="56px"
                                                className="object-contain p-1"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold line-clamp-1 text-gray-900 dark:text-white">
                                                {item.name}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                Qty: {item.quantity}
                                            </p>
                                        </div>
                                        <p className="text-sm font-extrabold text-[#f76b1c]">
                                            {formatMoney(lineMinor, serverQuote?.currency_code)}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Coupon Code */}
                        <div className="pt-2">
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Tag className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Coupon code"
                                        value={couponCode}
                                        disabled={Boolean(appliedCoupon)}
                                        onChange={(e) => setCouponCode(e.target.value)}
                                        className="w-full pl-9 pr-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-xs bg-transparent uppercase outline-none focus:ring-1 focus:ring-[#f76b1c] disabled:opacity-60"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={handleCouponToggle}
                                    className="bg-gray-900 dark:bg-gray-800 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-gray-800 transition-colors cursor-pointer"
                                >
                                    {appliedCoupon ? "Remove" : "Apply"}
                                </button>
                            </div>
                        </div>

                        {/* Quote / Fee Calculation */}
                        {isCalculating ? (
                            <div className="space-y-3 animate-pulse pt-4 border-t border-gray-100 dark:border-gray-800">
                                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
                                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
                                <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-full mt-4" />
                            </div>
                        ) : serverQuote ? (
                            <div className="space-y-2.5 pt-4 border-t border-gray-100 dark:border-gray-800 text-sm">
                                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                    <span>Subtotal</span>
                                    <span className="font-semibold text-gray-900 dark:text-white">
                                        {formatMoney(
                                            serverQuote.subtotal_minor,
                                            serverQuote.currency_code
                                        )}
                                    </span>
                                </div>

                                {(serverQuote.discount_minor ?? 0) > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span>Discount</span>
                                        <span className="font-semibold">
                                            -
                                            {formatMoney(
                                                serverQuote.discount_minor ?? 0,
                                                serverQuote.currency_code
                                            )}
                                        </span>
                                    </div>
                                )}

                                <div className="flex justify-between items-start text-gray-600 dark:text-gray-400">
                                    <span className="pt-1">Delivery Fee</span>
                                    <div className="text-right">
                                        {shippingOptions.length > 1 ? (
                                            <select
                                                value={selectedMethodKey}
                                                onChange={(e) => setSelectedMethodKey(e.target.value)}
                                                className="text-right bg-transparent border-none p-0 text-sm font-semibold text-gray-900 dark:text-white focus:ring-0 cursor-pointer text-end"
                                            >
                                                {shippingOptions.map((opt, idx) => (
                                                    <option
                                                        key={getMethodKey(opt, idx)}
                                                        value={getMethodKey(opt, idx)}
                                                    >
                                                        {opt.name} (
                                                        {formatMoney(
                                                            opt.price_minor ??
                                                            opt.base_price_minor ??
                                                            0,
                                                            serverQuote.currency_code
                                                        )}
                                                        )
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            <span className="font-semibold text-gray-900 dark:text-white">
                                                {selectedMethod ? `${selectedMethod.name} — ` : ""}
                                                {formatMoney(
                                                    serverQuote.shipping_minor,
                                                    serverQuote.currency_code
                                                )}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex justify-between text-lg font-extrabold pt-3 border-t border-gray-100 dark:border-gray-800 text-gray-900 dark:text-white">
                                    <span>Total Payable</span>
                                    <span className="text-[#f76b1c]">
                                        {formatMoney(
                                            serverQuote.total_minor,
                                            serverQuote.currency_code
                                        )}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">
                                        Delivery Fee
                                    </span>
                                    <span className="font-semibold text-gray-900 dark:text-white">
                                        {displayMethod
                                            ? `${displayMethod.name} — ${formatMoney(
                                                displayMethod.base_price_minor || 0
                                            )}`
                                            : "Select address to calculate"}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 text-center italic mt-2">
                                    Shipping cost will be calculated upon selecting City &amp; Area.
                                </p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || isCalculating || !serverQuote}
                            className="w-full bg-[#f76b1c] hover:bg-[#e05a12] disabled:opacity-70 disabled:cursor-not-allowed text-white py-3.5 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 shadow-md cursor-pointer text-sm md:text-base"
                        >
                            {loading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <CheckCircle2 className="h-5 w-5" />
                            )}
                            {loading
                                ? "Processing..."
                                : `Place Order (${serverQuote
                                    ? formatMoney(
                                        serverQuote.total_minor,
                                        serverQuote.currency_code
                                    )
                                    : "..."
                                })`}
                        </button>

                        <div className="flex items-center justify-center gap-2 text-xs text-gray-500 pt-2 border-t border-gray-100 dark:border-gray-800">
                            <ShieldCheck className="h-4 w-4 text-green-600" />
                            <span>100% Secure &amp; Safe Checkout</span>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}