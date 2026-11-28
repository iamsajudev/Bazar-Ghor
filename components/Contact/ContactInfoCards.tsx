// components/contact/ContactInfoCards.tsx
"use client";

import type { SiteSettings } from "@/types/contact";
import {
    Mail,
    Phone,
    MapPin,
    UserCheck,
    Clock,
    Globe,
    ExternalLink,
    Share2,
} from "lucide-react";
import { FaFacebook } from "react-icons/fa";
import { LiaLinkedin } from "react-icons/lia";

interface ContactInfoCardsProps {
    settings?: SiteSettings | null;
    loading?: boolean;
}

const DAY_ORDER = [
    "saturday",
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
];

function formatDayLabel(key: string) {
    return key.charAt(0).toUpperCase() + key.slice(1, 3);
}

function SocialIcon({ iconClass, url }: { iconClass?: string; url?: string }) {
    const key = `${iconClass || ""} ${url || ""}`.toLowerCase();

    if (key.includes("facebook")) {
        return <FaFacebook className="h-4 w-4" />;
    }

    if (key.includes("linkedin")) {
        return <LiaLinkedin className="h-4 w-4" />;
    }

    if (
        key.includes("twitter") ||
        key.includes("x-twitter") ||
        key.includes("x.com") ||
        key.includes("toxa")
    ) {
        return (
            <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-3.5 w-3.5"
                aria-hidden="true"
            >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
        );
    }

    if (key.includes("globe") || key.includes("website")) {
        return <Globe className="h-4 w-4" />;
    }

    return <Share2 className="h-4 w-4" />;
}

