"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import Image from "next/image";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setEmail(""); // ফর্ম ক্লিয়ার করা
      } else {
        setError(data.message || "Something went wrong.");
      }
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full min-h-[85vh] flex items-center justify-center px-4 py-8 overflow-hidden">
      {/* Floating Background (Login Page-এর মতোই) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute w-8 h-8 rounded-lg bg-orange-500/20 border border-orange-500/30" style={{ left: "10%", bottom: "-50px" }}></div>
        <div className="absolute w-10 h-10 rounded-xl bg-green-600/20 border border-green-600/30" style={{ left: "80%", bottom: "-50px" }}></div>
      </div>

      <div className="relative z-10 w-full max-w-md bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800">
        
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex mb-4 group">
            <div className="relative h-10 w-32">
              <Image src="/images/logo-main.png" alt="Logo" fill className="object-contain" />
            </div>
          </Link>
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">Forgot Password?</h2>
          <p className="text-sm text-gray-500 mt-2">
            Enter your email and we'll send you a link to reset your password.
          </p>
        </div>

        {/* Success State */}
        {success ? (
          <div className="text-center py-6 animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Check Your Email</h3>
            <p className="text-sm text-gray-500 mb-6">
              We've sent a password reset link to <span className="font-semibold text-gray-700 dark:text-gray-300">{email}</span>. 
              Please check your inbox or spam folder.
            </p>
            <Link 
              href="/login" 
              className="inline-flex items-center gap-2 text-[#f76b1c] font-bold hover:underline"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Login
            </Link>
          </div>
        ) : (
          <>
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs font-semibold p-3.5 rounded-xl mb-6 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
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
                    Sending Link...
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link 
                href="/login" 
                className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#f76b1c] transition-colors"
              >
                <ArrowLeft className="h-4 w-4" /> Remember your password? Sign in
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}