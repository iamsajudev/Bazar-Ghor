// components/contact/ContactBanner.tsx
import Link from "next/link";
import { ChevronRight, Sparkles } from "lucide-react";

interface ContactBannerProps {
    siteName?: string;
    tagline?: string;
    bgImageUrl?: string;
}

export default function ContactBanner({
    siteName = "BazarGhor",
    tagline = "Have a question about orders, delivery times, or bulk inquiries? Reach out to our team anytime.",
    bgImageUrl = "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1920&q=80",
}: ContactBannerProps) {
    return (
        <section className="relative isolate overflow-hidden bg-slate-950 text-white">
            {/* Background Image */}
            <div
                aria-hidden="true"
                className="absolute inset-0 -z-20 bg-cover bg-center bg-no-repeat scale-105 transition-transform duration-700"
                style={{ backgroundImage: `url("${bgImageUrl}")` }}
            />

            {/* Rich Dark Gradient + Subtle Blur Overlay */}
            <div
                aria-hidden="true"
                className="absolute inset-0 -z-10 bg-gradient-to-r from-slate-950/90 via-emerald-950/85 to-slate-900/85 backdrop-blur-[2px]"
            />

            {/* Decorative Ambient Glow */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-24 right-1/4 -z-10 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl"
            />

            <div className="container mx-auto px-4 pt-14 pb-24 md:pt-20 md:pb-28">
                {/* Breadcrumb */}
                <nav
                    aria-label="Breadcrumb"
                    className="flex items-center justify-center gap-2 text-xs md:text-sm text-emerald-200/80 mb-6"
                >
                    <Link href="/" className="hover:text-white transition-colors">
                        Home
                    </Link>
                    <ChevronRight className="h-4 w-4 text-emerald-300/60" />
                    <span className="font-semibold text-white">Contact Us</span>
                </nav>

                <div className="max-w-2xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-4 py-1.5 text-xs font-semibold tracking-wider uppercase text-emerald-200 mb-5 backdrop-blur-md">
                        <Sparkles className="h-3.5 w-3.5 text-emerald-300" />
                        <span>{siteName} Support Desk</span>
                    </div>

                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight mb-4">
                        Let&apos;s Start a{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-teal-200">
                            Conversation
                        </span>
                    </h1>

                    <p className="text-sm md:text-base text-slate-200/90 leading-relaxed max-w-xl mx-auto">
                        {tagline}
                    </p>
                </div>
            </div>
        </section>
    );
}