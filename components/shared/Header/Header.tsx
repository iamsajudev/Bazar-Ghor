"use client";

import { useState, useEffect, useRef } from "react";
import { TopHeader } from "./TopHeader";
import { CenterHeader } from "./CenterHeader";
import { BottomHeader } from "./BottomHeader";

export const Header = () => {
    const [isTopVisible, setIsTopVisible] = useState(true);
    const lastScrollY = useRef(0);
    const ticking = useRef(false);

    useEffect(() => {
        const handleScroll = () => {
            // ✅ requestAnimationFrame ব্যবহার করে স্ক্রল ইভেন্ট থ্রটল করা
            if (!ticking.current) {
                window.requestAnimationFrame(() => {
                    const currentScrollY = window.scrollY;
                    const scrollDifference = currentScrollY - lastScrollY.current;

                    // ✅ ১০ পিক্সেলের বেশি স্ক্রল হলে তবেই স্টেট চেঞ্জ হবে (ঝাঁকুনি রোধে)
                    if (currentScrollY < 50) {
                        // একদম উপরে থাকলে সর্বদা দেখাবে
                        setIsTopVisible(true);
                    } else if (Math.abs(scrollDifference) > 10) {
                        // নিচে স্ক্রল হলে হাইড, উপরে স্ক্রল হলে শো
                        setIsTopVisible(scrollDifference < 0);
                    }

                    lastScrollY.current = currentScrollY;
                    ticking.current = false;
                });
                ticking.current = true;
            }
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <header className="sticky top-0 z-[999] w-full bg-white dark:bg-gray-950 shadow-sm">
            
            {/* ১. TopHeader: max-height দিয়ে হাইড/শো (ঝাঁকুনি ছাড়া) */}
            <div
                className={`transition-all duration-300 ease-in-out overflow-hidden bg-green-700 ${
                    isTopVisible ? "max-h-[50px] opacity-100" : "max-h-0 opacity-0"
                }`}
            >
                <TopHeader />
            </div>

            {/* ২. CenterHeader: সবসময় দৃশ্যমান */}
            <div className="w-full bg-white dark:bg-gray-950">
                <CenterHeader />
            </div>

            {/* ৩. BottomHeader: সবসময় দৃশ্যমান */}
            <div className="w-full bg-green-700">
                <BottomHeader />
            </div>
        </header>
    );
};