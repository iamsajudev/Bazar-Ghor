// components/Header/Header.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { TopHeader } from "./TopHeader";
import { CenterHeader } from "./CenterHeader";
import { BottomHeader } from "./BottomHeader";

export const Header = () => {
    const [isTopVisible, setIsTopVisible] = useState(true);
    const lastScrollY = useRef(0);
    const ticking = useRef(false);

    // ✅ কনফিগারেশন: স্ক্রলের সংবেদনশীলতা নিয়ন্ত্রণ
    const SCROLL_THRESHOLD = 50;   // এই পরিমাণ স্ক্রল করার পরই হেডার হাইড হবে
    const SHOW_OFFSET = 100;       // আবার দেখাতে হলে এই পরিমাণ উপরে স্ক্রল করতে হবে

    useEffect(() => {
        const handleScroll = () => {
            if (!ticking.current) {
                window.requestAnimationFrame(() => {
                    const currentScrollY = window.scrollY;
                    
                    // ✅ ১. একদম শুরুতে সবসময় দেখাবে
                    if (currentScrollY < SCROLL_THRESHOLD) {
                        setIsTopVisible(true);
                    } 
                    // ✅ ২. নিচে স্ক্রল করলে হাইড হবে (থ্রেশহোল্ড পার হলে)
                    else if (currentScrollY > lastScrollY.current && !isTopVisible === false) {
                         // শুধুমাত্র যদি আগে থেকেই ভিজিবল থাকে এবং থ্রেশহোল্ড পার হয়
                         if (currentScrollY > SCROLL_THRESHOLD) {
                             setIsTopVisible(false);
                         }
                    }
                    // ✅ ৩. উপরে স্ক্রল করলে দেখাবে (অফসেট পার হলে - এটি কাপাকাপি রোধ করে)
                    else if (currentScrollY < lastScrollY.current) {
                        if (!isTopVisible && currentScrollY < lastScrollY.current - SHOW_OFFSET) {
                            setIsTopVisible(true);
                        } else if (isTopVisible) {
                            setIsTopVisible(true);
                        }
                    }

                    lastScrollY.current = currentScrollY;
                    ticking.current = false;
                });
                ticking.current = true;
            }
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, [isTopVisible]); // ✅ isTopVisible ডিপেন্ডেন্সি যোগ করা হয়েছে

    return (
        <header className="sticky top-0 z-40 w-full bg-white dark:bg-gray-950 shadow-sm">
            {/* ১. TopHeader */}
            <div
                className={`transition-all duration-300 ease-in-out overflow-hidden bg-green-700 ${
                    isTopVisible ? "max-h-[50px] opacity-100" : "max-h-0 opacity-0"
                }`}
            >
                <TopHeader />
            </div>

            {/* ২. CenterHeader */}
            <div className="w-full bg-white dark:bg-gray-950">
                <CenterHeader />
            </div>

            {/* ৩. BottomHeader */}
            <div className="w-full bg-green-700">
                <BottomHeader />
            </div>
        </header>
    );
};