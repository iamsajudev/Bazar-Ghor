import { MOCK_PRODUCTS } from "@/data/products";
import NewArrivalsClient from "@/components/NewArrivals/NewArrivalsClient";

export default function NewArrivalsPage() {
    // ✅ isNewArrival ফ্ল্যাগ বা সর্বশেষ ১২টি প্রোডাক্ট ফিল্টার
    const newArrivals = MOCK_PRODUCTS
        .filter((p) => p.isNewArrival)
        .sort((a, b) => b.id - a.id);

    // যদি isNewArrival ফ্ল্যাগ না থাকে, তবে সর্বশেষ ১২টি প্রোডাক্ট দেখাবে
    const products = newArrivals.length > 0 ? newArrivals : MOCK_PRODUCTS.slice(-12);

    return <NewArrivalsClient initialProducts={products} />;
}