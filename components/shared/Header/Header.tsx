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
            if (!ticking.current) {
                window.requestAnimationFrame(() => {
                    const currentScrollY = window.scrollY;
                    const scrollDifference = currentScrollY - lastScrollY.current;

                    if (currentScrollY < 50) {
                        setIsTopVisible(true);
                    } else if (Math.abs(scrollDifference) > 10) {
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
        <header className="sticky top-0 z-40 w-full bg-white dark:bg-gray-950 shadow-sm">

            {/* ১. TopHeader */}
            <div
                className={`transition-all duration-300 ease-in-out overflow-hidden bg-green-700 ${isTopVisible ? "max-h-[50px] opacity-100" : "max-h-0 opacity-0"
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