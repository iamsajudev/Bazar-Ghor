"use client";

import Link from "next/link";
import Image from "next/image";
import {
    ChevronRight, Leaf, ShieldCheck, Truck, Heart,
    Users, Package, Star, ArrowRight
} from "lucide-react";
import { ABOUT_DATA } from "@/data/about";

const BANNER_BG_IMAGE =
    "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=1600&q=80";

const iconMap: Record<string, React.ElementType> = {
    Leaf: Leaf,
    ShieldCheck: ShieldCheck,
    Truck: Truck,
    Heart: Heart,
    Users: Users,
    Package: Package,
    Star: Star,
};

export default function AboutClient() {
    return (
        <div className="min-h-screen bg-white dark:bg-gray-950">
            {/* Hero Section with Background Image */}
            <section className="relative bg-gradient-to-br from-green-900 via-emerald-900 to-slate-950 text-white py-20 md:py-32 overflow-hidden">
                <Image
                    src={BANNER_BG_IMAGE}
                    alt="Bismillah Body Oils Banner"
                    fill
                    priority
                    className="object-cover object-center opacity-35"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-emerald-950/75 to-green-900/60" />
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl -mr-20 -mt-20" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/20 rounded-full blur-3xl -ml-20 -mb-20" />

                <div className="container mx-auto px-4 relative z-10">
                    <nav className="flex items-center gap-2 text-sm text-green-200 mb-6">
                        <Link href="/" className="hover:text-white">Home</Link>
                        <ChevronRight className="h-4 w-4" />
                        <span className="text-white font-medium">About Us</span>
                    </nav>

                    <div className="max-w-3xl">
                        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
                            {ABOUT_DATA.hero.title}
                        </h1>
                        <p className="text-lg md:text-xl text-green-100 leading-relaxed max-w-2xl">
                            {ABOUT_DATA.hero.subtitle}
                        </p>
                    </div>
                </div>
            </section>

            {/* Story Section */}
            <section className="py-16 md:py-24">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl">
                            <Image
                                src={ABOUT_DATA.story.image}
                                alt="Bismillah Body Oils Story"
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div>
                            <span className="text-xs font-bold uppercase tracking-wider text-green-600 dark:text-green-400 mb-3 block">
                                Our Journey
                            </span>
                            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-6">
                                {ABOUT_DATA.story.title}
                            </h2>
                            <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                                {ABOUT_DATA.story.content}
                            </p>
                            <Link
                                href="/shop"
                                className="inline-flex items-center gap-2 text-green-600 font-bold hover:gap-3 transition-all"
                            >
                                Explore Our Body Oils <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 bg-gray-50 dark:bg-gray-900">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {ABOUT_DATA.stats.map((stat, idx) => (
                            <div key={idx} className="text-center p-6 bg-white dark:bg-gray-950 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                                <p className="text-4xl md:text-5xl font-black text-green-600 dark:text-green-500 mb-2">
                                    {stat.value}
                                </p>
                                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                                    {stat.label}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="py-16 md:py-24">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <span className="text-xs font-bold uppercase tracking-wider text-green-600 dark:text-green-400 mb-3 block">
                            What We Stand For
                        </span>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
                            Our Core Values
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {ABOUT_DATA.values.map((value, idx) => {
                            const Icon = iconMap[value.icon] || Leaf;
                            return (
                                <div key={idx} className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-shadow">
                                    <div className="w-12 h-12 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-600 flex items-center justify-center mb-4">
                                        <Icon className="h-6 w-6" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                                        {value.title}
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                        {value.description}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="py-16 md:py-24 bg-gray-50 dark:bg-gray-900">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <span className="text-xs font-bold uppercase tracking-wider text-green-600 dark:text-green-400 mb-3 block">
                            Meet the Team
                        </span>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
                            The People Behind Bismillah Body Oils
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {ABOUT_DATA.team.map((member, idx) => (
                            <div key={idx} className="bg-white dark:bg-gray-950 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800">
                                <div className="relative aspect-square">
                                    <Image
                                        src={member.image}
                                        alt={member.name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div className="p-4 text-center">
                                    <h3 className="text-base font-bold text-gray-900 dark:text-white">
                                        {member.name}
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {member.role}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 bg-gradient-to-r from-green-700 to-emerald-700">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
                        Ready to Experience Pure Body Oils?
                    </h2>
                    <p className="text-green-100 text-base md:text-lg mb-8 max-w-2xl mx-auto">
                        Shop our collection of 100% pure, alcohol-free body oils and fragrance blends across the U.S.
                    </p>
                    <Link
                        href="/shop"
                        className="inline-flex items-center gap-2 bg-white text-green-800 px-8 py-4 rounded-xl font-bold hover:bg-green-50 transition-colors"
                    >
                        Shop Now <ArrowRight className="h-5 w-5" />
                    </Link>
                </div>
            </section>
        </div>
    );
}