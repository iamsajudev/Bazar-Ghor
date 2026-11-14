"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, TrendingUp, Sparkles, ArrowUpRight } from "lucide-react";

interface SearchBarProps {
    className?: string;
    isMobile?: boolean;
}

const TYPING_WORDS = [
    "Miniket Rice...",
    "Soybean Oil 5L...",
    "Red Lentils...",
    "Pure Mustard Oil...",
    "Flour & Atta...",
    "Fresh Vegetables...",
];

const QUICK_CATEGORIES = [
    { name: "Rice & Lentils", icon: "🌾" },
    { name: "Cooking Oil", icon: "🫗" },
    { name: "Spices", icon: "🌶️" },
    { name: "Fish & Meat", icon: "🐟" },
    { name: "Vegetables", icon: "🥬" },
    { name: "Bakery & Snacks", icon: "🍪" },
];

const TRENDING_SEARCHES = [
    "Rupchanda Soybean Oil",
    "Nazirshail Rice",
    "Pran Milk Powder",
    "Local Red Onion",
];

export const SearchBar = ({ className = "", isMobile = false }: SearchBarProps) => {
    const [query, setQuery] = useState("");
    const [isFocused, setIsFocused] = useState(false);

    // Typing animation states
    const [placeholderText, setPlaceholderText] = useState("");
    const [wordIndex, setWordIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);

    const wrapperRef = useRef<HTMLDivElement>(null);

    // Typing animation logic
    useEffect(() => {
        // Stop typing animation if the user types something
        if (query) return;

        const currentWord = TYPING_WORDS[wordIndex];
        const typingSpeed = isDeleting ? 45 : 90;

        const timer = setTimeout(() => {
            if (!isDeleting) {
                setPlaceholderText(currentWord.substring(0, placeholderText.length + 1));
                if (placeholderText === currentWord) {
                    setTimeout(() => setIsDeleting(true), 1500); // Wait 1.5s after full word is typed
                }
            } else {
                setPlaceholderText(currentWord.substring(0, placeholderText.length - 1));
                if (placeholderText === "") {
                    setIsDeleting(false);
                    setWordIndex((prev) => (prev + 1) % TYPING_WORDS.length);
                }
            }
        }, typingSpeed);

        return () => clearTimeout(timer);
    }, [placeholderText, isDeleting, wordIndex, query]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsFocused(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const triggerSearch = (searchTerm: string) => {
        if (!searchTerm.trim()) return;
        setQuery(searchTerm);
        setIsFocused(false);
        // Add your routing or API call here, e.g., router.push(`/search?q=${searchTerm}`)
        console.log("Searching for:", searchTerm);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        triggerSearch(query);
    };

    return (
        <div ref={wrapperRef} className={`relative w-full ${className}`}>
            <form onSubmit={handleSubmit} className="relative w-full group">
                {/* Left Search Icon */}
                <Search
                    className={`absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition-colors pointer-events-none ${isMobile ? "h-4 w-4" : "h-4 w-4"
                        }`}
                />

                <input
                    type="text"
                    value={query}
                    onFocus={() => setIsFocused(true)}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={`Search products: ${placeholderText}`}
                    className={`w-full border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50/80 dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600/80 dark:focus:ring-green-500 focus:border-green-600 focus:bg-white dark:focus:bg-gray-950 shadow-2xs transition-all ${isMobile ? "pl-10 pr-20 py-2 text-sm" : "pl-10 pr-28 py-2.5 text-sm"
                        }`}
                />

                {/* Clear Input (X) Button */}
                {query && (
                    <button
                        type="button"
                        onClick={() => setQuery("")}
                        className={`absolute top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 bg-gray-200/60 dark:bg-gray-800 rounded-full p-1 transition-colors ${isMobile ? "right-16" : "right-22"
                            }`}
                        aria-label="Clear search"
                    >
                        <X className="h-3.5 w-3.5" />
                    </button>
                )}

                {/* Search Submit Button */}
                <button
                    type="submit"
                    className={`absolute right-1.5 top-1.5 bottom-1.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-95 ${isMobile ? "px-3 text-xs" : "px-4 text-xs"
                        }`}
                    aria-label="Search"
                >
                    <span>Search</span>
                </button>
            </form>

            {/* Modern Suggestions & Categories Dropdown on Focus */}
            {isFocused && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">

                    {/* Popular Categories Slider / Chips */}
                    <div className="mb-4">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2.5">
                            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                            <span>Popular Categories</span>
                        </div>
                        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                            {QUICK_CATEGORIES.map((cat) => (
                                <button
                                    key={cat.name}
                                    type="button"
                                    onClick={() => triggerSearch(cat.name)}
                                    className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 hover:bg-green-50 dark:bg-gray-800 dark:hover:bg-green-950/50 text-gray-700 dark:text-gray-300 hover:text-green-700 dark:hover:text-green-400 border border-transparent hover:border-green-200 dark:hover:border-green-800 transition-all"
                                >
                                    <span>{cat.icon}</span>
                                    <span>{cat.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="h-px bg-gray-100 dark:bg-gray-800 my-3" />

                    {/* Trending Searches List */}
                    <div>
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
                            <TrendingUp className="h-3.5 w-3.5 text-green-600" />
                            <span>Trending Searches</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                            {TRENDING_SEARCHES.map((item) => (
                                <button
                                    key={item}
                                    type="button"
                                    onClick={() => triggerSearch(item)}
                                    className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/70 hover:text-green-600 transition-colors text-left group"
                                >
                                    <span>{item}</span>
                                    <ArrowUpRight className="h-3.5 w-3.5 text-gray-400 group-hover:text-green-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                </button>
                            ))}
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
};