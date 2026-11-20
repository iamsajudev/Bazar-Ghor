import { notFound } from "next/navigation";
import { CategoryClient } from "@/components/Category/CategoryClient";

export const instant = false;

interface CategoryDetail {
    id: number;
    parent_id: number | null;
    name: string;
    slug: string;
    description: string | null;
    is_active: boolean;
}

async function getCategory(slug: string): Promise<CategoryDetail | null> {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "");
    if (!baseUrl) return null;

    try {
        const res = await fetch(`${baseUrl}/categories/${encodeURIComponent(slug)}`, {
            headers: { Accept: "application/json" },
        });
        if (!res.ok) return null; // API 404 দিলে null → নিচে notFound()
        const json = await res.json();
        return json.data ?? null;
    } catch {
        return null;
    }
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    const category = await getCategory(slug);
    if (!category || category.is_active === false) notFound();

    return <CategoryClient category={category} />;
}