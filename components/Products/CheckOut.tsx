"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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

// Change this ID to your actual shipping method ID from DB/Admin (e.g. 2, 3, etc.)
const DEFAULT_SHIPPING_METHOD_ID = 2;

interface ShippingOption {
  id: number | string;
  name: string;
  feeMinor?: number;
  rate_minor?: number;
  price_minor?: number;
  amount_minor?: number;
  cost_minor?: number;
  shipping_fee_minor?: number;
  price?: number;
  rate?: number;
  amount?: number;
  cost?: number;
}

interface ShippingAreaItem {
  id?: number | string;
  shipping_method_id?: number | string;
  area?: string;
  city?: string;
  country_code?: string;
  postal_prefix?: string;
  postal_code?: string;
  region_code?: string;
  region?: string;
  name?: string;
  rate_minor?: number;
  price_minor?: number;
  price?: number;
}

const toMinorNumber = (val: unknown, isMajor = false): number | undefined => {
  if (typeof val === "number" && !Number.isNaN(val)) {
    return isMajor ? Math.round(val * 100) : Math.round(val);
  }
  if (typeof val === "string" && val.trim() !== "" && !Number.isNaN(Number(val))) {
    const parsed = Number(val);
    return isMajor ? Math.round(parsed * 100) : Math.round(parsed);
  }
  return undefined;
};

const extractShippingFeeMinor = (opt: any): number | undefined => {
  if (typeof opt?.feeMinor === "number" && !Number.isNaN(opt.feeMinor)) {
    return Math.round(opt.feeMinor);
  }

  const minor =
    opt?.rate_minor ??
    opt?.price_minor ??
    opt?.amount_minor ??
    opt?.cost_minor ??
    opt?.shipping_fee_minor;

  const parsedMinor = toMinorNumber(minor, false);
  if (parsedMinor !== undefined) return parsedMinor;

  const major = opt?.price ?? opt?.rate ?? opt?.amount ?? opt?.cost;
  return toMinorNumber(major, true);
};

const extractShippingMethodId = (item: any): number | string | undefined => {
  const candidate =
    item?.shipping_method_id ??
    item?.method_id ??
    item?.shipping_option_id ??
    item?.id;
  if (candidate !== undefined && candidate !== null && String(candidate).trim() !== "") {
    return candidate;
  }
  return undefined;
};

const extractListFromResponse = (payload: any): any[] => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.options)) return payload.data.options;
  if (Array.isArray(payload?.options)) return payload.options;
  if (Array.isArray(payload?.data?.methods)) return payload.data.methods;
  if (Array.isArray(payload?.methods)) return payload.methods;
  if (Array.isArray(payload?.data?.shipping_methods)) return payload.data.shipping_methods;
  if (Array.isArray(payload?.data?.areas)) return payload.data.areas;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  if (Array.isArray(payload?.data?.zones)) return payload.data.zones;
  return [];
};

const parseMethodIdForApi = (rawId: string): number | string => {
  const trimmed = rawId.trim();
  if (!trimmed) return DEFAULT_SHIPPING_METHOD_ID;
  return /^\d+$/.test(trimmed) ? Number(trimmed) : trimmed;
};

