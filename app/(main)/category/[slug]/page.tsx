import { CategoryClient } from "@/components/Category/CategoryClient";
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from "@/data/products";
import { notFound } from "next/navigation";

export const instant = false; // ✅ এই লাইনটি যোগ করুন

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    const category = MOCK_CATEGORIES.find((c) => c.slug === slug);
    if (!category) {
        notFound();
    }

    const products = MOCK_PRODUCTS.filter((p) => p.category.slug === slug);

    return <CategoryClient category={category} initialProducts={products} />;
}