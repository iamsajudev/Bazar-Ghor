"use client";

import { useState, useEffect, useCallback } from "react";
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
} from "lucide-react";
import { useCartStore } from "@/store/useCartStore";

const API_BASE = (
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://ecommerce.flixzaglobal.us/api/v1"
).replace(/\/+$/, "");

interface ShippingOption {
  id: number | string;
  name?: string;
  label?: string;
  title?: string;
  rate_minor?: number;
  price_minor?: number;
  amount_minor?: number;
  cost_minor?: number;
  price?: number;
}

const extractShippingFeeMinor = (opt: any): number | undefined => {
  const minor =
    opt?.rate_minor ??
    opt?.price_minor ??
    opt?.amount_minor ??
    opt?.cost_minor ??
    opt?.shipping_fee_minor;
  if (typeof minor === "number" && !Number.isNaN(minor)) return minor;

  const major = opt?.price ?? opt?.rate ?? opt?.amount ?? opt?.cost;
  if (typeof major === "number" && !Number.isNaN(major)) {
    return Math.round(major * 100);
  }
  return undefined;
};

const extractShippingMethodId = (item: any): number | string | undefined => {
  const candidate =
    item?.shipping_method_id ??
    item?.method_id ??
    item?.shipping_option_id ??
    item?.id;
  if (candidate !== undefined && candidate !== null && String(candidate) !== "") {
    return candidate;
  }
  return undefined;
};

