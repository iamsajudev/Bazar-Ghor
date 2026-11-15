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

            // উপরে স্ক্রল করলে দেখাবে
            if (currentScrollY < lastScrollY.current || currentScrollY < 50) {
                setIsTopVisible(true);
            }
            // নিচে স্ক্রল করলে হাইড হবে
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
            {/* Top + Center Header: স্ক্রলে ওপরের দিকে স্লাইড হবে */}
            <div
                className={`transition-transform duration-300 ease-in-out w-full bg-white dark:bg-gray-950 ${isTopVisible ? "translate-y-0" : "-translate-y-full"
                    }`}
            >
                <TopHeader />
                <CenterHeader />
            </div>

            {/* BottomHeader: সবসময় ব্রাউজারের উপরে ফিক্সড থাকবে */}
            <div className="sticky top-0 z-50 w-full bg-white dark:bg-gray-950 shadow-md">
                <BottomHeader />
            </div>
        </>
    );
};