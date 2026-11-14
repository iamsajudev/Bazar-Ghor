"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
    const { setTheme, resolvedTheme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return <div className="h-10 w-10"></div>
    }

    return (
        <button
            onClick={() => {
                // কনসোল লগ দিয়ে চেক করুন ক্লিক হচ্ছে কিনা
                console.log("Button clicked, current theme:", resolvedTheme);
                setTheme(resolvedTheme === "light" ? "dark" : "light");
            }}
            // বাটনটিকে relative এবং overflow-hidden করা হলো যাতে লেয়ার ঠিক থাকে
            className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-md border border-gray-200 bg-white hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-950 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            aria-label="Toggle theme"
        >
            {/* সূর্য আইকন */}
            <Sun className={`h-5 w-5 text-black dark:text-white transition-all duration-300 ${resolvedTheme === 'dark' ? '-rotate-90 scale-0' : 'rotate-0 scale-100'}`} />

            {/* চাঁদ আইকন: pointer-events-none দেওয়া হয়েছে যাতে ক্লিক ব্লক না করে */}
            <Moon className={`absolute h-5 w-5 text-black dark:text-white transition-all duration-300 pointer-events-none ${resolvedTheme === 'dark' ? 'rotate-0 scale-100' : 'rotate-90 scale-0'}`} />
        </button>
    )
}