import { BrandClient } from "@/components/Brand/BrandClient";
import { MOCK_PRODUCTS, MOCK_BRANDS } from "@/data/products";
import { notFound } from "next/navigation";

export const instant = false; // ✅ এই লাইনটি যোগ করুন

export default async function BrandPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    const brand = MOCK_BRANDS.find((b) => b.slug === slug);
    if (!brand) {
        notFound();
    }

    const products = MOCK_PRODUCTS.filter((p) => p.brand.slug === slug);

    return <BrandClient brand={brand} initialProducts={products} />;
}