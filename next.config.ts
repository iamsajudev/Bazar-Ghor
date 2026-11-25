import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    agentFeedback: true,
  },
  images: {
    // Unsplash থেকে ছবি লোড করার জন্য
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn.ghorerbazar.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "ecommerce.goflixza.com",
        port: "",
        pathname: "/**",
      },
    ],
    // লোকাল ছবি (public ফোল্ডার) লোড করার জন্য
    localPatterns: [
      {
        pathname: "/images/**",
      },
    ],
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;