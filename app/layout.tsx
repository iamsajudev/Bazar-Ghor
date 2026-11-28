import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import StorefrontTracking from "@/components/analytics/StorefrontTracking";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  // ✅ বেসিক মেটাডেটা
  title: {
    default: "Bismillah Body Oil - Pure & Natural Body Care",
    template: "%s | Bismillah Body Oil",
  },
  description:
    "Shop 100% pure and natural body oils at Bismillah Body Oil. Discover our range of organic oils for skin care, hair care, and massage. Fast delivery across Bangladesh.",
  keywords: [
    "Bismillah Body Oil",
    "body oil Bangladesh",
    "organic body oil",
    "natural skin care",
    "pure body oil",
    "massage oil",
    "hair oil",
    "baby oil",
    "essential oil",
    "cold pressed oil",
    "herbal oil",
    "aromatherapy oil",
  ],
  authors: [{ name: "Bismillah Body Oil", url: "https://bismillahbodyoil.com" }],
  creator: "Bismillah Body Oil",
  publisher: "Bismillah Body Oil",

  // ✅ ক্যানোনিক্যাল URL
  metadataBase: new URL("https://bismillahbodyoil.com"),
  alternates: {
    canonical: "/",
  },

  // ✅ Open Graph (Facebook, LinkedIn)
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://bismillahbodyoil.com",
    siteName: "Bismillah Body Oil",
    title: "Bismillah Body Oil - Pure & Natural Body Care",
    description:
      "Shop 100% pure and natural body oils at Bismillah Body Oil. Discover our range of organic oils for skin care, hair care, and massage.",
    images: [
      {
        url: "./images/favicon.ico",
        width: 1200,
        height: 630,
        alt: "Bismillah Body Oil - Pure & Natural Body Care",
      },
    ],
  },

  // ✅ Twitter Card
  twitter: {
    card: "summary_large_image",
    site: "@bismillahbodyoil",
    creator: "@bismillahbodyoil",
    title: "Bismillah Body Oil - Pure & Natural Body Care",
    description:
      "Shop 100% pure and natural body oils at Bismillah Body Oil. Discover our range of organic oils for skin care, hair care, and massage.",
    images: ["./images/favicon.ico"],
  },

  // ✅ Robots (SEO)
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // ✅ Favicon এবং Icons
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/images/logo-green.png",
  },

  // ✅ অন্যান্য
  category: "ecommerce",
  classification: "Online Body Care Store",
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "apple-mobile-web-app-title": "Bismillah Body Oil",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <StorefrontTracking />
        </ThemeProvider>
      </body>
    </html>
  );
}