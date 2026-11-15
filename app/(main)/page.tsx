import { BestSellingProducts } from "@/components/HomePage/BestSellingProducts/BestSellingProducts";
import { BrandSection } from "@/components/HomePage/BrandSection/BrandSection";
import { CallToAction } from "@/components/HomePage/CallToAction/CallToAction";
import { FullBgCTA } from "@/components/HomePage/CallToAction/FullBgCTA";
import { FeaturedCategories } from "@/components/HomePage/Category/FeaturedCategories";
import { CategoryProductSection } from "@/components/HomePage/CategoryProducts/CategoryProductSection";
import { HeroSlider } from "@/components/HomePage/HeroSection/HeroSlider";
import { TopSellingCard } from "@/components/HomePage/TopSellingCard/TopSellingCard";
import { ProductCard } from "@/components/Products/ProductCard";
import { MOCK_PRODUCTS } from "@/data/products"; // এখানে MOCK_PRODUCTS ইমপোর্ট করুন
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
    return (
        <div className="container mx-auto px-4 py-8">
            {/* ১. হিরো স্লাইডার */}
            <HeroSlider />
            <FeaturedCategories />
            <div className="mb-12">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-green-600 dark:text-green-400">
                            Most Popular
                        </span>
                        <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight mt-0.5">
                            Top Selling Products
                        </h2>
                    </div>

                    <Link
                        href={"/products"}
                        className="text-xs md:text-sm font-semibold text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors flex items-center gap-1 group"
                    >
                        <span>View All</span>
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                {/* ২ কলামের গ্রিড (ছবির মতো) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                    {MOCK_PRODUCTS.slice(0, 6).map((product) => (
                        <TopSellingCard
                            key={product.id}
                            id={product.id}
                            title={product.title}
                            price={product.price}
                            originalPrice={product.originalPrice}
                            description={product.description}
                            image={product.image}
                            isBestSelling={product.isBestSelling}
                        />
                    ))}
                </div>
            </div>
            <BrandSection />
            <CategoryProductSection
                title="Pure Homemade Honey"
                subtitle="Explore Our Honey Collection"
                categorySlug="honey" // এখানে ক্যাটাগরির স্লাগ দিতে হবে
                products={MOCK_PRODUCTS}
                viewAllLink="/category/honey"
            />
            <CategoryProductSection
                title="Pure Homemade Honey"
                subtitle="Explore Our Honey Collection"
                categorySlug="honey" // এখানে ক্যাটাগরির স্লাগ দিতে হবে
                products={MOCK_PRODUCTS}
                viewAllLink="/category/honey"
            />
            <CallToAction />
            {/* === ক্যাটাগরি সেকশন ২: Ghee & Oil === */}
            <CategoryProductSection
                title="Pure Ghee & Oil"
                subtitle="Premium Quality Cooking Essentials"
                categorySlug="ghee-oil"
                products={MOCK_PRODUCTS}
                viewAllLink="/category/ghee-oil"
            />

            {/* === ক্যাটাগরি সেকশন ৩: Spices === */}
            <CategoryProductSection
                title="Aromatic Spices"
                subtitle="Freshly Ground & Pure"
                categorySlug="spices"
                products={MOCK_PRODUCTS}
                viewAllLink="/category/spices"
            />

            {/* === ক্যাটাগরি সেকশন ৪: Nuts & Seeds === */}
            <CategoryProductSection
                title="Premium Nuts & Seeds"
                subtitle="Healthy Snacking"
                categorySlug="nuts-seeds"
                products={MOCK_PRODUCTS}
                viewAllLink="/category/nuts-seeds"
            />

            <div className="-mx-4 w-[calc(100%+2rem)]">
                <FullBgCTA />
            </div>
            {/* ২. বেস্ট সেলিং সেকশন */}
            <BestSellingProducts products={MOCK_PRODUCTS} />
        </div >
    );
}