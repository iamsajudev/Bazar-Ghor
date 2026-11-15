"use client";

import { useState, useEffect } from "react";

export const BottomFooter = () => {
    const [currentYear, setCurrentYear] = useState(2026);

    useEffect(() => {
        setCurrentYear(new Date().getFullYear());
    }, []);

    return (
        <div className="py-4 text-center md:text-left text-sm text-gray-500 dark:text-gray-400 flex flex-col md:flex-row items-center justify-between gap-2 border-t border-gray-100 dark:border-gray-800">
            <p>© {currentYear} BazarGhor. All rights reserved.</p>
            <div className="flex items-center gap-4">
                <a href="/terms-conditions" className="hover:text-green-600 transition-colors">Terms</a>
                <a href="/privacy-policy" className="hover:text-green-600 transition-colors">Privacy</a>
                <a href="/refund-policy" className="hover:text-green-600 transition-colors">Refund</a>
            </div>
        </div>
    );
};