export default function CheckoutPage() {
  const router = useRouter();
  const { items, guestToken, fetchCart, clearCart } = useCartStore();

  const [loading, setLoading] = useState(false);
  const [quoteLoading, setQuoteLoading] = useState(false);

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
  const [shippingChargeMinor, setShippingChargeMinor] = useState(6000);
  const [shippingMethodId, setShippingMethodId] = useState<string>(
    String(DEFAULT_SHIPPING_METHOD_ID)
  );
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [shippingAreas, setShippingAreas] = useState<ShippingAreaItem[]>([]);
  const [serverTotalMinor, setServerTotalMinor] = useState<number | null>(null);

  const lastShippingKeyRef = useRef<string>("");

  const getRequestHeaders = useCallback(
    (tokenOverride?: string | null): HeadersInit => {
      const effectiveGuestToken =
        tokenOverride !== undefined ? tokenOverride : guestToken;
      const authToken =
        typeof window !== "undefined"
          ? localStorage.getItem("auth_token") || localStorage.getItem("token")
          : null;

      return {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(effectiveGuestToken ? { "X-Guest-Cart-Token": effectiveGuestToken } : {}),
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      };
    },
    [guestToken]
  );

  const fetchCheckoutQuote = useCallback(
    async (params: {
      methodIdStr?: string;
      coupon?: string;
      postalVal?: string;
      cityVal?: string;
      regionVal?: string;
      areaVal?: string;
      tokenOverride?: string | null;
      showAlertOnCouponError?: boolean;
    }) => {
      const parsedMethodId = parseMethodIdForApi(
        params.methodIdStr ?? shippingMethodId
      );

      setQuoteLoading(true);
      try {
        const body: Record<string, any> = {
          shipping_method_id: parsedMethodId,
          country_code: "BD",
          ...(params.cityVal?.trim() ? { city: params.cityVal.trim() } : {}),
          ...(params.regionVal?.trim()
            ? { region_code: params.regionVal.trim(), region: params.regionVal.trim() }
            : {}),
          ...(params.areaVal?.trim() ? { area: params.areaVal.trim() } : {}),
          ...(params.postalVal?.trim() ? { postal_code: params.postalVal.trim() } : {}),
          ...(params.coupon?.trim() ? { coupon_code: params.coupon.trim() } : {}),
        };

        const res = await fetch(`${API_BASE}/checkout/quote`, {
          method: "POST",
          headers: getRequestHeaders(params.tokenOverride),
          body: JSON.stringify(body),
        });

        const json = await res.json().catch(() => ({}));

        if (!res.ok) {
          if (params.showAlertOnCouponError) {
            setCouponApplied(false);
            setDiscountMinor(0);
            alert(json?.message || "Invalid coupon code.");
          }
          return;
        }

        const quote = json?.data?.quote || json?.data || json;

        const qShipping = toMinorNumber(
          quote?.shipping_minor ??
            quote?.shipping_fee_minor ??
            quote?.shipping_charge_minor ??
            quote?.delivery_fee_minor,
          false
        );
        if (qShipping !== undefined) {
          setShippingChargeMinor(qShipping);
        }

        const qDiscount = toMinorNumber(
          quote?.discount_minor ??
            quote?.coupon_discount_minor ??
            quote?.promo_discount_minor,
          false
        );
        if (qDiscount !== undefined) {
          setDiscountMinor(qDiscount);
          if (params.coupon?.trim()) {
            setCouponApplied(true);
          }
        } else if (params.coupon?.trim()) {
          setCouponApplied(true);
        }

        const qTotal = toMinorNumber(
          quote?.total_minor ??
            quote?.grand_total_minor ??
            quote?.payable_minor ??
            quote?.final_total_minor,
          false
        );
        setServerTotalMinor(qTotal !== undefined ? qTotal : null);

        if (params.showAlertOnCouponError && params.coupon?.trim()) {
          alert("Coupon applied!");
        }
      } catch (err) {
        console.error("Failed to fetch checkout quote:", err);
        if (params.showAlertOnCouponError) {
          alert("Could not verify coupon code right now.");
        }
      } finally {
        setQuoteLoading(false);
      }
    },
    [getRequestHeaders, shippingMethodId]
  );

  const resolveShippingData = useCallback(
    async (
      cityVal: string,
      postalVal: string,
      areaVal: string,
      token?: string | null
    ) => {
      const dedupeKey = `${cityVal}|${postalVal.trim()}|${areaVal.trim()}|${token || ""}`;
      if (lastShippingKeyRef.current === dedupeKey) return;
      lastShippingKeyRef.current = dedupeKey;

      try {
        const headers = getRequestHeaders(token);

        let areasList: ShippingAreaItem[] = [];
        try {
          const areasRes = await fetch(`${API_BASE}/shipping/areas`, {
            method: "GET",
            headers: { Accept: "application/json" },
            cache: "no-store",
          });
          const areasJson = await areasRes.json().catch(() => ({}));

          if (areasRes.ok) {
            areasList = extractListFromResponse(areasJson);
            setShippingAreas(areasList);
          }
        } catch (areaErr) {
          console.error("Failed to fetch shipping areas:", areaErr);
        }

        const matchedArea =
          areasList.find((a) => {
            const byArea =
              areaVal.trim() &&
              String(a.area || "")
                .toLowerCase()
                .includes(areaVal.trim().toLowerCase());
            const byCity =
              cityVal.trim() &&
              String(a.city || "")
                .toLowerCase()
                .includes(cityVal.trim().toLowerCase());
            return byArea || byCity;
          }) || areasList[0];

        const effectivePostal = (
          postalVal.trim() ||
          matchedArea?.postal_code ||
          matchedArea?.postal_prefix ||
          "1200"
        ).trim();

        const effectiveCountry = (matchedArea?.country_code || "BD").trim();
        const effectiveCity = (matchedArea?.city || cityVal || "Dhaka").trim();
        const effectiveRegion = (
          matchedArea?.region_code ||
          matchedArea?.region ||
          effectiveCity
        ).trim();
        const effectiveArea = (areaVal.trim() || matchedArea?.area || "").trim();

        const optionsPayload: Record<string, any> = {
          country_code: effectiveCountry,
          postal_code: effectivePostal,
          city: effectiveCity,
          region_code: effectiveRegion,
          ...(effectiveArea ? { area: effectiveArea } : {}),
        };

        const optionsRes = await fetch(`${API_BASE}/shipping/options`, {
          method: "POST",
          headers,
          body: JSON.stringify(optionsPayload),
        });

        const optionsJson = await optionsRes.json().catch(() => ({}));

        if (optionsRes.ok) {
          const rawList = extractListFromResponse(optionsJson);

          const normalized: ShippingOption[] = rawList
            .map((opt) => {
              const id = extractShippingMethodId(opt);
              if (id === undefined) return null;
              const fee = extractShippingFeeMinor(opt);
              const baseLabel =
                opt?.name ||
                opt?.label ||
                opt?.title ||
                `Shipping Option #${id}`;
              const displayLabel =
                typeof fee === "number" && !String(baseLabel).includes("৳")
                  ? `${baseLabel} - ৳${(fee / 100).toFixed(2)}`
                  : String(baseLabel);

              return {
                ...opt,
                id,
                name: displayLabel,
                feeMinor: fee,
              };
            })
            .filter(Boolean) as ShippingOption[];

          if (normalized.length > 0) {
            setShippingOptions(normalized);
            const matched =
              normalized.find((opt) =>
                String(opt.name || "")
                  .toLowerCase()
                  .includes(effectiveCity.toLowerCase())
              ) || normalized[0];

            const selectedIdStr = String(matched.id);
            setShippingMethodId(selectedIdStr);
            const fee = extractShippingFeeMinor(matched);
            if (typeof fee === "number") {
              setShippingChargeMinor(fee);
            }

            await fetchCheckoutQuote({
              methodIdStr: selectedIdStr,
              coupon: couponApplied ? couponCode : undefined,
              postalVal: effectivePostal,
              cityVal: effectiveCity,
              regionVal: effectiveRegion,
              areaVal: effectiveArea,
              tokenOverride: token,
            });
            return;
          }
        }

        if (areasList.length > 0) {
          const areaOptions: ShippingOption[] = areasList
            .map((area, idx) => {
              const id = extractShippingMethodId(area);
              if (id === undefined) return null;
              const fee = extractShippingFeeMinor(area);
              const labelParts = [
                area?.name,
                area?.area,
                area?.city,
                area?.postal_prefix ? `(${area.postal_prefix})` : "",
              ].filter(Boolean);
              const baseLabel =
                labelParts.length > 0
                  ? labelParts.join(" - ")
                  : `Shipping Area #${idx + 1}`;
              const displayLabel =
                typeof fee === "number" && !String(baseLabel).includes("৳")
                  ? `${baseLabel} - ৳${(fee / 100).toFixed(2)}`
                  : String(baseLabel);

              return {
                ...area,
                id,
                name: displayLabel,
                feeMinor: fee,
              };
            })
            .filter(Boolean) as ShippingOption[];

          if (areaOptions.length > 0) {
            setShippingOptions(areaOptions);
            const selectedIdStr = String(areaOptions[0].id);
            setShippingMethodId(selectedIdStr);
            const fee = extractShippingFeeMinor(areaOptions[0]);
            if (typeof fee === "number") {
              setShippingChargeMinor(fee);
            }
            return;
          }
        }

        setShippingOptions([]);
        setServerTotalMinor(null);
        setShippingChargeMinor(cityVal.toLowerCase() === "dhaka" ? 6000 : 12000);
      } catch (err) {
        console.error("Failed to load shipping methods:", err);
      }
    },
    [couponApplied, couponCode, fetchCheckoutQuote, getRequestHeaders]
  );

  useEffect(() => {
    if (items.length === 0) {
      fetchCart();
    }
  }, [fetchCart, items.length]);

  useEffect(() => {
    resolveShippingData(
      formData.city,
      formData.zipCode,
      formData.area,
      guestToken
    );
  }, [
    formData.city,
    formData.zipCode,
    formData.area,
    guestToken,
    resolveShippingData,
  ]);

  const subtotalMinor = items.reduce(
    (acc, item) =>
      acc + Math.round(Number(item.price || 0) * 100) * Number(item.quantity || 1),
    0
  );
  const calculatedTotalMinor = Math.max(
    0,
    subtotalMinor + shippingChargeMinor - discountMinor
  );
  const finalTotalMinor =
    typeof serverTotalMinor === "number" ? serverTotalMinor : calculatedTotalMinor;

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

  const handleApplyCoupon = async () => {
    const code = couponCode.trim();
    if (!code) return;

    await fetchCheckoutQuote({
      methodIdStr: shippingMethodId,
      coupon: code,
      postalVal: formData.zipCode,
      cityVal: formData.city,
      regionVal: formData.area,
      areaVal: formData.area,
      showAlertOnCouponError: true,
    });
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (items.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    setLoading(true);

    try {
      const matchedArea = shippingAreas[0];
      const effectivePostal = (
        formData.zipCode.trim() ||
        matchedArea?.postal_code ||
        matchedArea?.postal_prefix ||
        "1200"
      ).trim();

      const payload: Record<string, any> = {
        idempotency_key:
          typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
            ? crypto.randomUUID()
            : `order-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
        recipient_name: formData.name.trim() || "Customer",
        line1: formData.address.trim() || "Dhaka",
        country_code: "BD",
        city: formData.city || "Dhaka",
        region:
          formData.area.trim() || matchedArea?.region_code || formData.city || "Dhaka",
        ...(formData.area.trim() || matchedArea?.area
          ? { area: formData.area.trim() || matchedArea?.area }
          : {}),
        postal_code: effectivePostal,
        shipping_method_id: parseMethodIdForApi(shippingMethodId),
        payment_method: formData.paymentMethod,
        ...(formData.email.trim() ? { guest_email: formData.email.trim() } : {}),
        ...(formData.phone.trim() ? { phone: formData.phone.trim() } : {}),
        ...(couponApplied && couponCode.trim()
          ? { coupon_code: couponCode.trim() }
          : {}),
        ...(formData.orderNote.trim() ? { notes: formData.orderNote.trim() } : {}),
        ...(formData.paymentMethod === "bkash" && formData.bkashNumber.trim()
          ? { bkash_number: formData.bkashNumber.trim() }
          : {}),
      };

      const res = await fetch("/api/v1/checkout/place", {
        method: "POST",
        headers: getRequestHeaders(),
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 429) {
        throw new Error(
          data?.message ||
            "Too many requests. Please wait 1 minute and try placing the order again."
        );
      }

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
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-transparent focus:ring-2 focus:ring-[#f76b1c] outline-none text-sm transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1.5 block">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
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
                  Delivery Address
                </label>
                <textarea
                  name="address"
                  rows={3}
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-transparent focus:ring-2 focus:ring-[#f76b1c] outline-none text-sm resize-none transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1.5 block">
                  City / Region
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

              {shippingOptions.length > 0 && (
                <div className="md:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1.5 block">
                    Shipping Method
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
                      fetchCheckoutQuote({
                        methodIdStr: chosenId,
                        coupon: couponApplied ? couponCode : undefined,
                        postalVal: formData.zipCode,
                        cityVal: formData.city,
                        regionVal: formData.area,
                        areaVal: formData.area,
                      });
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
                      sizes="56px"
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
                    onChange={(e) => {
                      setCouponCode(e.target.value);
                      if (couponApplied) {
                        setCouponApplied(false);
                        setDiscountMinor(0);
                        setServerTotalMinor(null);
                      }
                    }}
                    className="w-full pl-9 pr-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-xs bg-transparent uppercase outline-none focus:ring-1 focus:ring-[#f76b1c]"
                  />
                </div>
                <button
                  type="button"
                  disabled={quoteLoading}
                  onClick={handleApplyCoupon}
                  className="bg-gray-900 dark:bg-gray-800 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-gray-800 disabled:opacity-60 transition-colors cursor-pointer"
                >
                  {quoteLoading ? "..." : "Apply"}
                </button>
              </div>
              {couponApplied && couponCode.trim() && (
                <p className="text-xs text-green-600 mt-1.5 font-medium">
                  Coupon &ldquo;{couponCode.trim().toUpperCase()}&rdquo; applied.
                </p>
              )}
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
              disabled={loading || quoteLoading}
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