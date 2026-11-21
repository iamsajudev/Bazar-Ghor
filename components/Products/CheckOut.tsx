"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
    ChevronRight, CreditCard, Truck, ShieldCheck, MapPin, Phone, Mail, User,
    CheckCircle2, ShoppingBag, Tag, FileText, Loader2, AlertCircle
} from "lucide-react";
import { useCartStore } from "@/store/useCartStore";

const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "") ||
    "https://ecommerce.flixzaglobal.us/api/v1";

interface ShippingMethod {
    id: number;
    code?: string;
    name: string;
    type?: string;
    delivery_label?: string;
    price_minor: number;
}

interface ServerQuote {
    currency_code?: string;
    subtotal_minor: number;
    discount_minor?: number;
    tax_minor?: number;
    shipping_minor: number;
    total_minor: number;
    shipping_method_id?: number;
    eligible_payment_methods?: string[];
}

export default function CheckoutPage() {
    const router = useRouter();
    const { items, guestToken, fetchCart, clearCart } = useCartStore();

    const [loading, setLoading] = useState(false);
    const [quoteLoading, setQuoteLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [shippingOptions, setShippingOptions] = useState<ShippingMethod[]>([]);
    const [selectedShippingId, setSelectedShippingId] = useState<number | null>(null);
    const selectedShippingIdRef = useRef<number | null>(null);
    selectedShippingIdRef.current = selectedShippingId;

    const [serverQuote, setServerQuote] = useState<ServerQuote | null>(null);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        address: "",
        city: "Dhaka",
        area: "",
        zipCode: "",
        paymentMethod: "cod",
        orderNote: "",
    });

    const [couponCode, setCouponCode] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);

    const fetchShippingOptions = useCallback(async () => {
        if (!guestToken || !formData.city.trim()) {
            setQuoteLoading(false);
            return;
        }

        setQuoteLoading(true);
        setError(null);

        try {
            const payload: Record<string, string> = {
                country_code: "BD",
                city: formData.city.trim(),
            };
            if (formData.area.trim()) payload.area = formData.area.trim();
            if (formData.zipCode.trim()) payload.postal_code = formData.zipCode.trim();

            const res = await fetch(`${API_BASE}/shipping/options`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    "X-Guest-Cart-Token": guestToken,
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok) {
                const apiError = data.errors
                    ? Object.values(data.errors).flat().join(", ")
                    : data.message;
                setError(apiError || "Delivery is not available for this address.");
                setShippingOptions([]);
                setSelectedShippingId(null);
                setServerQuote(null);
                return;
            }

            const methods: ShippingMethod[] = data.data?.shipping_methods || [];
            setShippingOptions(methods);

            if (methods.length > 0) {
                const currentId = selectedShippingIdRef.current;
                const stillExists = methods.some((m) => m.id === currentId);
                setSelectedShippingId(stillExists ? currentId : methods[0].id);
            } else {
                setError("Delivery is not available for this address. Please check your City, Area, or Postal Code.");
                setSelectedShippingId(null);
                setServerQuote(null);
            }
        } catch (err) {
            console.error("Failed to fetch shipping options", err);
            setError("Network error while fetching shipping options.");
            setShippingOptions([]);
            setSelectedShippingId(null);
            setServerQuote(null);
        } finally {
            setQuoteLoading(false);
        }
    }, [guestToken, formData.city, formData.area, formData.zipCode]);

    useEffect(() => {
        if (items.length === 0) {
            fetchCart();
        }
    }, [items.length, fetchCart]);

    useEffect(() => {
        if (!guestToken) return;

        const timer = setTimeout(() => {
            fetchShippingOptions();
        }, 500);

        return () => clearTimeout(timer);
    }, [fetchShippingOptions, guestToken]);

    useEffect(() => {
        if (quoteLoading || !guestToken || !selectedShippingId) {
            if (!selectedShippingId && !quoteLoading) {
                setServerQuote(null);
            }
            return;
        }

        let cancelled = false;

        const getQuote = async () => {
            try {
                const payload: Record<string, unknown> = {
                    country_code: "BD",
                    city: formData.city.trim(),
                    shipping_method_id: selectedShippingId,
                };
                if (formData.area.trim()) payload.area = formData.area.trim();
                if (formData.zipCode.trim()) payload.postal_code = formData.zipCode.trim();
                if (appliedCoupon) payload.coupon_code = appliedCoupon;

                const res = await fetch(`${API_BASE}/checkout/quote`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                        "X-Guest-Cart-Token": guestToken,
                    },
                    body: JSON.stringify(payload),
                });

                const data = await res.json();
                if (cancelled) return;

                if (res.ok && data.data) {
                    setServerQuote(data.data);
                    setError(null);
                } else {
                    const apiError = data.errors
                        ? Object.values(data.errors).flat().join(", ")
                        : data.message;
                    setError(apiError || "Unable to calculate totals. Please check your address.");
                    setServerQuote(null);
                }
            } catch {
                if (!cancelled) {
                    setError("Network error while calculating quote.");
                    setServerQuote(null);
                }
            }
        };

        getQuote();
        return () => {
            cancelled = true;
        };
    }, [
        quoteLoading,
        guestToken,
        selectedShippingId,
        appliedCoupon,
        formData.city,
        formData.area,
        formData.zipCode,
    ]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (name === "city" || name === "area" || name === "zipCode") {
            setSelectedShippingId(null);
            setServerQuote(null);
        }
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
        setError(null);

        if (items.length === 0) return setError("Your cart is empty.");
        if (!guestToken) return setError("Missing guest cart session. Please refresh and try again.");
        if (!selectedShippingId || !serverQuote) {
            return setError("Please wait for delivery options and totals to calculate.");
        }
        if (!formData.name.trim()) return setError("Full Name is required.");
        if (!formData.phone.trim()) return setError("Phone Number is required.");
        if (!formData.email.trim()) return setError("Email Address is required for guest checkout.");
        if (!formData.address.trim()) return setError("Delivery Address is required.");

        setLoading(true);
        try {
            const payload = {
                idempotency_key: crypto.randomUUID(),
                guest_email: formData.email.trim(),
                recipient_name: formData.name.trim(),
                phone: formData.phone.trim(),
                line1: formData.address.trim(),
                line2: undefined,
                country_code: "BD",
                region: formData.city.trim(),
                city: formData.city.trim(),
                area: formData.area.trim() || undefined,
                postal_code: formData.zipCode.trim() || undefined,
                shipping_method_id: selectedShippingId,
                payment_method: formData.paymentMethod,
                ...(appliedCoupon ? { coupon_code: appliedCoupon } : {}),
                notes: formData.orderNote.trim() || undefined,
            };

            const res = await fetch(`${API_BASE}/checkout/place`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    "X-Guest-Cart-Token": guestToken,
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok) {
                const apiError = data.errors
                    ? Object.values(data.errors).flat().join(", ")
                    : data.message;
                throw new Error(apiError || `Order failed (${res.status})`);
            }

            clearCart();
            router.push(`/order-success?id=${data.data.order_number}`);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (items.length === 0 && !loading) {
        return (
            <div className="container mx-auto px-4 py-20 text-center min-h-[60vh] flex flex-col items-center justify-center">
                <ShoppingBag className="h-20 w-20 text-gray-300 mb-4" />
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Your cart is empty</h1>
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 bg-[#f76b1c] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#e05a12] transition-colors shadow-sm"
                >
                    Continue Shopping <ChevronRight className="h-4 w-4" />
                </Link>
            </div>
        );
    }

    const formatBDT = (minor: number) => `৳${((minor || 0) / 100).toFixed(2)}`;

    return (
        <div className="mx-auto px-4 py-8 container max-w-6xl">
            <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                <Link href="/" className="hover:text-[#f76b1c] transition-colors">Home</Link>
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

            <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Column: Forms */}
                <div className="lg:col-span-7 space-y-6">
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
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 focus:ring-2 focus:ring-[#f76b1c] outline-none text-sm transition-all cursor-pointer"
                                >
                                    <option value="Dhaka">Dhaka</option>
                                    <option value="Chattogram">Chattogram</option>
                                    <option value="Outside Dhaka">Outside Dhaka</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1.5 block">
                                    Area / Thana
                                </label>
                                <input
                                    type="text"
                                    name="area"
                                    value={formData.area}
                                    onChange={handleChange}
                                    placeholder="e.g. Gulshan, Mirpur"
                                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-transparent focus:ring-2 focus:ring-[#f76b1c] outline-none text-sm transition-all"
                                />
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
                                    placeholder="1212"
                                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-transparent focus:ring-2 focus:ring-[#f76b1c] outline-none text-sm transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-xs">
                        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-5 flex items-center gap-2">
                            <CreditCard className="h-5 w-5 text-[#f76b1c]" /> Payment Method
                        </h2>
                        <div className="space-y-3">
                            <label
                                className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                    formData.paymentMethod === "cod"
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
                                        <p className="text-xs text-gray-500">Pay securely when your order arrives</p>
                                    </div>
                                </div>
                                <Truck className="h-5 w-5 text-gray-400" />
                            </label>
                        </div>
                    </div>

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

                {/* Right Column: Summary */}
                <div className="lg:col-span-5 sticky top-24">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-xs space-y-6">
                        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 border-b border-gray-100 dark:border-gray-800 pb-4">
                            Order Summary ({items.length} items)
                        </h2>

                        <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
                            {items.map((item) => {
                                const lineMinor = (Number(item.price) || 0) * (Number(item.quantity) || 1) * 100;
                                return (
                                    <div key={item.variant_id} className="flex items-center gap-3">
                                        <div className="relative w-14 h-14 bg-gray-50 dark:bg-gray-800 rounded-xl overflow-hidden shrink-0 border border-gray-100 dark:border-gray-700">
                                            <Image
                                                src={item.image || "/images/placeholder.png"}
                                                alt={item.name}
                                                fill
                                                className="object-contain p-1"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold line-clamp-1 text-gray-900 dark:text-white">
                                                {item.name}
                                            </p>
                                            <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                        </div>
                                        <p className="text-sm font-extrabold text-[#f76b1c]">{formatBDT(lineMinor)}</p>
                                    </div>
                                );
                            })}
                        </div>

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

                        {quoteLoading ? (
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
                                        {formatBDT(serverQuote.subtotal_minor)}
                                    </span>
                                </div>

                                {(serverQuote.discount_minor ?? 0) > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span>Discount</span>
                                        <span className="font-semibold">-{formatBDT(serverQuote.discount_minor ?? 0)}</span>
                                    </div>
                                )}

                                <div className="flex justify-between items-start text-gray-600 dark:text-gray-400">
                                    <span className="pt-1">Delivery Fee</span>
                                    <div className="text-right">
                                        {shippingOptions.length > 0 ? (
                                            <select
                                                value={selectedShippingId || ""}
                                                onChange={(e) => setSelectedShippingId(Number(e.target.value))}
                                                className="text-right bg-transparent border-none p-0 text-sm font-semibold text-gray-900 dark:text-white focus:ring-0 cursor-pointer text-end"
                                            >
                                                {shippingOptions.map((opt) => (
                                                    <option key={opt.id} value={opt.id}>
                                                        {opt.name} ({formatBDT(opt.price_minor)})
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            <span className="font-semibold text-gray-900 dark:text-white">
                                                {formatBDT(serverQuote.shipping_minor)}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex justify-between text-lg font-extrabold pt-3 border-t border-gray-100 dark:border-gray-800 text-gray-900 dark:text-white">
                                    <span>Total Payable</span>
                                    <span className="text-[#f76b1c]">{formatBDT(serverQuote.total_minor)}</span>
                                </div>
                            </div>
                        ) : (
                            <p className="text-center text-sm text-red-500 py-4">
                                Unable to calculate totals. Please check your address.
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={loading || quoteLoading || !serverQuote}
                            className="w-full bg-[#f76b1c] hover:bg-[#e05a12] disabled:opacity-70 disabled:cursor-not-allowed text-white py-3.5 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 shadow-md cursor-pointer text-sm md:text-base"
                        >
                            {loading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <CheckCircle2 className="h-5 w-5" />
                            )}
                            {loading
                                ? "Processing..."
                                : `Place Order (${serverQuote ? formatBDT(serverQuote.total_minor) : "..."})`}
                        </button>

                        <div className="flex items-center justify-center gap-2 text-xs text-gray-500 pt-2 border-t border-gray-100 dark:border-gray-800">
                            <ShieldCheck className="h-4 w-4 text-green-600" />
                            <span>100% Secure & Safe Checkout</span>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}