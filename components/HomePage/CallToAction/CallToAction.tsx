"use client";

import Link from "next/link";
import { ArrowRight, ShoppingBag, Sparkles } from "lucide-react";

export const CallToAction = () => {
    return (
        <section className="my-14">
            <div className="relative overflow-hidden rounded-3xl px-6 py-12 md:py-16 md:px-12 shadow-2xl">
                
                {/* ১. ব্যাকগ্রাউন্ড ইমেজ (সবচেয়ে নিচের লেয়ার) */}
                <div 
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: "url('https://images.unsplash.com/photo-1542838132-92c53300491e?w=1600&q=80')" }}
                />

                {/* ২. ডার্ক গ্রেডিয়েন্ট ওভারলে (টেক্সট স্পষ্ট করার জন্য) */}
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/95 via-emerald-900/90 to-emerald-900/70" />

                {/* ৩. হালকা গ্লো ইফেক্ট (আপনার রিকোয়েস্ট অনুযায়ী) */}
                <div className="absolute inset-0 bg-white/5 pointer-events-none" />

                {/* ৪. ডেকোরেটিভ ব্লার সার্কেল */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-black/20 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />

                {/* === মূল কন্টেন্ট === */}
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    {/* বাম দিকের টেক্সট */}
                    <div className="text-center md:text-left max-w-2xl">
                        <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md border border-white/20 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
                            <Sparkles className="h-3.5 w-3.5 text-yellow-300" />
                            Exclusive Offer
                        </span>
                        <h2 className="text-2xl md:text-4xl font-extrabold text-white leading-tight mb-3 drop-shadow-md">
                            Get <span className="text-yellow-400">20% Off</span> Your First Order
                        </h2>
                        <p className="text-emerald-50 text-sm md:text-base leading-relaxed mb-6 drop-shadow">
                            Stock up on your favorite organic essentials and enjoy free delivery on orders over $50. Offer valid for a limited time only!
                        </p>
                        <div className="flex flex-col sm:flex-row items-center gap-3">
                            <Link
                                href="/products"
                                className="inline-flex items-center justify-center gap-2 bg-white text-emerald-900 px-6 py-3 rounded-xl font-bold text-sm hover:bg-green-50 transition-all active:scale-95 shadow-lg w-full sm:w-auto"
                            >
                                <ShoppingBag className="h-4 w-4" />
                                <span>Shop Now</span>
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                            <Link
                                href="/offers"
                                className="inline-flex items-center justify-center gap-2 bg-transparent text-white border-2 border-white/30 px-6 py-3 rounded-xl font-bold text-sm hover:bg-white/10 transition-all w-full sm:w-auto"
                            >
                                <span>View Offers</span>
                            </Link>
                        </div>
                    </div>

                    {/* ডান দিকের ছবি */}
                    <div className="relative z-10 w-56 h-56 rounded-full overflow-visible border-4 border-white/20 shadow-2xl bg-white/10 backdrop-blur-md flex items-center justify-center animate-float">
                        <div className="w-full h-full rounded-full overflow-hidden">
                            <img
                                src="https://cdn.ghorerbazar.com/productImages/YPsni1793513651-light-1000x1000.jpg"
                                alt="Product"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="absolute -top-2 -right-2 z-20 bg-yellow-400 text-emerald-900 text-xs font-extrabold px-3 py-1 rounded-full shadow-md rotate-12 border-2 border-white">
                            20% OFF
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};