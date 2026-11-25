"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, Mail } from "lucide-react";
import { FaFacebookF, FaTwitter, FaInstagram } from "react-icons/fa";
import { MOCK_CATEGORIES } from "@/data/products";

export const TopFooter = () => {
    // ✅ ডাইনামিক ক্যাটাগরি লিংক
    const shopByLinks = MOCK_CATEGORIES.map((cat) => ({
        name: cat.name,
        href: `/category/${cat.slug}`,
    }));

    // ✅ ডাইনামিক ফুটার স্ট্রাকচার
    const footerLinks = [
        {
            title: "Information",
            links: [
                { name: "About us", href: "/about" },
                { name: "Contact us", href: "/contact" },
                { name: "Company Information", href: "/company-information" },
                { name: "Ghorer Bazar Stories", href: "/stories" },
                { name: "Terms & Conditions", href: "/terms-conditions" },
                { name: "Privacy Policy", href: "/privacy-policy" },
                { name: "Careers", href: "/careers" },
            ],
        },
        {
            title: "Shop By",
            links: shopByLinks, // ✅ ডাইনামিক ক্যাটাগরি
        },
        {
            title: "Support",
            links: [
                { name: "Support Center", href: "/support" },
                { name: "How to Order", href: "/how-to-order" },
                { name: "Order Tracking", href: "/track-order" },
                { name: "Payment", href: "/payment" },
                { name: "Shipping", href: "/shipping" },
                { name: "FAQ", href: "/faqs" },
                { name: "Blogs", href: "/blog" },
            ],
        },
        {
            title: "Consumer Policy",
            links: [
                { name: "Happy Return", href: "/happy-return" },
                { name: "Refund Policy", href: "/refund-policy" },
                { name: "Exchange", href: "/exchange" },
                { name: "Cancellation", href: "/cancellation" },
                { name: "Pre-Order", href: "/pre-order" },
                { name: "Extra Discount", href: "/extra-discount" },
            ],
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 py-12">
            {/* Column 1: Logo & Contact Info (2 cols) */}
            <div className="lg:col-span-2">
                <Link href="/" className="flex items-center shrink-0 group mb-4 inline-block">
                    <div className="relative h-22 w-46">
                        <Image
                            src="/images/logo-main.png"
                            alt="BazarGhor Logo"
                            fill
                            priority
                            className="object-contain object-left group-hover:scale-105 transition-transform duration-200"
                        />
                    </div>
                </Link>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                    Ghorer Bazar is an e-commerce platform dedicated to providing safe and reliable food to every home.
                </p>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 mt-0.5 text-gray-400" />
                        <span>213 W Saratoga, St # A Baltimore, MD 21201</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <a href="tel:+8809642922922" className="hover:text-green-600">+8809642922922</a>
                    </div>
                    <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <a href="mailto:contact@ghorerbazar.com" className="hover:text-green-600">contact@ghorerbazar.com</a>
                    </div>
                </div>

                {/* Social Icons */}
                <div className="flex items-center gap-3 mt-6">
                    <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-orange-100 dark:bg-gray-800 text-orange-500 rounded-full flex items-center justify-center hover:bg-orange-500 hover:text-white transition-colors">
                        <FaFacebookF className="h-4 w-4" />
                    </a>
                    <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-orange-100 dark:bg-gray-800 text-orange-500 rounded-full flex items-center justify-center hover:bg-orange-500 hover:text-white transition-colors">
                        <FaTwitter className="h-4 w-4" />
                    </a>
                    <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-orange-100 dark:bg-gray-800 text-orange-500 rounded-full flex items-center justify-center hover:bg-orange-500 hover:text-white transition-colors">
                        <FaInstagram className="h-4 w-4" />
                    </a>
                </div>

                {/* App Download */}
                <div className="mt-6">
                    <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">Download App on Mobile :</h4>
                    <div className="flex gap-2">
                        <a href="https://play.google.com" target="_blank" rel="noopener noreferrer" className="h-9 w-28 bg-black rounded flex items-center justify-center text-white text-[10px] hover:bg-gray-800 transition-colors">
                            Google Play
                        </a>
                        <a href="https://apps.apple.com" target="_blank" rel="noopener noreferrer" className="h-9 w-28 bg-black rounded flex items-center justify-center text-white text-[10px] hover:bg-gray-800 transition-colors">
                            App Store
                        </a>
                    </div>
                </div>
            </div>

            {/* Columns 2-5: Links */}
            {footerLinks.map((column) => (
                <div key={column.title}>
                    <h4 className="text-base font-bold text-gray-800 dark:text-gray-200 mb-4">{column.title}</h4>
                    <ul className="space-y-2.5">
                        {column.links.map((link) => (
                            <li key={link.name}>
                                <Link href={link.href} className="text-sm text-gray-600 dark:text-gray-400 hover:text-orange-500 transition-colors">
                                    {link.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
};