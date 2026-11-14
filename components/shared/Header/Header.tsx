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

            // স্ক্রল যদি ৫০ এর নিচে হয় অথবা উপরের দিকে স্ক্রল করা হয়
            if (currentScrollY < lastScrollY.current || currentScrollY < 50) {
                setIsTopVisible(true);
            } 
            // স্ক্রল যদি নিচের দিকে হয় এবং ৫০ এর বেশি হয়
            else if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
                setIsTopVisible(false);
            }

            lastScrollY.current = currentScrollY;
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <>
            {/* Top ও Center Header এর র‍্যাপার (স্টিকি বা ফিক্সড নয়) */}
            <header className="w-full bg-white dark:bg-gray-950">
                <div
                    className={`transition-all duration-300 ease-in-out overflow-hidden ${
                        isTopVisible ? "max-h-[200px] opacity-100" : "max-h-0 opacity-0"
                    }`}
                >
                    <TopHeader />
                    <CenterHeader />
                </div>
            </header>

            {/* BottomHeader সবসময় ব্রাউজারের উপরে ফিক্সড থাকবে */}
            <div className="sticky top-0 z-50 w-full shadow-md">
                <BottomHeader />
            </div>
        </>
    );
};