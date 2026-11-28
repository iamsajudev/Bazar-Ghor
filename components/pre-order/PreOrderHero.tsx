// components/pre-order/PreOrderHero.tsx
import Link from "next/link";
import { ChevronRight, CalendarClock } from "lucide-react";
import { PRE_ORDER_META } from "@/data/preOrderInfo";

export default function PreOrderHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-900 text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -right-24 h-80 w-80 rounded-full bg-emerald-500/15 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-amber-400/10 blur-3xl"
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
          <span className="font-semibold text-white">Pre-Order</span>
        </nav>

        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-4 py-1.5 text-xs font-semibold tracking-wider uppercase text-emerald-200 mb-4">
            <CalendarClock className="h-3.5 w-3.5 text-emerald-300" />
            <span>{PRE_ORDER_META.badge}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            {PRE_ORDER_META.title}
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-slate-200/90 leading-relaxed max-w-2xl mx-auto">
            {PRE_ORDER_META.subtitle}
          </p>
        </div>

        <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto">
          {PRE_ORDER_META.highlights.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm px-4 py-4 text-center"
            >
              <p className="text-[11px] uppercase tracking-wider text-emerald-200/75 font-semibold">
                {item.label}
              </p>
              <p className="mt-1 text-sm sm:text-base font-bold text-white">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}