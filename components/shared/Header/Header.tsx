"use client";

import { useState, useEffect, useRef } from "react";
import { TopHeader } from "./TopHeader";
import { CenterHeader } from "./CenterHeader";
import { BottomHeader } from "./BottomHeader";

export const Header = () => {
    const [isTopVisible, setIsTopVisible] = useState(true);
    const lastScrollY = useRef(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            // ✅ উপরে স্ক্রল করলে বা ১০০ পিক্সেলের নিচে থাকলে দেখাবে
            if (currentScrollY < lastScrollY.current || currentScrollY < 100) {
                setIsTopVisible(true);
            }
            // ✅ নিচে স্ক্রল করলে এবং ১০০ পিক্সেলের বেশি হলে হাইড হবে
            else if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
                setIsTopVisible(false);
            }

            lastScrollY.current = currentScrollY;
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <header className="sticky top-0 z-50 w-full bg-white dark:bg-gray-950 shadow-sm">
            
            {/* ১. TopHeader: max-height এবং opacity দিয়ে স্মুথ হাইড/শো */}
            {/* ✅ max-h-[100px] দেওয়া হলো, কারণ আপনার TopHeader-এর উচ্চতা প্রায় ৫০ পিক্সেল */}
            <div
                className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    isTopVisible ? "max-h-[100px] opacity-100" : "max-h-0 opacity-0"
                }`}
            >
                <TopHeader />
            </div>

            {/* ২. CenterHeader: সবসময় স্টিকি */}
            <div className="w-full bg-white dark:bg-gray-950">
                <CenterHeader />
            </div>

            {/* ৩. BottomHeader: সবসময় স্টিকি */}
            <div className="w-full bg-green-700">
                <BottomHeader />
            </div>
        </header>
    );
};