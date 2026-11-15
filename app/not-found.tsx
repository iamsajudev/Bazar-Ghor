import Link from "next/link";
import { Home, Search, ArrowLeft, ShoppingBag } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 relative overflow-hidden">
            {/* ব্যাকগ্রাউন্ড ডেকোরেশন */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 text-center max-w-2xl mx-auto">
                {/* 404 নম্বর */}
                <div className="mb-8">
                    <h1 className="text-[120px] md:text-[180px] font-black leading-none bg-gradient-to-br from-green-600 via-green-500 to-emerald-700 bg-clip-text text-transparent drop-shadow-sm">
                        404
                    </h1>
                </div>

                {/* আইকন */}
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-orange-50 dark:bg-orange-950/30 text-[#f76b1c] mb-6">
                    <ShoppingBag className="h-10 w-10" />
                </div>

                {/* টেক্সট */}
                <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
                    Oops! Page Not Found
                </h2>
                <p className="text-base md:text-lg text-gray-500 dark:text-gray-400 mb-10 max-w-md mx-auto leading-relaxed">
                    The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
                </p>

                {/* বাটনসমূহ */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center gap-2 bg-[#f76b1c] hover:bg-[#e05a12] text-white px-8 py-3.5 rounded-xl font-bold text-sm transition-all shadow-md hover:shadow-lg w-full sm:w-auto"
                    >
                        <Home className="h-4 w-4" />
                        Back to Home
                    </Link>
                    <Link
                        href="/search"
                        className="inline-flex items-center justify-center gap-2 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 px-8 py-3.5 rounded-xl font-bold text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-all w-full sm:w-auto"
                    >
                        <Search className="h-4 w-4" />
                        Search Products
                    </Link>
                </div>

                {/* হেল্প টেক্সট */}
                <div className="mt-12 pt-8 border-t border-gray-100 dark:border-gray-800">
                    <p className="text-xs text-gray-400">
                        Need help?{" "}
                        <Link href="/contact" className="text-[#f76b1c] font-semibold hover:underline">
                            Contact our support team
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}