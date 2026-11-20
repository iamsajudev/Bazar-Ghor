"use client";

import { useState, useEffect } from "react";
import { X, Star, Heart, CheckCircle2 } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useRouter } from "next/navigation";

interface ProductQuickViewModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: {
        id: number;
        title: string;
        price: number;
        originalPrice?: number;
        image: string;
        gallery?: string[];
        description?: string;
        variantId?: number | null;
    };
}

export function ProductQuickViewModal({
    isOpen,
    onClose,
    product,
}: ProductQuickViewModalProps) {
    const { addItem, toggleCart } = useCartStore();
    const router = useRouter();

    const [quantity, setQuantity] = useState(1);
    const [selectedSize, setSelectedSize] = useState("1KG");
    const [selectedMaterial, setSelectedMaterial] = useState("CANADA");
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [activeImage, setActiveImage] = useState(product.image);

    useEffect(() => {
        if (isOpen && product) {
            setActiveImage(product.image);
            setQuantity(1);
            setSelectedSize("1KG");
            setSelectedMaterial("CANADA");
            setIsWishlisted(false);
        }
    }, [isOpen, product]);

    if (!isOpen) return null;

    const resolvedVariantId = product.variantId ?? product.id;

    const handleAddToCart = async () => {
        await addItem({
            id: product.id,
            title: product.title,
            price: product.price,
            image: activeImage || product.image,
            variantId: resolvedVariantId,
            quantity,
        });
        toggleCart();
        onClose();
    };

    const handleBuyNow = async () => {
        await addItem({
            id: product.id,
            title: product.title,
            price: product.price,
            image: activeImage || product.image,
            variantId: resolvedVariantId,
            quantity,
        });
        onClose();
        router.push("/checkout");
    };

    const discount =
        product.originalPrice && product.originalPrice > 0
            ? Math.round(
                  ((product.originalPrice - product.price) /
                      product.originalPrice) *
                      100
              )
            : 0;

    const thumbnails =
        product.gallery && product.gallery.length > 0
            ? product.gallery
            : [product.image];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col md:flex-row max-h-[90vh] overflow-y-auto no-scrollbar">
                {/* Close Button */}
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close modal"
                    className="absolute top-4 right-4 z-10 p-2 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-600 dark:text-gray-300 hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
                >
                    <X className="h-5 w-5" />
                </button>

                {/* Left: Images */}
                <div className="w-full md:w-1/2 p-6 flex flex-col gap-4">
                    {/* Main Image */}
                    <div className="w-full aspect-square bg-gray-50 dark:bg-gray-800/50 rounded-xl flex items-center justify-center relative overflow-hidden">
                        <img
                            src={activeImage}
                            alt={product.title}
                            className="w-full h-full object-contain drop-shadow-xl transition-all duration-300"
                        />
                        {discount > 0 && (
                            <div className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-md">
                                -{discount}%
                            </div>
                        )}
                    </div>

                    {/* Thumbnails */}
                    <div className="flex gap-2 overflow-x-auto pb-1">
                        {thumbnails.map((img, i) => (
                            <button
                                type="button"
                                key={`${img}-${i}`}
                                onClick={() => setActiveImage(img)}
                                className={`w-16 h-16 shrink-0 rounded-lg bg-gray-50 dark:bg-gray-800 border-2 flex items-center justify-center cursor-pointer transition-all ${
                                    activeImage === img
                                        ? "border-orange-400"
                                        : "border-transparent hover:border-gray-300"
                                }`}
                            >
                                <img
                                    src={img}
                                    alt={`thumb-${i}`}
                                    className="w-full h-full object-contain p-1"
                                />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right: Details */}
                <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col">
                    <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white mb-2">
                        {product.title}
                    </h2>

                    {/* Ratings */}
                    <div className="flex items-center gap-1 mb-4 text-amber-500">
                        {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} className="h-4 w-4 fill-current" />
                        ))}
                        <span className="text-xs text-gray-500 ml-1">
                            No reviews
                        </span>
                    </div>

                    {/* Availability */}
                    <div className="flex items-center gap-2 mb-4 text-sm">
                        <span className="font-bold text-gray-700 dark:text-gray-300">
                            Availability:
                        </span>
                        <span className="flex items-center gap-1 text-green-600 font-medium">
                            <CheckCircle2 className="h-4 w-4" /> 12 in stock
                        </span>
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline gap-3 mb-4">
                        <span className="text-2xl font-black text-gray-900 dark:text-white">
                            ${product.price}
                        </span>
                        {product.originalPrice && (
                            <span className="text-lg text-gray-400 line-through">
                                ${product.originalPrice}
                            </span>
                        )}
                        {discount > 0 && (
                            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded">
                                {discount}% off
                            </span>
                        )}
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
                        {product.description ||
                            "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s."}
                    </p>

                    {/* Countdown */}
                    <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg flex justify-between items-center mb-6 text-sm font-medium">
                        <span>Hurry up! Sale ends in:</span>
                        <span className="font-bold font-mono">
                            8536 : 09 : 58 : 47
                        </span>
                    </div>

                    {/* Size Selector */}
                    <div className="mb-4">
                        <span className="text-sm font-bold text-gray-800 dark:text-gray-200 block mb-2">
                            Size:
                        </span>
                        <div className="flex gap-2">
                            {["1KG", "2KG", "5KG"].map((size) => (
                                <button
                                    type="button"
                                    key={size}
                                    onClick={() => setSelectedSize(size)}
                                    className={`px-4 py-1.5 text-xs font-semibold rounded border transition-colors cursor-pointer ${
                                        selectedSize === size
                                            ? "border-orange-400 text-orange-500 bg-orange-50 dark:bg-orange-900/20"
                                            : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300"
                                    }`}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Material Selector */}
                    <div className="mb-6">
                        <span className="text-sm font-bold text-gray-800 dark:text-gray-200 block mb-2">
                            Material:
                        </span>
                        <div className="flex gap-2">
                            {["CANADA", "INDIA", "GERMANY"].map((material) => (
                                <button
                                    type="button"
                                    key={material}
                                    onClick={() => setSelectedMaterial(material)}
                                    className={`px-4 py-1.5 text-xs font-semibold rounded border transition-colors cursor-pointer ${
                                        selectedMaterial === material
                                            ? "border-orange-400 text-orange-500 bg-orange-50 dark:bg-orange-900/20"
                                            : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300"
                                    }`}
                                >
                                    {material}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Quantity */}
                    <div className="flex items-center gap-4 mb-6">
                        <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
                            Quantity:
                        </span>
                        <div className="flex items-center border border-gray-300 dark:border-gray-700 rounded-md overflow-hidden">
                            <button
                                type="button"
                                onClick={() =>
                                    setQuantity((q) => Math.max(1, q - 1))
                                }
                                className="px-3 py-1.5 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                            >
                                -
                            </button>
                            <span className="w-10 text-center text-sm font-semibold">
                                {quantity}
                            </span>
                            <button
                                type="button"
                                onClick={() => setQuantity((q) => q + 1)}
                                className="px-3 py-1.5 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                            >
                                +
                            </button>
                        </div>
                    </div>

                    {/* Action Buttons & Wishlist Line */}
                    <div className="flex flex-col sm:flex-row items-center gap-3 mt-auto">
                        {/* Wishlist Button */}
                        <button
                            type="button"
                            onClick={() => setIsWishlisted(!isWishlisted)}
                            className={`flex items-center justify-center h-[46px] w-[46px] shrink-0 border rounded-md transition-colors cursor-pointer ${
                                isWishlisted
                                    ? "border-red-500 text-red-500 bg-red-50 dark:bg-red-900/20"
                                    : "border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:text-red-500 hover:border-red-500"
                            }`}
                            title="Add to Wishlist"
                        >
                            <Heart
                                className={`h-5 w-5 ${
                                    isWishlisted ? "fill-current" : ""
                                }`}
                            />
                        </button>

                        {/* Add to Cart Button */}
                        <button
                            type="button"
                            onClick={handleAddToCart}
                            className="flex-1 w-full flex items-center justify-center gap-2 bg-[#f79b52] text-white py-3 px-4 rounded-md hover:bg-[#e08942] transition-all font-bold text-sm h-[46px] cursor-pointer"
                        >
                            Add to cart
                        </button>

                        {/* Buy Now Button */}
                        <button
                            type="button"
                            onClick={handleBuyNow}
                            className="flex-1 w-full flex items-center justify-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-3 px-4 rounded-md hover:bg-gray-800 dark:hover:bg-gray-100 transition-all font-bold text-sm h-[46px] cursor-pointer"
                        >
                            Buy it now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}