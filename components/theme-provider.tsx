"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider, ThemeProviderProps } from "next-themes"

// next-themes-এর স্ক্রিপ্ট ট্যাগের কারণে React 19 যে ওয়ার্নিং দেয়, সেটি ফিল্টার করার জন্য
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  const orig = console.error;
  console.error = (...args: unknown[]) => {
    if (typeof args[0] === "string" && args[0].includes("Encountered a script tag")) return;
    orig.apply(console, args);
  };
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}