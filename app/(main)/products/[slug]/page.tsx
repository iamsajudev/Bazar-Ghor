
import { Suspense, use } from "react";
import { ProductDetailsClient } from "@/components/Products/ProductDetailsClient/ProductDetailsClient";
import { MOCK_PRODUCTS } from "@/data/products";
import { notFound } from "next/navigation";

async function ProductContent({ slugPromise }: { slugPromise: Promise<{ slug: string }> }) {
    const { slug } = await slugPromise;
    const product = MOCK_PRODUCTS.find(
        (p) => p.slug === slug || p.id.toString() === slug
    );

    if (!product) {
        notFound();
    }

    return <ProductDetailsClient product={product} />;
}

export default function ProductDetailsPage({
    params
}: {
    params: Promise<{ slug: string }>
}) {
    return (
        <Suspense fallback={
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
        }>
            <ProductContent slugPromise={params} />
        </Suspense>
    );
}