export default function ContactInfoCards({
    settings,
    loading = false,
}: ContactInfoCardsProps) {
    const addresses = settings?.contact?.addresses || [];
    const phones = settings?.contact?.phones || [];
    const emails = settings?.contact?.emails || [];
    const contactPerson = settings?.contact?.contact_person;
    const businessHours = settings?.business_hours;
    const socialLinks = settings?.social_links || [];

    if (loading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3, 4].map((item) => (
                    <div
                        key={item}
                        className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 animate-pulse flex items-start gap-4"
                    >
                        <div className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-gray-800 shrink-0" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 w-28 bg-gray-200 dark:bg-gray-800 rounded" />
                            <div className="h-3.5 w-48 bg-gray-100 dark:bg-gray-800/70 rounded" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Dynamic Addresses */}
            {addresses.length > 0 && (
                <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-xs hover:border-emerald-200 dark:hover:border-emerald-900/50 transition-all">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center shrink-0">
                            <MapPin className="h-6 w-6" />
                        </div>
                        <div className="space-y-2.5 flex-1">
                            <h3 className="font-bold text-gray-900 dark:text-gray-100">
                                Our Location{addresses.length > 1 ? "s" : ""}
                            </h3>
                            {addresses.map((item, idx) => (
                                <div key={idx} className="text-sm">
                                    {item.title && (
                                        <span className="font-semibold text-gray-700 dark:text-gray-300 block text-xs uppercase tracking-wider mb-0.5">
                                            {item.title}
                                        </span>
                                    )}
                                    <a
                                        href={`https://maps.google.com/?q=${encodeURIComponent(
                                            item.address
                                        )}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-gray-500 dark:text-gray-400 hover:text-emerald-600 transition-colors inline-flex items-center gap-1"
                                    >
                                        <span>{item.address}</span>
                                        <ExternalLink className="h-3 w-3 shrink-0 opacity-70" />
                                    </a>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Dynamic Phones */}
            {phones.length > 0 && (
                <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-xs hover:border-emerald-200 dark:hover:border-emerald-900/50 transition-all">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center shrink-0">
                            <Phone className="h-6 w-6" />
                        </div>
                        <div className="space-y-2 flex-1">
                            <h3 className="font-bold text-gray-900 dark:text-gray-100">
                                Phone &amp; Helpline
                            </h3>
                            {phones.map((item, idx) => (
                                <div key={idx} className="text-sm">
                                    {item.title && (
                                        <span className="text-xs font-medium text-gray-400 mr-2">
                                            {item.title}:
                                        </span>
                                    )}
                                    <a
                                        href={`tel:${item.phone.replace(/\s+/g, "")}`}
                                        className="text-gray-600 dark:text-gray-300 font-medium hover:text-emerald-600 transition-colors"
                                    >
                                        {item.phone}
                                    </a>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Dynamic Emails */}
            {emails.length > 0 && (
                <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-xs hover:border-emerald-200 dark:hover:border-emerald-900/50 transition-all">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center shrink-0">
                            <Mail className="h-6 w-6" />
                        </div>
                        <div className="space-y-2 flex-1">
                            <h3 className="font-bold text-gray-900 dark:text-gray-100">
                                Email Support
                            </h3>
                            {emails.map((item, idx) => (
                                <div key={idx} className="text-sm">
                                    {item.title && (
                                        <span className="text-xs font-medium text-gray-400 mr-2">
                                            {item.title}:
                                        </span>
                                    )}
                                    <a
                                        href={`mailto:${item.email}`}
                                        className="text-gray-600 dark:text-gray-300 font-medium hover:text-emerald-600 transition-colors break-all"
                                    >
                                        {item.email}
                                    </a>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Dynamic Contact Person */}
            {contactPerson && contactPerson.name && (
                <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-xs hover:border-emerald-200 dark:hover:border-emerald-900/50 transition-all">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center shrink-0">
                            <UserCheck className="h-6 w-6" />
                        </div>
                        <div className="space-y-1 text-sm">
                            <h3 className="font-bold text-gray-900 dark:text-gray-100">
                                Direct Contact Person
                            </h3>
                            <p className="font-semibold text-gray-800 dark:text-gray-200">
                                {contactPerson.name}
                                {contactPerson.designation && (
                                    <span className="font-normal text-gray-500">
                                        {" "}
                                        — {contactPerson.designation}
                                    </span>
                                )}
                            </p>
                            {contactPerson.phone && (
                                <p>
                                    <a
                                        href={`tel:${contactPerson.phone.replace(/\s+/g, "")}`}
                                        className="text-gray-500 hover:text-emerald-600"
                                    >
                                        {contactPerson.phone}
                                    </a>
                                </p>
                            )}
                            {contactPerson.email && (
                                <p>
                                    <a
                                        href={`mailto:${contactPerson.email}`}
                                        className="text-gray-500 hover:text-emerald-600"
                                    >
                                        {contactPerson.email}
                                    </a>
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Dynamic Business Hours */}
            {businessHours && Object.keys(businessHours).length > 0 && (
                <div className="bg-gradient-to-br from-emerald-50/80 to-teal-50/50 dark:from-emerald-950/30 dark:to-slate-900 border border-emerald-100 dark:border-emerald-900/40 rounded-2xl p-5">
                    <div className="flex items-center gap-2.5 mb-3">
                        <Clock className="h-5 w-5 text-emerald-600 shrink-0" />
                        <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100">
                            Business Hours
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 gap-1.5 text-xs">
                        {DAY_ORDER.filter((day) => businessHours[day]).map((day) => {
                            const info = businessHours[day];
                            return (
                                <div
                                    key={day}
                                    className="flex items-center justify-between py-1 border-b border-emerald-100/70 dark:border-emerald-900/30 last:border-none"
                                >
                                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                                        {formatDayLabel(day)}
                                    </span>
                                    {info.closed ? (
                                        <span className="px-2 py-0.5 rounded-full bg-red-100/80 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-medium">
                                            Closed
                                        </span>
                                    ) : (
                                        <span className="text-gray-600 dark:text-gray-400 tabular-nums">
                                            {info.open} – {info.close}
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Dynamic Social Links */}
            {socialLinks.length > 0 && (
                <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 flex items-center justify-between gap-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                        Follow Us
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                        {socialLinks.map((social, idx) => (
                            <a
                                key={idx}
                                href={social.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={`Social link ${idx + 1}`}
                                className="w-9 h-9 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 text-gray-600 dark:text-gray-300 hover:text-emerald-600 flex items-center justify-center transition-colors"
                            >
                                <SocialIcon iconClass={social.icon_class} url={social.url} />
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}