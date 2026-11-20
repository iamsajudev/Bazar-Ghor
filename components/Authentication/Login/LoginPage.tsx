"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import Image from "next/image";

const FloatingBackground = () => {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            <div className="absolute w-8 h-8 rounded-lg bg-orange-500/20 dark:bg-orange-400/20 border border-orange-500/30" style={{ left: "10%", bottom: "-50px", animationDelay: "0s" }}></div>
            <div className="absolute w-4 h-4 rounded-full bg-green-500/25 dark:bg-green-400/25" style={{ left: "20%", bottom: "-50px", animationDelay: "2s" }}></div>
            <div className="absolute w-10 h-10 rounded-xl bg-orange-600/20 dark:bg-orange-500/20 border border-orange-600/30" style={{ left: "35%", bottom: "-50px", animationDelay: "1s" }}></div>
            <div className="absolute w-3 h-3 rounded-full bg-orange-500/30 dark:bg-orange-400/30" style={{ left: "50%", bottom: "-50px", animationDelay: "4s" }}></div>
            <div className="absolute w-6 h-6 rounded-md bg-green-600/20 dark:bg-green-500/20 border border-green-600/30" style={{ left: "65%", bottom: "-50px", animationDelay: "3s" }}></div>
            <div className="absolute w-5 h-5 rounded-full bg-orange-400/25 dark:bg-orange-300/25" style={{ left: "80%", bottom: "-50px", animationDelay: "5s" }}></div>
            <div className="absolute w-12 h-12 rounded-2xl bg-green-500/20 dark:bg-green-400/20 border border-green-500/30" style={{ left: "90%", bottom: "-50px", animationDelay: "1.5s" }}></div>
        </div>
    );
};

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectTo = searchParams.get("redirect") ?? "/";
    const { login } = useAuthStore();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        const result = await login(email, password);
        setLoading(false);
        if (result.success) {
            router.push(redirectTo);
            router.refresh(); // সার্ভার কম্পোনেন্টগুলো যেন নতুন সেশন দেখে
        } else {
            setError(result.message);
        }
    };

    return (
        <div className="relative w-full min-h-[85vh] flex items-center justify-center px-4 py-8 overflow-hidden">
            <FloatingBackground />

            <div className="relative z-10 w-full max-w-md bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center mb-4">
                        <Link href="/" className="flex items-center shrink-0 group">
                            <div className="relative h-12 w-40 md:h-14 md:w-48">
                                <Image
                                    src="/images/logo-main.png"
                                    alt="BazarGhor Logo"
                                    fill
                                    priority
                                    sizes="192px"
                                    className="object-contain group-hover:scale-105 transition-transform duration-200"
                                />
                            </div>
                        </Link>
                    </div>

                    <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                        Welcome Back
                    </h2>
                    <p className="text-sm text-gray-500 mt-1.5">
                        Sign in to your account to continue shopping
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs font-semibold p-3.5 rounded-xl mb-6 flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-ping"></span>
                        {error}
                    </div>
                )}

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
                                autoComplete="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-transparent focus:ring-2 focus:ring-[#f76b1c] outline-none text-sm transition-all dark:text-white"
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                                Password
                            </label>
                            <Link href="/forgot-password" className="text-xs font-semibold text-[#f76b1c] hover:underline">
                                Forgot?
                            </Link>
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                autoComplete="current-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full pl-10 pr-10 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-transparent focus:ring-2 focus:ring-[#f76b1c] outline-none text-sm transition-all dark:text-white"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
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
                                <span>Signing in...</span>
                            </>
                        ) : (
                            <>
                                <span>Sign In</span>
                                <ArrowRight className="h-4 w-4" />
                            </>
                        )}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-500 mt-6">
                    Don&apos;t have an account?{" "}
                    <Link href="/register" className="text-[#f76b1c] font-bold hover:underline">
                        Create Account
                    </Link>
                </p>
            </div>
        </div>
    );
}