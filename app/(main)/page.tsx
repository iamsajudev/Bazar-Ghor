import { ProductCard } from "@/components/Products/ProductCard";

export default function HomePage() {
    const dummyProducts = [
        {
            id: 1,
            title: "সুন্দরবনের খাঁটি মধু - ৫০০ গ্রাম",
            price: 850,
            originalPrice: 1000,
            image: "https://images.unsplash.com/photo-1587049352847-4d4b1a1d6f86?w=500&q=80",
        },
        {
            id: 2,
            title: "দেশি সরিষার তেল - ১ লিটার",
            price: 320,
            originalPrice: 380,
            image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&q=80",
        },
        {
            id: 3,
            title: "খাঁটি গাওয়া ঘি - ৫০০ গ্রাম",
            price: 1200,
            image: "https://images.unsplash.com/photo-1589927986089-35812388d1f4?w=500&q=80",
        },
        {
            id: 4,
            title: "প্রিমিয়াম কাজু বাদাম - ২৫০ গ্রাম",
            price: 450,
            originalPrice: 550,
            image: "https://images.unsplash.com/photo-1599599810694-b5b37304c041?w=500&q=80",
        },
    ];

    return (
        <div className="container mx-auto px-4 py-8">

            {/* হিরো ব্যানার */}
            <div className="w-full bg-green-100 dark:bg-green-900/30 rounded-2xl p-8 md:p-12 mb-10 flex flex-col md:flex-row items-center justify-between">
                <div className="md:w-1/2 mb-6 md:mb-0 text-center md:text-left">
                    <h1 className="text-3xl md:text-5xl font-bold text-green-900 dark:text-green-400 mb-4 leading-tight">
                        খাঁটি ও অর্গানিক খাবারের <br className="hidden md:block" />
                        নির্ভরযোগ্য ঠিকানা
                    </h1>
                    <p className="text-gray-700 dark:text-gray-300 mb-6 text-lg">
                        সরাসরি গ্রাম থেকে সংগৃহীত খাঁটি মধু, ঘি, তেল এবং মশলা।
                    </p>
                    <button className="bg-green-700 hover:bg-green-800 text-white px-8 py-3 rounded-lg font-bold transition-colors">
                        এখনই কিনুন
                    </button>
                </div>
                <div className="md:w-1/2 flex justify-center">
                    <img
                        src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80"
                        alt="Organic Food"
                        className="rounded-xl shadow-lg w-full max-w-md object-cover"
                    />
                </div>
            </div>

            {/* বেস্ট সেলিং সেকশন */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white border-l-4 border-green-600 pl-3">
                        বেস্ট সেলিং প্রোডাক্ট
                    </h2>
                    <button className="text-green-700 dark:text-green-500 font-medium hover:underline">
                        সব দেখুন
                    </button>
                </div>

                {/* প্রোডাক্ট গ্রিড */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                    {dummyProducts.map((product) => (
                        <ProductCard
                            key={product.id}
                            id={product.id} // <--- এই লাইনটি যোগ করুন
                            title={product.title}
                            price={product.price}
                            originalPrice={product.originalPrice}
                            image={product.image}
                        />
                    ))}
                </div>
            </div>

        </div>
    );
}