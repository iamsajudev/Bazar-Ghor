// components/contact/ContactMap.tsx
"use client";

import { useState, useEffect } from "react";
import { MapPin, ExternalLink } from "lucide-react";
import { SiteAddressItem } from "@/types/contact";

interface ContactMapProps {
    addresses?: SiteAddressItem[];
    fallbackAddress?: string;
    loading?: boolean;
}

export default function ContactMap({
    addresses = [],
    fallbackAddress = "213 W Saratoga, St # A, Baltimore, MD 21201",
    loading = false,
}: ContactMapProps) {
    const [selectedIndex, setSelectedIndex] = useState(0);

    // Reset selected index when API addresses load/change
    useEffect(() => {
        setSelectedIndex(0);
    }, [addresses]);

    const activeItem = addresses[selectedIndex];
    const activeAddress = activeItem?.address || fallbackAddress;
    const activeTitle = activeItem?.title || "Office Location";

    const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(
        activeAddress
    )}&output=embed`;

    return (
        <section className="w-full bg-gray-50/80 dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800">
            <div className="container mx-auto px-4 py-12 md:py-16">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
                    <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                            Location
                        </span>
                        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mt-0.5">
                            Visit Our Office
                        </h2>
                    </div>

                    <div className="flex flex-col sm:items-end gap-2">
                        {/* Multiple address tabs if API returns more than one */}
                        {addresses.length > 1 && (
                            <div className="flex flex-wrap gap-2">
                                {addresses.map((item, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => setSelectedIndex(idx)}
                                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${selectedIndex === idx
                                                ? "bg-emerald-600 text-white"
                                                : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-emerald-400"
                                            }`}
                                    >
                                        {item.title || `Location ${idx + 1}`}
                                    </button>
                                ))}
                            </div>
                        )}

                        <a
                            href={`https://maps.google.com/?q=${encodeURIComponent(
                                activeAddress
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs md:text-sm text-gray-500 dark:text-gray-400 hover:text-emerald-600 flex items-center gap-1.5 transition-colors"
                        >
                            <MapPin className="h-4 w-4 text-emerald-600 shrink-0" />
                            <span>
                                {activeTitle ? `${activeTitle}: ` : ""}
                                {activeAddress}
                            </span>
                            <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-70" />
                        </a>
                    </div>
                </div>

                {loading ? (
                    <div className="w-full h-[360px] md:h-[440px] rounded-2xl bg-gray-200/70 dark:bg-gray-800/70 animate-pulse" />
                ) : (
                    <div className="w-full h-[360px] md:h-[440px] rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm">
                        <iframe
                            key={activeAddress}
                            title={activeTitle}
                            src={mapSrc}
                            className="w-full h-full border-0"
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                        />
                    </div>
                )}
            </div>
        </section>
    );
}