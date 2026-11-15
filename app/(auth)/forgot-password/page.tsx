"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, Loader2, CheckCircle2, Sparkles } from "lucide-react";
import Image from "next/image";

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        // API কল সিমুলেশন (পরে রিয়েল API-তে কানেক্ট করবেন)
        setTimeout(() => {
            setLoading(false);
            if (email.includes("@")) {
                setSuccess(true);
            } else {
                setError("Please enter a valid email address.");
            }
        }, 1000);
    };

    return (
        <div className="relative w-full flex items-center justify-center px-4 py-8 overflow-hidden">
            <div className="relative z-10 w-full max-w-md bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800">

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center mb-4">
                        <Link href="/" className="flex items-center shrink-0 group">
                            <div className="relative h-20 w-40 md:h-24 md:w-48">
                                <Image
                                    src="/images/logo-main.png"
                                    alt="BazarGhor Logo"
                                    fill
                                    priority
                                    className="object-contain group-hover:scale-105 transition-transform duration-200"
                                />
                            </div>
                        </Link>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                        Forgot Password?
                    </h2>
                    <p className="text-sm text-gray-500 mt-1.5">
                        Enter your email address and we&apos;ll send you a link to reset your password.
                    </p>
                </div>

                {/* Success Message */}
                {success ? (
                    <div className="text-center space-y-4">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-50 dark:bg-green-900/20 text-green-600 mb-2">
                            <CheckCircle2 className="h-8 w-8" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                            Check your email
                        </h3>
                        <p className="text-sm text-gray-500">
                            We&apos;ve sent a password reset link to <strong>{email}</strong>.
                        </p>
                        <Link
                            href="/login"
                            className="inline-flex items-center gap-2 text-sm font-bold text-[#f76b1c] hover:underline mt-4"
                        >
                            <ArrowLeft className="h-4 w-4" /> Back to Login
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* Error */}
                        {error && (
                            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs font-semibold p-3.5 rounded-xl mb-6">
                                {error}
                            </div>
                        )}

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1.5 block">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-transparent focus:ring-2 focus:ring-[#f76b1c] outline-none text-sm transition-all dark:text-white"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full mt-2 bg-[#f76b1c] hover:bg-[#e05a12] text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition-all shadow-sm hover:shadow-md cursor-pointer text-sm"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <span>Sending...</span>
                                    </>
                                ) : (
                                    <span>Send Reset Link</span>
                                )}
                            </button>
                        </form>

                        <div className="text-center mt-6">
                            <Link
                                href="/login"
                                className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                            >
                                <ArrowLeft className="h-4 w-4" /> Back to Login
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default ForgotPasswordPage;