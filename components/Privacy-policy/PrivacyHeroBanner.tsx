// components/privacy-policy/PrivacyHeroBanner.tsx
import Link from "next/link";
import { ChevronRight, ShieldCheck, Clock } from "lucide-react";

interface PrivacyHeroBannerProps {
    title?: string;
    subtitle?: string;
    updatedAt?: string;
}

export default function PrivacyHeroBanner({
    title = "Privacy Policy",
    subtitle = "How we collect, use, protect, and respect your personal information.",
    updatedAt,
}: PrivacyHeroBannerProps) {
    return (
        <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-900 text-white">
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-emerald-500/15 blur-3xl"
            />

            <div className="container mx-auto px-4 py-14 md:py-20 relative z-10">
                <nav
                    aria-label="Breadcrumb"
                    className="flex items-center justify-center gap-2 text-xs md:text-sm text-emerald-200/80 mb-5"
                >
                    <Link href="/" className="hover:text-white transition-colors">
                        Home
                    </Link>
                    <ChevronRight className="h-4 w-4 text-emerald-300/60" />
                    <span className="font-semibold text-white">{title}</span>
                </nav>

                <div className="max-w-2xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-4 py-1.5 text-xs font-semibold tracking-wider uppercase text-emerald-200 mb-4">
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" />
                        <span>Data Protection &amp; Trust</span>
                    </div>

                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-3">
                        {title}
                    </h1>

                    <p className="text-sm md:text-base text-slate-200/90 leading-relaxed">
                        {subtitle}
                    </p>

                    {updatedAt && (
                        <div className="mt-5 inline-flex items-center gap-1.5 text-xs text-emerald-200/80">
                            <Clock className="h-3.5 w-3.5" />
                            <span>Last updated: {updatedAt}</span>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}