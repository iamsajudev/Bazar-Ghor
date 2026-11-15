"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, Mail, Phone, MapPin, Send, MessageCircle } from "lucide-react";

export default function ContactPage() {
    const [formData, setFormData] = useState({ name: "", email: "", message: "" });
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
        setTimeout(() => {
            setSubmitted(false);
            setFormData({ name: "", email: "", message: "" });
        }, 3000);
    };

    return (
        <div className="container mx-auto px-4 py-12">
            <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                <Link href="/" className="hover:text-green-600">Home</Link>
                <ChevronRight className="h-4 w-4" />
                <span className="text-gray-800 dark:text-gray-200 font-medium">Contact Us</span>
            </nav>

            <div className="text-center mb-12">
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-3">
                    Get in Touch
                </h1>
                <p className="text-sm md:text-base text-gray-500 max-w-xl mx-auto">
                    Have a question or need help? We&apos;re here to assist you.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Contact Info */}
                <div className="space-y-4">
                    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-600 flex items-center justify-center shrink-0">
                            <MapPin className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-1">Address</h3>
                            <p className="text-sm text-gray-500">Rampura, Dhaka, Bangladesh</p>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-600 flex items-center justify-center shrink-0">
                            <Phone className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-1">Phone</h3>
                            <a href="tel:+8809642922922" className="text-sm text-gray-500 hover:text-green-600">+880 9642 922 922</a>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-600 flex items-center justify-center shrink-0">
                            <Mail className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-1">Email</h3>
                            <a href="mailto:contact@bazarghor.com" className="text-sm text-gray-500 hover:text-green-600">contact@bazarghor.com</a>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-600 flex items-center justify-center shrink-0">
                            <MessageCircle className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-1">WhatsApp</h3>
                            <a href="https://wa.me/8809612338833" target="_blank" className="text-sm text-gray-500 hover:text-green-600">+880 9612 338833</a>
                        </div>
                    </div>
                </div>

                {/* Contact Form */}
                <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Send us a Message</h2>

                    {submitted && (
                        <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-sm p-3 rounded-xl mb-4">
                            ✅ Your message has been sent successfully!
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-1 block">Name</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-transparent focus:ring-2 focus:ring-green-500 outline-none text-sm"
                                placeholder="Your name"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-1 block">Email</label>
                            <input
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-transparent focus:ring-2 focus:ring-green-500 outline-none text-sm"
                                placeholder="you@example.com"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-1 block">Message</label>
                            <textarea
                                required
                                rows={5}
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-transparent focus:ring-2 focus:ring-green-500 outline-none text-sm resize-none"
                                placeholder="Your message..."
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
                        >
                            <Send className="h-4 w-4" /> Send Message
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}