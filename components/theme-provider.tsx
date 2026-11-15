"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider, ThemeProviderProps } from "next-themes"

if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  const orig = console.error;
  console.error = (...args: unknown[]) => {
    if (typeof args[0] === "string") {
      // স্ক্রিপ্ট ট্যাগ এরর এবং হাইড্রেশন মিসম্যাচ এরর দুটোই ইগনোর করুন
      if (
        args[0].includes("Encountered a script tag") || 
        args[0].includes("A tree hydrated but some attributes")
      ) {
        return;
      }
    }
    orig.apply(console, args);
  };
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}