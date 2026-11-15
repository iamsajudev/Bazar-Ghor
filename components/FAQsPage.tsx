"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight, HelpCircle, Mail, Phone, MessageCircle } from "lucide-react";
import { FAQ_DATA } from "@/data/faqs";

export default function FAQsPage() {
    const [openIndex, setOpenIndex] = useState<string | null>(null);
    const [activeCategory, setActiveCategory] = useState(FAQ_DATA[0].category);

    const toggleQuestion = (id: string) => {
        setOpenIndex(openIndex === id ? null : id);
    };

    const currentFAQs = FAQ_DATA.find((f) => f.category === activeCategory)?.questions || [];

    return (
        <div className="container mx-auto px-4 py-12">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                <Link href="/" className="hover:text-green-600">Home</Link>
                <ChevronRight className="h-4 w-4" />
                <span className="text-gray-800 dark:text-gray-200 font-medium">FAQs</span>
            </nav>

            {/* হেডার */}
            <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-green-50 dark:bg-green-950/30 text-green-600 mb-4">
                    <HelpCircle className="h-8 w-8" />
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-3">
                    Frequently Asked Questions
                </h1>
                <p className="text-sm md:text-base text-gray-500 max-w-xl mx-auto">
                    Find answers to common questions about orders, delivery, returns, and more.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* ক্যাটাগরি সাইডবার */}
                <aside className="lg:col-span-1">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 sticky top-32">
                        <h2 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-3 px-2">
                            Categories
                        </h2>
                        <nav className="space-y-1">
                            {FAQ_DATA.map((cat) => (
                                <button
                                    key={cat.category}
                                    onClick={() => {
                                        setActiveCategory(cat.category);
                                        setOpenIndex(null);
                                    }}
                                    className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                                        activeCategory === cat.category
                                            ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                                            : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                                    }`}
                                >
                                    {cat.category}
                                </button>
                            ))}
                        </nav>
                    </div>
                </aside>

                {/* প্রশ্ন-উত্তর */}
                <div className="lg:col-span-3">
                    <div className="space-y-3">
                        {currentFAQs.map((faq, idx) => {
                            const id = `${activeCategory}-${idx}`;
                            const isOpen = openIndex === id;
                            return (
                                <div
                                    key={id}
                                    className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden"
                                >
                                    <button
                                        onClick={() => toggleQuestion(id)}
                                        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                                    >
                                        <span className="text-sm md:text-base font-semibold text-gray-800 dark:text-gray-200">
                                            {faq.q}
                                        </span>
                                        <ChevronDown
                                            className={`h-5 w-5 text-gray-400 shrink-0 transition-transform duration-300 ${
                                                isOpen ? "rotate-180" : ""
                                            }`}
                                        />
                                    </button>
                                    <div
                                        className={`overflow-hidden transition-all duration-300 ease-in-out ${
                                            isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                                        }`}
                                    >
                                        <p className="px-5 pb-4 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                            {faq.a}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* সাহায্য সেকশন */}
            <div className="mt-16 bg-gradient-to-r from-green-700 to-emerald-700 rounded-3xl p-8 md:p-12 text-center">
                <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-3">
                    Still have questions?
                </h2>
                <p className="text-green-100 text-sm md:text-base mb-6 max-w-lg mx-auto">
                    Our support team is here to help. Reach out to us and we&apos;ll respond as soon as possible.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <a
                        href="tel:+8809612338833"
                        className="inline-flex items-center gap-2 bg-white text-green-800 px-6 py-3 rounded-xl font-bold text-sm hover:bg-green-50 transition-colors w-full sm:w-auto justify-center"
                    >
                        <Phone className="h-4 w-4" /> Call Us
                    </a>
                    <a
                        href="mailto:contact@bazarghor.com"
                        className="inline-flex items-center gap-2 bg-transparent text-white border-2 border-white/30 px-6 py-3 rounded-xl font-bold text-sm hover:bg-white/10 transition-colors w-full sm:w-auto justify-center"
                    >
                        <Mail className="h-4 w-4" /> Email Support
                    </a>
                    <a
                        href="https://wa.me/8809612338833"
                        target="_blank"
                        className="inline-flex items-center gap-2 bg-[#25D366] text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-[#1da851] transition-colors w-full sm:w-auto justify-center"
                    >
                        <MessageCircle className="h-4 w-4" /> WhatsApp
                    </a>
                </div>
            </div>
        </div>
    );
}