export default function CheckoutPage() {
  const router = useRouter();
  const { items, guestToken, fetchCart, clearCart } = useCartStore();

  const [loading, setLoading] = useState(false);
  const [shippingLoading, setShippingLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "Dhaka",
    area: "",
    zipCode: "",
    paymentMethod: "cod",
    bkashNumber: "",
    orderNote: "",
    cardNumber: "",
    cardExpiry: "",
    cardCvv: "",
    cardName: "",
  });

  const [couponCode, setCouponCode] = useState("");
  const [discountMinor, setDiscountMinor] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [shippingChargeMinor, setShippingChargeMinor] = useState(6000); // 60 BDT default display
  const [shippingMethodId, setShippingMethodId] = useState<string>("");
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);

  const resolveShippingData = useCallback(
    async (cityVal: string, postalVal: string, token?: string | null) => {
      setShippingLoading(true);
      try {
        const headers: HeadersInit = {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(token ? { "X-Guest-Cart-Token": token } : {}),
        };

        // 1. Try POST /shipping/options
        const optionsRes = await fetch(`${API_BASE}/shipping/options`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            country_code: "BD",
            postal_code: (postalVal || "1200").trim(),
            city: cityVal,
          }),
        });

        if (optionsRes.ok) {
          const optionsJson = await optionsRes.json().catch(() => ({}));
          const rawList: any[] = Array.isArray(optionsJson?.data)
            ? optionsJson.data
            : Array.isArray(optionsJson?.data?.options)
            ? optionsJson.data.options
            : Array.isArray(optionsJson?.options)
            ? optionsJson.options
            : Array.isArray(optionsJson?.data?.methods)
            ? optionsJson.data.methods
            : [];

          const normalized: ShippingOption[] = rawList
            .map((opt) => {
              const id = extractShippingMethodId(opt);
              if (id === undefined) return null;
              return {
                ...opt,
                id,
                name:
                  opt?.name ||
                  opt?.label ||
                  opt?.title ||
                  `Shipping Option #${id}`,
              };
            })
            .filter(Boolean) as ShippingOption[];

          if (normalized.length > 0) {
            setShippingOptions(normalized);
            const first = normalized[0];
            setShippingMethodId(String(first.id));
            const fee = extractShippingFeeMinor(first);
            if (typeof fee === "number") {
              setShippingChargeMinor(fee);
            }
            return;
          }
        }

        // 2. Fallback: GET /shipping/areas
        const areasRes = await fetch(`${API_BASE}/shipping/areas`, {
          method: "GET",
          headers: { Accept: "application/json" },
          cache: "no-store",
        });

        if (areasRes.ok) {
          const areasJson = await areasRes.json().catch(() => ({}));
          const areas: any[] = Array.isArray(areasJson?.data)
            ? areasJson.data
            : Array.isArray(areasJson)
            ? areasJson
            : [];

          const areaOptions: ShippingOption[] = areas
            .map((area) => {
              const id = extractShippingMethodId(area);
              if (id === undefined) return null;
              return {
                ...area,
                id,
                name:
                  area?.name ||
                  area?.title ||
                  area?.city ||
                  `Shipping Area #${id}`,
              };
            })
            .filter(Boolean) as ShippingOption[];

          if (areaOptions.length > 0) {
            setShippingOptions(areaOptions);
            const matched =
              areaOptions.find((opt) =>
                String(opt.name || "")
                  .toLowerCase()
                  .includes(cityVal.toLowerCase())
              ) || areaOptions[0];

            setShippingMethodId(String(matched.id));
            const fee = extractShippingFeeMinor(matched);
            if (typeof fee === "number") {
              setShippingChargeMinor(fee);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load shipping methods:", err);
      } finally {
        setShippingLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (items.length === 0) {
      fetchCart();
    }
  }, [fetchCart, items.length]);

  useEffect(() => {
    resolveShippingData(formData.city, formData.zipCode, guestToken);
  }, [formData.city, formData.zipCode, guestToken, resolveShippingData]);

  // Store-এ item.price টাকায় (BDT) সংরক্ষিত আছে; API-তে minor unit (পয়সা)-এ পাঠাতে * 100
  const subtotalMinor = items.reduce(
    (acc, item) => acc + Math.round(item.price * 100) * item.quantity,
    0
  );
  const finalTotalMinor = Math.max(
    0,
    subtotalMinor + shippingChargeMinor - discountMinor
  );

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "city" && shippingOptions.length === 0) {
      setShippingChargeMinor(value.toLowerCase() === "dhaka" ? 6000 : 12000);
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    if (!shippingMethodId.trim()) {
      alert(
        "Shipping method ID could not be loaded from the server. Please check shipping methods or enter a valid Shipping Method ID."
      );
      return;
    }

    setLoading(true);

    try {
      const numericOrStringMethodId = /^\d+$/.test(shippingMethodId.trim())
        ? Number(shippingMethodId.trim())
        : shippingMethodId.trim();

      const authToken =
        typeof window !== "undefined"
          ? localStorage.getItem("auth_token") || localStorage.getItem("token")
          : null;

      const payload: Record<string, any> = {
        idempotency_key: crypto.randomUUID(),
        recipient_name: formData.name.trim(),
        line1: formData.address.trim(),
        country_code: "BD",
        city: formData.city,
        region: formData.area.trim() || formData.city,
        postal_code: formData.zipCode.trim() || undefined,
        shipping_method_id: numericOrStringMethodId,
        payment_method: formData.paymentMethod,
        guest_email: formData.email.trim() || undefined,
        phone: formData.phone.trim(),
        coupon_code:
          couponApplied && couponCode.trim() ? couponCode.trim() : undefined,
        notes: formData.orderNote.trim() || undefined,
        ...(formData.paymentMethod === "bkash" && formData.bkashNumber.trim()
          ? { bkash_number: formData.bkashNumber.trim() }
          : {}),
      };

      const headers: HeadersInit = {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(guestToken ? { "X-Guest-Cart-Token": guestToken } : {}),
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      };

      const res = await fetch(`${API_BASE}/checkout/place`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const validationErrors = data?.errors
          ? Object.values(data.errors).flat().join(", ")
          : "";
        throw new Error(
          validationErrors ||
            data?.message ||
            `Order placement failed (${res.status})`
        );
      }

      const orderNumber =
        data?.data?.order_number ||
        data?.order_number ||
        data?.data?.id ||
        data?.id ||
        "";

      clearCart();
      router.push(
        orderNumber
          ? `/order-success?id=${encodeURIComponent(String(orderNumber))}`
          : "/order-success"
      );
    } catch (error: any) {
      console.error("Checkout error:", error);
      alert(error?.message || "Something went wrong while placing order.");
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
    <div className="mx-auto px-4 py-8 container">
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-[#f76b1c] transition-colors">
          Home
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-gray-800 dark:text-gray-200 font-medium">
          Checkout
        </span>
      </nav>

      <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white mb-8">
        Secure Checkout
      </h1>

      <form
        onSubmit={handlePlaceOrder}
        className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
      >
        {/* Left Column: Forms */}
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
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-transparent focus:ring-2 focus:ring-[#f76b1c] outline-none text-sm transition-all"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1.5 block">
                  Email Address (Optional)
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
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
                  <option value="Dhaka">Inside Dhaka</option>
                  <option value="Outside Dhaka">Outside Dhaka</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1.5 block">
                  Postal / Zip Code
                </label>
                <input
                  type="text"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-transparent focus:ring-2 focus:ring-[#f76b1c] outline-none text-sm transition-all"
                />
              </div>

              {shippingOptions.length > 0 ? (
                <div className="md:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1.5 block">
                    Shipping Method <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={shippingMethodId}
                    onChange={(e) => {
                      const chosenId = e.target.value;
                      setShippingMethodId(chosenId);
                      const found = shippingOptions.find(
                        (opt) => String(opt.id) === chosenId
                      );
                      const fee = extractShippingFeeMinor(found);
                      if (typeof fee === "number") {
                        setShippingChargeMinor(fee);
                      }
                    }}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 focus:ring-2 focus:ring-[#f76b1c] outline-none text-sm transition-all cursor-pointer"
                  >
                    {shippingOptions.map((opt) => (
                      <option key={String(opt.id)} value={String(opt.id)}>
                        {opt.name}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="md:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1.5 block">
                    Shipping Method ID{" "}
                    {shippingLoading ? "(Loading...)" : "(Required by API)"}
                  </label>
                  <input
                    type="text"
                    value={shippingMethodId}
                    onChange={(e) => setShippingMethodId(e.target.value)}
                    placeholder="Enter valid shipping method ID from backend"
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-transparent focus:ring-2 focus:ring-[#f76b1c] outline-none text-sm transition-all"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Payment Method */}
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
                    <p className="text-xs text-gray-500">
                      Pay securely when your order arrives
                    </p>
                  </div>
                </div>
                <Truck className="h-5 w-5 text-gray-400" />
              </label>

              <label
                className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  formData.paymentMethod === "bkash"
                    ? "border-[#f76b1c] bg-orange-50/40 dark:bg-orange-950/10"
                    : "border-gray-200 dark:border-gray-700"
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="bkash"
                    checked={formData.paymentMethod === "bkash"}
                    onChange={handleChange}
                    className="w-4 h-4 accent-[#f76b1c]"
                  />
                  <div>
                    <span className="font-bold text-sm block text-gray-900 dark:text-white">
                      bKash / Mobile Banking
                    </span>
                    <p className="text-xs text-gray-500">
                      Instant digital wallet payment
                    </p>
                  </div>
                </div>
                <span className="bg-pink-100 text-pink-600 text-xs font-bold px-2 py-1 rounded">
                  bKash
                </span>
              </label>

              {formData.paymentMethod === "bkash" && (
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 space-y-2">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block">
                    Enter your bKash Account Number:
                  </label>
                  <input
                    type="tel"
                    name="bkashNumber"
                    placeholder="017XXXXXXXX"
                    value={formData.bkashNumber}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900 outline-none"
                  />
                </div>
              )}

              <label
                className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  formData.paymentMethod === "card"
                    ? "border-[#f76b1c] bg-orange-50/40 dark:bg-orange-950/10"
                    : "border-gray-200 dark:border-gray-700"
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={formData.paymentMethod === "card"}
                    onChange={handleChange}
                    className="w-4 h-4 accent-[#f76b1c]"
                  />
                  <div>
                    <span className="font-bold text-sm block text-gray-900 dark:text-white">
                      Credit / Debit Card
                    </span>
                    <p className="text-xs text-gray-500">
                      Visa, Mastercard, or American Express
                    </p>
                  </div>
                </div>
                <CreditCard className="h-5 w-5 text-gray-400" />
              </label>

              {formData.paymentMethod === "card" && (
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 space-y-3 mt-3">
                  <div>
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      name="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      value={formData.cardNumber}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900 outline-none focus:ring-1 focus:ring-[#f76b1c]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        name="cardExpiry"
                        placeholder="MM/YY"
                        value={formData.cardExpiry}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900 outline-none focus:ring-1 focus:ring-[#f76b1c]"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                        CVV
                      </label>
                      <input
                        type="text"
                        name="cardCvv"
                        placeholder="123"
                        value={formData.cardCvv}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900 outline-none focus:ring-1 focus:ring-[#f76b1c]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                      Name on Card
                    </label>
                    <input
                      type="text"
                      name="cardName"
                      placeholder="John Doe"
                      value={formData.cardName}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900 outline-none focus:ring-1 focus:ring-[#f76b1c]"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Order Note */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-xs">
            <h2 className="text-base font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4 text-[#f76b1c]" /> Order Notes
              (Optional)
            </h2>
            <textarea
              name="orderNote"
              rows={2}
              value={formData.orderNote}
              onChange={handleChange}
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
              {items.map((item) => (
                <div key={item.variant_id} className="flex items-center gap-3">
                  <div className="relative w-14 h-14 bg-gray-50 dark:bg-gray-800 rounded-xl overflow-hidden shrink-0 border border-gray-100 dark:border-gray-700">
                    <Image
                      src={item.image || "/images/product-not-found.webp"}
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
                  <p className="text-sm font-extrabold text-[#f76b1c]">
                    ৳{(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            {/* Coupon */}
            <div className="pt-2">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-xs bg-transparent uppercase outline-none focus:ring-1 focus:ring-[#f76b1c]"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (couponCode.trim()) setCouponApplied(true);
                  }}
                  className="bg-gray-900 dark:bg-gray-800 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  Apply
                </button>
              </div>
            </div>

            {/* Totals */}
            <div className="space-y-2.5 pt-4 border-t border-gray-100 dark:border-gray-800 text-sm">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Subtotal</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  ৳{(subtotalMinor / 100).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Delivery Fee ({formData.city})</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  ৳{(shippingChargeMinor / 100).toFixed(2)}
                </span>
              </div>
              {discountMinor > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span className="font-semibold">
                    -৳{(discountMinor / 100).toFixed(2)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-lg font-extrabold pt-3 border-t border-gray-100 dark:border-gray-800 text-gray-900 dark:text-white">
                <span>Total Payable</span>
                <span className="text-[#f76b1c]">
                  ৳{(finalTotalMinor / 100).toFixed(2)}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || shippingLoading}
              className="w-full bg-[#f76b1c] hover:bg-[#e05a12] disabled:opacity-70 text-white py-3.5 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 shadow-md cursor-pointer text-sm md:text-base"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <CheckCircle2 className="h-5 w-5" />
              )}
              {loading
                ? "Processing..."
                : `Place Order (৳${(finalTotalMinor / 100).toFixed(2)})`}
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