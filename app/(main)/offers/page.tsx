import { MOCK_PRODUCTS } from "@/data/products";
import OffersClient from "@/components/Offers/OffersClient";

export default function OffersPage() {
    // ✅ শুধু যেসব প্রোডাক্টে originalPrice আছে (ডিসকাউন্ট আছে) সেগুলো ফিল্টার
    const discountedProducts = MOCK_PRODUCTS.filter(
        (p) => p.originalPrice && p.originalPrice > p.price
    );

    return <OffersClient initialProducts={discountedProducts} />;
}