"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    Star, Heart, ShoppingCart, ArrowRight, CheckCircle2,
    Minus, Plus, ChevronRight,
    Phone, MessageCircle, Package, Tag, Clock, Globe
} from "lucide-react";
import { Product, MOCK_PRODUCTS } from "@/data/products";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { ProductCard } from "@/components/Products/ProductCard";
import { flyToCart } from "@/utils/flyToCart";

export function ProductDetailsClient({ product }: { product: Product }) {
    const router = useRouter();
    const { addItem, toggleCart, buyNow } = useCartStore();
    const { addItem: addWishlistItem, removeItem: removeWishlistItem, isInWishlist, isHydrated } = useWishlistStore();

    const imageRef = useRef<HTMLDivElement>(null);

    // ✅ হাইড্রেশন চেক
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    // ✅ ক্লায়েন্ট সাইডে রেন্ডার হলে তবেই isWishlisted চেক হবে
    const isWishlisted = mounted && isHydrated ? isInWishlist(product.id) : false;

    const [activeImage, setActiveImage] = useState(product.image);
    const [quantity, setQuantity] = useState(1);
    const [selectedSize, setSelectedSize] = useState(product.availableSizes?.[0] || "");
    const [selectedFlavor, setSelectedFlavor] = useState(product.availableFlavors?.[0] || "");
    const [selectedColor, setSelectedColor] = useState(product.availableColors?.[0] || "");
    const [activeTab, setActiveTab] = useState("description");

    const discount = product.originalPrice
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
        : 0;

    const handleAddToCart = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (imageRef.current) {
            flyToCart(product.image, imageRef.current);
        }
        addItem({
            id: product.id,
            title: product.title,
            price: product.price,
            image: product.image
        });
        setTimeout(() => {
            toggleCart();
        }, 800);
    };

    const handleWishlistClick = () => {
        if (isWishlisted) {
            removeWishlistItem(product.id);
        } else {
            addWishlistItem({
                id: product.id,
                title: product.title,
                price: product.price,
                image: product.image
            });
            if (imageRef.current) {
                flyToCart(product.image, imageRef.current, "wishlist-icon-target");
            }
        }
    };

    const handleBuyNow = () => {
        buyNow({ id: product.id, title: product.title, price: product.price, image: product.image });
        router.push("/checkout");
    };

    const relatedProducts = MOCK_PRODUCTS.filter(
        (p) => p.category.slug === product.category.slug && p.id !== product.id
    ).slice(0, 4);

    const thumbnails = product.gallery && product.gallery.length > 0
        ? product.gallery
        : [product.image];

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                <Link href="/" className="hover:text-green-600">Home</Link>
                <ChevronRight className="h-4 w-4" />
                <Link href={`/category/${product.category.slug}`} className="hover:text-green-600">
                    {product.category.name}
                </Link>
                <ChevronRight className="h-4 w-4" />
                <span className="text-gray-800 dark:text-gray-200 font-medium truncate">{product.title}</span>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                {/* Left: Image Gallery */}
                <div className="flex flex-col gap-4">
                    <div
                        ref={imageRef}
                        className="relative aspect-square bg-gray-50 dark:bg-gray-800/50 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 flex items-center justify-center p-6"
                    >
                        <img
                            src={activeImage}
                            alt={product.title}
                            className="w-full h-full object-contain transition-all duration-300"
                        />
                        {discount > 0 && (
                            <span className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1.5 rounded-lg">
                                -{discount}% OFF
                            </span>
                        )}
                        <button
                            onClick={handleWishlistClick}
                            className={`absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full shadow-md transition-colors ${isWishlisted
                                ? "bg-red-500 text-white"
                                : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-red-500 hover:text-white"
                                }`}
                        >
                            <Heart className={`h-5 w-5 ${isWishlisted ? "fill-current" : ""}`} />
                        </button>
                    </div>

                    <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                        {thumbnails.map((img, i) => (
                            <button
                                key={i}
                                onClick={() => setActiveImage(img)}
                                className={`w-20 h-20 shrink-0 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 flex items-center justify-center p-2 transition-all ${activeImage === img
                                    ? "border-orange-400 shadow-md"
                                    : "border-transparent hover:border-gray-300"
                                    }`}
                            >
                                <img src={img} alt={`thumb-${i}`} className="w-full h-full object-contain" />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right: Product Details */}
                <div className="flex flex-col">
                    <div className="mb-4">
                        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white mb-2 leading-tight">
                            {product.title}
                        </h1>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1 text-amber-500">
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <Star key={s} className={`h-4 w-4 ${s <= Math.floor(product.rating) ? "fill-current" : ""}`} />
                                ))}
                                <span className="text-sm text-gray-500 ml-1">{product.rating} ({product.reviewCount} reviews)</span>
                            </div>
                            <span className="text-sm text-gray-400">|</span>
                            <span className="text-sm font-medium text-green-600 flex items-center gap-1">
                                <CheckCircle2 className="h-4 w-4" /> {product.stockStatus} ({product.stock})
                            </span>
                        </div>
                    </div>

                    <div className="flex items-baseline gap-3 mb-6 pb-6 border-b border-gray-100 dark:border-gray-800">
                        <span className="text-3xl md:text-4xl font-black text-[#f76b1c]">${product.price}</span>
                        {product.originalPrice && (
                            <span className="text-xl text-gray-400 line-through">${product.originalPrice}</span>
                        )}
                        {discount > 0 && (
                            <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold px-2 py-1 rounded">
                                Save ${(product.originalPrice! - product.price).toFixed(2)}
                            </span>
                        )}
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                        {product.shortDescription || product.description}
                    </p>

                    <div className="space-y-4 mb-6">
                        {product.availableSizes && product.availableSizes.length > 0 && (
                            <div>
                                <span className="text-sm font-bold text-gray-800 dark:text-gray-200 block mb-2">Size:</span>
                                <div className="flex gap-2 flex-wrap">
                                    {product.availableSizes.map((size) => (
                                        <button
                                            key={size}
                                            onClick={() => setSelectedSize(size)}
                                            className={`px-4 py-2 text-sm font-semibold rounded-lg border-2 transition-all ${selectedSize === size
                                                ? "border-orange-400 text-orange-500 bg-orange-50 dark:bg-orange-900/20"
                                                : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300"
                                                }`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {product.availableFlavors && product.availableFlavors.length > 0 && (
                            <div>
                                <span className="text-sm font-bold text-gray-800 dark:text-gray-200 block mb-2">Flavor:</span>
                                <div className="flex gap-2 flex-wrap">
                                    {product.availableFlavors.map((flavor) => (
                                        <button
                                            key={flavor}
                                            onClick={() => setSelectedFlavor(flavor)}
                                            className={`px-4 py-2 text-sm font-semibold rounded-lg border-2 transition-all ${selectedFlavor === flavor
                                                ? "border-orange-400 text-orange-500 bg-orange-50 dark:bg-orange-900/20"
                                                : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300"
                                                }`}
                                        >
                                            {flavor}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {product.availableColors && product.availableColors.length > 0 && (
                            <div>
                                <span className="text-sm font-bold text-gray-800 dark:text-gray-200 block mb-2">Color / Packaging:</span>
                                <div className="flex gap-2 flex-wrap">
                                    {product.availableColors.map((color) => (
                                        <button
                                            key={color}
                                            onClick={() => setSelectedColor(color)}
                                            className={`px-4 py-2 text-sm font-semibold rounded-lg border-2 transition-all ${selectedColor === color
                                                ? "border-orange-400 text-orange-500 bg-orange-50 dark:bg-orange-900/20"
                                                : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300"
                                                }`}
                                        >
                                            {color}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 mb-8">
                        <div className="flex items-center border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden">
                            <button
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                className="px-4 py-3 cursor-pointer bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                <Minus className="h-4 w-4" />
                            </button>
                            <span className="w-12 text-center font-bold">{quantity}</span>
                            <button
                                onClick={() => setQuantity(quantity + 1)}
                                className="px-4 py-3 cursor-pointer bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                <Plus className="h-4 w-4" />
                            </button>
                        </div>

                        <button
                            onClick={handleAddToCart}
                            className="flex-1 min-w-[150px] cursor-pointer flex items-center justify-center gap-2 bg-[#f79b52] text-white py-3 px-6 rounded-lg hover:bg-[#e08942] transition-all font-bold shadow-md"
                        >
                            <ShoppingCart className="h-5 w-5" /> Add to Cart
                        </button>

                        <button
                            onClick={handleBuyNow}
                            className="flex-1 min-w-[150px] cursor-pointer flex items-center justify-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-3 px-6 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-all font-bold shadow-md"
                        >
                            Buy Now <ArrowRight className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 mb-6">
                        <a
                            href={`https://wa.me/8809612338833?text=Hi, I want to order ${product.title}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] text-white py-3 px-4 rounded-lg hover:bg-[#1da851] transition-all font-bold text-sm shadow-md"
                        >
                            <MessageCircle className="h-5 w-5" /> Order On WhatsApp
                        </a>
                        <a
                            href="tel:+8809612338833"
                            className="flex-1 flex items-center justify-center gap-2 bg-[#0f3b8c] text-white py-3 px-4 rounded-lg hover:bg-[#0a2a66] transition-all font-bold text-sm shadow-md"
                        >
                            <Phone className="h-5 w-5" /> Call For Order
                        </a>
                    </div>

                    <div className="flex flex-col gap-2 mt-4">
                        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                            <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                            <span>Delivery: <span className="font-semibold">{product.deliveryTime}</span></span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                            <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                            <span>Return Policy: <span className="font-semibold">{product.returnPolicy}</span></span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                            <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                            <span>100% Authentic & Quality Guaranteed</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-4 flex items-start gap-3">
                    <Package className="h-6 w-6 text-green-600 mt-1 shrink-0" />
                    <div>
                        <h4 className="font-bold text-gray-800 dark:text-gray-200 text-sm">Packaging</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{product.packagingType || "Standard"}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-4 flex items-start gap-3">
                    <Tag className="h-6 w-6 text-green-600 mt-1 shrink-0" />
                    <div>
                        <h4 className="font-bold text-gray-800 dark:text-gray-200 text-sm">SKU</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{product.sku}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-4 flex items-start gap-3">
                    <Globe className="h-6 w-6 text-green-600 mt-1 shrink-0" />
                    <div>
                        <h4 className="font-bold text-gray-800 dark:text-gray-200 text-sm">Origin</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{product.countryOfOrigin}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-4 flex items-start gap-3">
                    <Clock className="h-6 w-6 text-green-600 mt-1 shrink-0" />
                    <div>
                        <h4 className="font-bold text-gray-800 dark:text-gray-200 text-sm">Expiry Date</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{product.expiryDate || "N/A"}</p>
                    </div>
                </div>
            </div>

            <div className="mt-16">
                <div className="flex border-b border-gray-200 dark:border-gray-800 gap-8 overflow-x-auto">
                    {["description", "reviews", "shipping"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-3 text-sm font-bold capitalize transition-colors border-b-2 whitespace-nowrap ${activeTab === tab
                                ? "border-green-600 text-green-600"
                                : "border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="py-6 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {activeTab === "description" && (
                        <div>
                            <p>{product.description}</p>
                            <ul className="mt-4 space-y-2 list-disc list-inside">
                                <li>Brand: {product.brand.name}</li>
                                <li>SKU: {product.sku}</li>
                                <li>Barcode: {product.barcode}</li>
                                <li>Packaging: {product.packagingType}</li>
                                <li>Country of Origin: {product.countryOfOrigin}</li>
                                <li>Condition: {product.condition}</li>
                                <li>Warranty: {product.warranty}</li>
                                <li>SEO Title: {product.seo?.metaTitle}</li>
                            </ul>
                        </div>
                    )}
                    {activeTab === "reviews" && (
                        <div>
                            {product.reviews && product.reviews.length > 0 ? (
                                product.reviews.map((r) => (
                                    <div key={r.id} className="border-b border-gray-100 dark:border-gray-800 py-3">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-bold text-gray-800 dark:text-gray-200">{r.userName}</span>
                                            <div className="flex text-amber-500">
                                                {[1, 2, 3, 4, 5].map((s) => (
                                                    <Star key={s} className={`h-3 w-3 ${s <= r.rating ? "fill-current" : ""}`} />
                                                ))}
                                            </div>
                                            <span className="text-xs text-gray-400 ml-auto">{r.date}</span>
                                        </div>
                                        <p>{r.comment}</p>
                                    </div>
                                ))
                            ) : (
                                <p>No reviews yet.</p>
                            )}
                        </div>
                    )}
                    {activeTab === "shipping" && (
                        <div>
                            <p><strong>Delivery Charge:</strong> ${product.deliveryCharge}</p>
                            <p><strong>Delivery Time:</strong> {product.deliveryTime}</p>
                            <p><strong>Return Policy:</strong> {product.returnPolicy}</p>
                            <p><strong>Return Window:</strong> {product.returnWindow}</p>
                            <p><strong>Cash on Delivery:</strong> {product.isCodAvailable ? "Available" : "Not Available"}</p>
                            <p><strong>Shipping Weight:</strong> {product.shippingWeight}</p>
                            <p><strong>Dimensions:</strong> {product.dimensions?.length} x {product.dimensions?.width} x {product.dimensions?.height} {product.dimensions?.unit}</p>
                        </div>
                    )}
                </div>
            </div>

            {relatedProducts.length > 0 && (
                <div className="mt-16">
                    <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-6">
                        Related Products
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                        {relatedProducts.map((p) => (
                            <ProductCard
                                key={p.id}
                                id={p.id}
                                title={p.title}
                                price={p.price}
                                originalPrice={p.originalPrice}
                                image={p.image}
                                slug={p.slug}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}