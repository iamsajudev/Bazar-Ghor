// components/Contact/ContactForm.tsx
"use client";

import { useState } from "react";
import { Send, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { buildApiUrl } from "@/lib/api-url";

interface ContactFormPayload {
    name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
    website: string; // Honeypot field — must remain empty
}

const INITIAL_FORM: ContactFormPayload = {
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    website: "",
};

export default function ContactForm() {
    const [formData, setFormData] = useState<ContactFormPayload>(INITIAL_FORM);
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        if (fieldErrors[name]) {
            setFieldErrors((prev) => {
                const updated = { ...prev };
                delete updated[name];
                return updated;
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSuccessMessage(null);
        setErrorMessage(null);
        setFieldErrors({});

        if (formData.message.trim().length < 5) {
            setFieldErrors({
                message: ["Message must be at least 5 characters long."],
            });
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(buildApiUrl("/api/v1/contact"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({
                    name: formData.name.trim(),
                    email: formData.email.trim(),
                    phone: formData.phone.trim() || undefined,
                    subject: formData.subject.trim() || undefined,
                    message: formData.message.trim(),
                    website: formData.website,
                }),
            });

            const result = await response.json().catch(() => null);

            if (response.status === 201 || response.ok) {
                setSuccessMessage(
                    result?.data?.message ||
                    "Your message has been sent successfully! We will get back to you soon."
                );
                setFormData(INITIAL_FORM);
                return;
            }

            if (response.status === 422) {
                setErrorMessage(
                    result?.message || "Please check the highlighted fields and try again."
                );
                if (result?.errors) {
                    setFieldErrors(result.errors);
                }
                return;
            }

            if (response.status === 429) {
                setErrorMessage(
                    "Too many requests. Please wait a minute before sending another message."
                );
                return;
            }

            setErrorMessage(
                result?.message || "Something went wrong. Please try again later."
            );
        } catch {
            setErrorMessage(
                "Network error. Please check your internet connection and try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 sm:p-8 md:p-10 shadow-lg shadow-slate-900/5">
            <div className="mb-6">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                    Direct Inquiry
                </span>
                <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white mt-1">
                    Send Us a Message
                </h2>
                <p className="text-xs md:text-sm text-gray-500 mt-1.5">
                    Fill out the details below and our support specialist will reply as
                    soon as possible.
                </p>
            </div>

            {successMessage && (
                <div
                    role="alert"
                    className="bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-sm p-4 rounded-xl mb-6 flex items-start gap-2.5"
                >
                    <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
                    <span>{successMessage}</span>
                </div>
            )}

            {errorMessage && (
                <div
                    role="alert"
                    className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm p-4 rounded-xl mb-6 flex items-start gap-2.5"
                >
                    <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Honeypot anti-spam field */}
                <div className="hidden" aria-hidden="true">
                    <label htmlFor="website">Website</label>
                    <input
                        id="website"
                        name="website"
                        type="text"
                        tabIndex={-1}
                        autoComplete="off"
                        value={formData.website}
                        onChange={handleChange}
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label
                            htmlFor="contact-name"
                            className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 block"
                        >
                            Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="contact-name"
                            name="name"
                            type="text"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/40 focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm transition-all"
                            placeholder="Jane Doe"
                        />
                        {fieldErrors.name && (
                            <p className="text-xs text-red-500 mt-1">{fieldErrors.name[0]}</p>
                        )}
                    </div>

                    <div>
                        <label
                            htmlFor="contact-email"
                            className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 block"
                        >
                            Email Address <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="contact-email"
                            name="email"
                            type="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/40 focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm transition-all"
                            placeholder="jane@example.com"
                        />
                        {fieldErrors.email && (
                            <p className="text-xs text-red-500 mt-1">{fieldErrors.email[0]}</p>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label
                            htmlFor="contact-phone"
                            className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 block"
                        >
                            Phone Number{" "}
                            <span className="font-normal text-gray-400">(optional)</span>
                        </label>
                        <input
                            id="contact-phone"
                            name="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/40 focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm transition-all"
                            placeholder="+8801712345678"
                        />
                        {fieldErrors.phone && (
                            <p className="text-xs text-red-500 mt-1">{fieldErrors.phone[0]}</p>
                        )}
                    </div>

                    <div>
                        <label
                            htmlFor="contact-subject"
                            className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 block"
                        >
                            Subject{" "}
                            <span className="font-normal text-gray-400">(optional)</span>
                        </label>
                        <input
                            id="contact-subject"
                            name="subject"
                            type="text"
                            value={formData.subject}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/40 focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm transition-all"
                            placeholder="Order inquiry"
                        />
                        {fieldErrors.subject && (
                            <p className="text-xs text-red-500 mt-1">
                                {fieldErrors.subject[0]}
                            </p>
                        )}
                    </div>
                </div>

                <div>
                    <label
                        htmlFor="contact-message"
                        className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 block"
                    >
                        Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        id="contact-message"
                        name="message"
                        required
                        minLength={5}
                        rows={5}
                        value={formData.message}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/40 focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm resize-none transition-all"
                        placeholder="Hi, I have a question about delivery times..."
                    />
                    {fieldErrors.message && (
                        <p className="text-xs text-red-500 mt-1">{fieldErrors.message[0]}</p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 disabled:opacity-60 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Sending Message...</span>
                        </>
                    ) : (
                        <>
                            <Send className="h-4 w-4" />
                            <span>Send Message</span>
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}