// components/shipping/ShippingPageClient.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ChevronRight,
  Truck,
  MapPin,
  Search,
  CheckCircle2,
  Info,
  Loader2,
  ChevronLeft,
  RotateCcw,
} from "lucide-react";
import { buildApiUrl } from "@/lib/api-url";
import { formatPrice } from "@/utils/format";
import { ShippingAreaItem, ShippingAreasPaginatedData, ShippingMethodItem, ShippingMethodsPayload } from "@/types/shipping";

const COUNTRY_OPTIONS = [
  { code: "BD", label: "Bangladesh (BD)" },
  { code: "US", label: "United States (US)" },
  { code: "GB", label: "United Kingdom (GB)" },
  { code: "AE", label: "United Arab Emirates (AE)" },
  { code: "IN", label: "India (IN)" },
];

function getMethodFeeMinor(method?: ShippingMethodItem | null): number {
  if (!method) return 0;
  return method.fee_minor ?? method.price_minor ?? method.amount_minor ?? 0;
}

function getMethodTitle(method: ShippingMethodItem): string {
  return method.name || method.title || method.code || `Method #${method.id}`;
}

export default function ShippingPageClient() {
  const [countryCode, setCountryCode] = useState("BD");

  // Shipping methods state
  const [methodsData, setMethodsData] = useState<ShippingMethodsPayload | null>(
    null
  );
  const [methodsLoading, setMethodsLoading] = useState(true);
  const [methodsError, setMethodsError] = useState<string | null>(null);

  // Shipping areas filters & pagination state
  const [regionInput, setRegionInput] = useState("");
  const [cityInput, setCityInput] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const [appliedFilters, setAppliedFilters] = useState({
    region: "",
    city: "",
    search: "",
  });
  const [page, setPage] = useState(1);

  const [areasData, setAreasData] = useState<ShippingAreasPaginatedData | null>(
    null
  );
  const [areasLoading, setAreasLoading] = useState(true);
  const [areasError, setAreasError] = useState<string | null>(null);

  // 1. Fetch shipping methods by country_code
  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    async function loadMethods() {
      setMethodsLoading(true);
      setMethodsError(null);

      try {
        const query = countryCode
          ? `?country_code=${encodeURIComponent(countryCode)}`
          : "";
        const res = await fetch(
          buildApiUrl(`/api/v1/shipping/methods${query}`),
          {
            method: "GET",
            headers: { Accept: "application/json" },
            cache: "no-store",
            signal: controller.signal,
          }
        );

        if (!res.ok) {
          throw new Error(`Failed to load shipping methods (${res.status})`);
        }

        const json = await res.json();
        const payload: ShippingMethodsPayload = json?.data ?? json ?? {};

        if (active && !controller.signal.aborted) {
          setMethodsData(payload);
        }
      } catch (err) {
        if (active && !controller.signal.aborted) {
          setMethodsError(
            err instanceof Error
              ? err.message
              : "Unable to load shipping methods."
          );
        }
      } finally {
        if (active && !controller.signal.aborted) {
          setMethodsLoading(false);
        }
      }
    }

    loadMethods();
    return () => {
      active = false;
      controller.abort();
    };
  }, [countryCode]);

  // 2. Fetch shipping areas with filters & pagination
  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    async function loadAreas() {
      setAreasLoading(true);
      setAreasError(null);

      try {
        const params = new URLSearchParams();
        if (countryCode.trim()) params.set("country_code", countryCode.trim());
        if (appliedFilters.region.trim())
          params.set("region", appliedFilters.region.trim());
        if (appliedFilters.city.trim())
          params.set("city", appliedFilters.city.trim());
        if (appliedFilters.search.trim())
          params.set("search", appliedFilters.search.trim());
        params.set("page", String(page));

        const res = await fetch(
          buildApiUrl(`/api/v1/shipping/areas?${params.toString()}`),
          {
            method: "GET",
            headers: { Accept: "application/json" },
            cache: "no-store",
            signal: controller.signal,
          }
        );

        if (!res.ok) {
          throw new Error(`Failed to load shipping areas (${res.status})`);
        }

        const json = await res.json();
        const paginated: ShippingAreasPaginatedData = json?.data ?? json ?? {};

        if (active && !controller.signal.aborted) {
          setAreasData(paginated);
        }
      } catch (err) {
        if (active && !controller.signal.aborted) {
          setAreasError(
            err instanceof Error
              ? err.message
              : "Unable to load shipping areas."
          );
        }
      } finally {
        if (active && !controller.signal.aborted) {
          setAreasLoading(false);
        }
      }
    }

    loadAreas();
    return () => {
      active = false;
      controller.abort();
    };
  }, [countryCode, appliedFilters, page]);

  const handleApplyFilters = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setPage(1);
      setAppliedFilters({
        region: regionInput,
        city: cityInput,
        search: searchInput,
      });
    },
    [regionInput, cityInput, searchInput]
  );

  const handleResetFilters = useCallback(() => {
    setRegionInput("");
    setCityInput("");
    setSearchInput("");
    setPage(1);
    setAppliedFilters({ region: "", city: "", search: "" });
  }, []);

  const methods = methodsData?.methods ?? [];
  const currencyCode = methodsData?.currency_code || "BDT";
  const areas: ShippingAreaItem[] = Array.isArray(areasData?.data)
    ? areasData.data
    : [];
  const currentPage = areasData?.current_page ?? page;
  const lastPage = areasData?.last_page ?? 1;
  const totalAreas = areasData?.total ?? areas.length;

  return (
    <div className="min-h-screen bg-gray-50/60 dark:bg-gray-950">
      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-900 text-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -right-24 h-80 w-80 rounded-full bg-emerald-500/15 blur-3xl"
        />

        <div className="container mx-auto px-4 py-14 md:py-18 relative z-10">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center justify-center gap-2 text-xs md:text-sm text-emerald-200/80 mb-5"
          >
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <ChevronRight className="h-4 w-4 text-emerald-300/60" />
            <span className="font-semibold text-white">Shipping</span>
          </nav>

          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-4 py-1.5 text-xs font-semibold tracking-wider uppercase text-emerald-200 mb-4">
              <Truck className="h-3.5 w-3.5 text-emerald-300" />
              <span>Delivery Methods &amp; Coverage</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-3">
              Shipping Information
            </h1>

            <p className="text-sm sm:text-base text-slate-200/90 leading-relaxed max-w-2xl mx-auto">
              Check available shipping methods, estimated delivery fees, and
              supported service areas across active delivery zones.
            </p>

            {/* Country Selector */}
            <div className="mt-7 inline-flex flex-wrap items-center justify-center gap-3 bg-white/10 border border-white/15 rounded-2xl px-4 py-2.5 backdrop-blur-sm">
              <label
                htmlFor="shipping-country-select"
                className="text-xs font-bold uppercase tracking-wider text-emerald-200"
              >
                Country:
              </label>
              <select
                id="shipping-country-select"
                value={countryCode}
                onChange={(e) => {
                  setCountryCode(e.target.value);
                  setPage(1);
                }}
                className="rounded-xl bg-slate-900 text-white border border-white/20 px-3 py-1.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-400 cursor-pointer"
              >
                {COUNTRY_OPTIONS.map((opt) => (
                  <option key={opt.code} value={opt.code}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 space-y-14 max-w-6xl">
        {/* Section 1: Shipping Methods */}
        <section aria-labelledby="shipping-methods-heading">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Available Options
              </span>
              <h2
                id="shipping-methods-heading"
                className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight mt-0.5"
              >
                Shipping Methods ({countryCode})
              </h2>
            </div>

            {!methodsLoading && methodsData?.checkout_mode && (
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-200/70 dark:border-emerald-800/60">
                  Mode: {methodsData.checkout_mode}
                </span>
                {typeof methodsData.shipping_method_required === "boolean" && (
                  <span className="px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold">
                    {methodsData.shipping_method_required
                      ? "Method Required at Checkout"
                      : "Method Optional"}
                  </span>
                )}
              </div>
            )}
          </div>

          {methodsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="h-44 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 animate-pulse"
                />
              ))}
            </div>
          ) : methodsError ? (
            <div
              role="alert"
              className="rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 p-5 text-sm text-red-700 dark:text-red-300"
            >
              {methodsError}
            </div>
          ) : (
            <>
              {methodsData?.note && (
                <div className="mb-6 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-800/50 p-4 flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
                  <Info className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">{methodsData.note}</p>
                </div>
              )}

              {methods.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {methods.map((method) => {
                    const feeMinor = getMethodFeeMinor(method);
                    const methodCurrency = method.currency_code || currencyCode;
                    const eta = method.estimated_days || method.delivery_time;
                    const isDefault =
                      Boolean(method.is_default) ||
                      (methodsData?.default_shipping &&
                        String(methodsData.default_shipping.id) ===
                          String(method.id));

                    return (
                      <div
                        key={method.id}
                        className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-xs hover:border-emerald-300 dark:hover:border-emerald-800 transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                              {getMethodTitle(method)}
                            </h3>
                            {isDefault && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 shrink-0">
                                <CheckCircle2 className="h-3 w-3" />
                                Default
                              </span>
                            )}
                          </div>

                          {method.description && (
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                              {method.description}
                            </p>
                          )}
                        </div>

                        <div className="pt-4 mt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-2">
                          <div>
                            <span className="text-[11px] uppercase tracking-wider text-gray-400 block">
                              Indicative Fee
                            </span>
                            <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                              {feeMinor === 0
                                ? "Free"
                                : formatPrice(feeMinor, methodCurrency)}
                            </span>
                          </div>

                          {eta && (
                            <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-lg">
                              {eta}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-8 text-center">
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                    No separate paid shipping methods listed for {countryCode}.
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    In Free COD or zone-based checkout modes, final shipping
                    is determined during checkout.
                  </p>
                </div>
              )}
            </>
          )}
        </section>

        {/* Section 2: Shipping Areas Lookup */}
        <section aria-labelledby="shipping-areas-heading">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Serviceable Locations
              </span>
              <h2
                id="shipping-areas-heading"
                className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight mt-0.5"
              >
                Shipping Areas ({totalAreas})
              </h2>
            </div>
          </div>

          {/* Filter Form */}
          <form
            onSubmit={handleApplyFilters}
            className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 mb-6 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end"
          >
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                Region / Division
              </label>
              <input
                type="text"
                value={regionInput}
                onChange={(e) => setRegionInput(e.target.value)}
                placeholder="e.g. Dhaka"
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                City
              </label>
              <input
                type="text"
                value={cityInput}
                onChange={(e) => setCityInput(e.target.value)}
                placeholder="e.g. Dhaka"
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                Search Area
              </label>
              <div className="relative">
                <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="e.g. Gulshan"
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="flex-1 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors cursor-pointer"
              >
                Search Areas
              </button>
              <button
                type="button"
                onClick={handleResetFilters}
                aria-label="Reset area filters"
                className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </form>

          {/* Areas Grid */}
          {areasLoading ? (
            <div className="flex items-center justify-center py-14">
              <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
            </div>
          ) : areasError ? (
            <div
              role="alert"
              className="rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 p-5 text-sm text-red-700 dark:text-red-300"
            >
              {areasError}
            </div>
          ) : areas.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {areas.map((item, idx) => {
                  const areaName =
                    item.name || item.area || `Location #${idx + 1}`;
                  const locationSub = [item.city, item.region || item.state]
                    .filter(Boolean)
                    .join(", ");

                  return (
                    <div
                      key={item.id ?? `${areaName}-${idx}`}
                      className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 flex items-start gap-3 shadow-2xs"
                    >
                      <div className="h-9 w-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center shrink-0">
                        <MapPin className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-sm text-gray-900 dark:text-white truncate">
                          {areaName}
                        </h3>
                        {locationSub && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                            {locationSub}
                          </p>
                        )}
                        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] text-gray-400">
                          {item.postal_code && (
                            <span>ZIP: {item.postal_code}</span>
                          )}
                          {item.zone_name && (
                            <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-medium">
                              {item.zone_name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination Controls */}
              {lastPage > 1 && (
                <div className="mt-8 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    disabled={currentPage <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="inline-flex items-center gap-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span>Previous</span>
                  </button>

                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 px-2">
                    Page {currentPage} of {lastPage}
                  </span>

                  <button
                    type="button"
                    disabled={currentPage >= lastPage}
                    onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
                    className="inline-flex items-center gap-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                  >
                    <span>Next</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-10 text-center text-sm text-gray-500">
              No shipping areas matched your current filter.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}