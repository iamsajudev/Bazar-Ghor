// components/pre-order/PreOrderGuideSections.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  ChevronDown,
  ShieldCheck,
  ArrowRight,
  HelpCircle,
} from "lucide-react";
import {
  PRE_ORDER_STEPS,
  PRE_ORDER_POLICY_CARDS,
  PRE_ORDER_FAQS,
} from "@/data/preOrderInfo";

export default function PreOrderGuideSections() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setOpenFaqIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <div className="container mx-auto px-4 py-12 md:py-16 space-y-16">
      {/* 1. How Pre-Order Works */}
      <section aria-labelledby="how-preorder-works">
        <div className="mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Simple Process
          </span>
          <h2
            id="how-preorder-works"
            className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight mt-1"
          >
            How Pre-Order Works
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {PRE_ORDER_STEPS.map((item) => (
            <div
              key={item.step}
              className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between"
            >
              <div>
                <span className="inline-flex items-center justify-center h-9 w-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-extrabold mb-4">
                  {item.step}
                </span>
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 2. Core Pre-Order Guidelines */}
      <section aria-labelledby="preorder-guidelines">
        <div className="mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Key Terms
          </span>
          <h2
            id="preorder-guidelines"
            className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight mt-1"
          >
            What You Should Know
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PRE_ORDER_POLICY_CARDS.map((card) => (
            <div
              key={card.id}
              className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-xs flex flex-col"
            >
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 mb-2">
                <ShieldCheck className="h-5 w-5 shrink-0" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {card.title}
                </h3>
              </div>

              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
                {card.summary}
              </p>

              <ul className="space-y-2.5 text-sm text-gray-600 dark:text-gray-300 mt-auto">
                {card.points.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Quick FAQ */}
      <section aria-labelledby="preorder-faq">
        <div className="mb-6 flex items-center gap-2.5">
          <HelpCircle className="h-6 w-6 text-emerald-600 shrink-0" />
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
              Quick Answers
            </span>
            <h2
              id="preorder-faq"
              className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight"
            >
              Pre-Order FAQs
            </h2>
          </div>
        </div>

        <div className="space-y-3">
          {PRE_ORDER_FAQS.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={faq.question}
                className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-xs"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  aria-expanded={isOpen}
                  className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span className="font-bold text-sm sm:text-base text-gray-900 dark:text-white">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 text-gray-500 shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-emerald-600" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-6 pb-5 text-sm text-gray-600 dark:text-gray-300 leading-relaxed border-t border-gray-50 dark:border-gray-800/70 pt-3">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Bottom Help & Browse CTA */}
      <section className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 shadow-xs">
        <div>
          <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">
            Have a question about an upcoming batch?
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Explore our catalog or reach out to our support team for assistance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors"
          >
            <span>Browse Shop</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-semibold transition-colors"
          >
            <span>Contact Support</span>
          </Link>
        </div>
      </section>
    </div>
  );
}