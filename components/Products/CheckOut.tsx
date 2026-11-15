"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
    ChevronRight, CreditCard, Truck, ShieldCheck,
    MapPin, Phone, Mail, User, CheckCircle2, ShoppingBag, Tag, FileText, Percent
} from "lucide-react";
import { useCartStore } from "@/store/useCartStore";

export default function CheckoutPage() {
    const router = useRouter();
    const { items } = useCartStore();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        address: "",
        city: "Dhaka",
        area: "",
        zipCode: "",
        paymentMethod: "cod", // cod, card, bkash
        bkashNumber: "",
        orderNote: "",
        // ✅ কার্ড ফিল্ড যোগ করা হলো
        cardNumber: "",
        cardExpiry: "",
        cardCvv: "",
        cardName: "",
    });

    const [couponCode, setCouponCode] = useState("");
    const [discount, setDiscount] = useState(0);
    const [couponApplied, setCouponApplied] = useState(false);

    // Subtotal calculation
    const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

    // Delivery charge based on city
    const deliveryCharge = formData.city.toLowerCase() === "dhaka" ? 60 : 120;
    const finalTotal = subtotal + deliveryCharge - discount;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // ✅ কুপন ফাংশন আপডেট
    const handleApplyCoupon = () => {
        if (couponCode.toUpperCase() === "BAZAR10") {
            const disc = subtotal * 0.1;
            setDiscount(disc);
            setCouponApplied(true);
        } else {
            alert("Invalid Coupon Code! Try 'BAZAR10'");
        }
    };

    // ✅ অর্ডার প্লেস ফাংশন আপডেট
    const handlePlaceOrder = (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.paymentMethod === "bkash" && !formData.bkashNumber) {
            alert("Please provide your bKash number.");
            return;
        }

        if (formData.paymentMethod === "card") {
            if (!formData.cardNumber || !formData.cardExpiry || !formData.cardCvv || !formData.cardName) {
                alert("Please fill in all card details.");
                return;
            }
        }

        alert("Order placed successfully! Thank you for shopping with BazarGhor.");
        router.push("/");
    };

    if (items.length === 0) {
        return (
            <div className="container mx-auto px-4 py-20 text-center min-h-[60vh] flex flex-col items-center justify-center">
                <ShoppingBag className="h-20 w-20 text-gray-300 mb-4" />
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                    Your cart is empty
                </h1>
                <p className="text-gray-500 mb-6">Add some products to your cart to proceed with checkout.</p>
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 bg-[#f76b1c] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#e05a12] transition-colors shadow-sm"
                >
                    Continue Shopping <ChevronRight className="h-4 w-4" />
                </Link>
            </div>
        );
    }

    return (
        <div className="mx-auto px-4 py-8 container">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                <Link href="/" className="hover:text-[#f76b1c] transition-colors">Home</Link>
                <ChevronRight className="h-4 w-4" />
                <span className="text-gray-800 dark:text-gray-200 font-medium">Checkout</span>
            </nav>

            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white mb-8">
                Secure Checkout
            </h1>

            <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* Left: Shipping & Payment Form (7 Cols) */}
                <div className="lg:col-span-7 space-y-6">

                    {/* Shipping Address */}
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-xs">
                        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-5 flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-[#f76b1c]" /> Shipping Information
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1.5 block">
                                    Full Name <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        placeholder="Sazeduzzaman Saju"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-transparent focus:ring-2 focus:ring-[#f76b1c] outline-none text-sm transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1.5 block">
                                    Phone Number <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
                                    <input
                                        type="tel"
                                        name="phone"
                                        required
                                        placeholder="017XXXXXXXX"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-transparent focus:ring-2 focus:ring-[#f76b1c] outline-none text-sm transition-all"
                                    />
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1.5 block">
                                    Email Address (Optional)
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="sazeduzzaman@example.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-transparent focus:ring-2 focus:ring-[#f76b1c] outline-none text-sm transition-all"
                                    />
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1.5 block">
                                    Delivery Address <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    name="address"
                                    required
                                    rows={3}
                                    placeholder="House/Road, Area, Thana..."
                                    value={formData.address}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-transparent focus:ring-2 focus:ring-[#f76b1c] outline-none text-sm resize-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1.5 block">
                                    City / Region <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 focus:ring-2 focus:ring-[#f76b1c] outline-none text-sm transition-all cursor-pointer"
                                >
                                    <option value="Dhaka">Inside Dhaka</option>
                                    <option value="Outside Dhaka">Outside Dhaka</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1.5 block">
                                    Postal / Zip Code
                                </label>
                                <input
                                    type="text"
                                    name="zipCode"
                                    placeholder="1216"
                                    value={formData.zipCode}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-transparent focus:ring-2 focus:ring-[#f76b1c] outline-none text-sm transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Payment Method */}
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-xs">
                        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-5 flex items-center gap-2">
                            <CreditCard className="h-5 w-5 text-[#f76b1c]" /> Payment Method
                        </h2>

                        <div className="space-y-3">
                            <label className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.paymentMethod === "cod" ? "border-[#f76b1c] bg-orange-50/40 dark:bg-orange-950/10" : "border-gray-200 dark:border-gray-700"}`}>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="cod"
                                        checked={formData.paymentMethod === "cod"}
                                        onChange={handleChange}
                                        className="w-4 h-4 accent-[#f76b1c]"
                                    />
                                    <div>
                                        <span className="font-bold text-sm block text-gray-900 dark:text-white">Cash on Delivery</span>
                                        <p className="text-xs text-gray-500">Pay securely when your order arrives</p>
                                    </div>
                                </div>
                                <Truck className="h-5 w-5 text-gray-400" />
                            </label>

                            <label className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.paymentMethod === "bkash" ? "border-[#f76b1c] bg-orange-50/40 dark:bg-orange-950/10" : "border-gray-200 dark:border-gray-700"}`}>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="bkash"
                                        checked={formData.paymentMethod === "bkash"}
                                        onChange={handleChange}
                                        className="w-4 h-4 accent-[#f76b1c]"
                                    />
                                    <div>
                                        <span className="font-bold text-sm block text-gray-900 dark:text-white">bKash / Mobile Banking</span>
                                        <p className="text-xs text-gray-500">Instant digital wallet payment</p>
                                    </div>
                                </div>
                                <span className="bg-pink-100 text-pink-600 text-xs font-bold px-2 py-1 rounded">bKash</span>
                            </label>

                            {formData.paymentMethod === "bkash" && (
                                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 space-y-2">
                                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block">
                                        Enter your bKash Account Number:
                                    </label>
                                    <input
                                        type="tel"
                                        name="bkashNumber"
                                        placeholder="017XXXXXXXX"
                                        value={formData.bkashNumber}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900 outline-none"
                                    />
                                </div>
                            )}

                            <label className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.paymentMethod === "card" ? "border-[#f76b1c] bg-orange-50/40 dark:bg-orange-950/10" : "border-gray-200 dark:border-gray-700"}`}>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="card"
                                        checked={formData.paymentMethod === "card"}
                                        onChange={handleChange}
                                        className="w-4 h-4 accent-[#f76b1c]"
                                    />
                                    <div>
                                        <span className="font-bold text-sm block text-gray-900 dark:text-white">Credit / Debit Card</span>
                                        <p className="text-xs text-gray-500">Visa, Mastercard, or American Express</p>
                                    </div>
                                </div>
                                <CreditCard className="h-5 w-5 text-gray-400" />
                            </label>

                            {/* ✅ কার্ড পেমেন্ট ফর্ম */}
                            {formData.paymentMethod === "card" && (
                                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 space-y-3 mt-3">
                                    <div>
                                        <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                                            Card Number
                                        </label>
                                        <input
                                            type="text"
                                            name="cardNumber"
                                            placeholder="1234 5678 9012 3456"
                                            value={formData.cardNumber}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900 outline-none focus:ring-1 focus:ring-[#f76b1c]"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                                                Expiry Date
                                            </label>
                                            <input
                                                type="text"
                                                name="cardExpiry"
                                                placeholder="MM/YY"
                                                value={formData.cardExpiry}
                                                onChange={handleChange}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900 outline-none focus:ring-1 focus:ring-[#f76b1c]"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                                                CVV
                                            </label>
                                            <input
                                                type="text"
                                                name="cardCvv"
                                                placeholder="123"
                                                value={formData.cardCvv}
                                                onChange={handleChange}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900 outline-none focus:ring-1 focus:ring-[#f76b1c]"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                                            Name on Card
                                        </label>
                                        <input
                                            type="text"
                                            name="cardName"
                                            placeholder="John Doe"
                                            value={formData.cardName}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900 outline-none focus:ring-1 focus:ring-[#f76b1c]"
                                        />
                                    </div>

                                    {/* পেমেন্ট অপারেটর লোগো */}
                                    <div className="flex items-center gap-3 pt-2">
                                        <span className="text-[10px] font-semibold text-gray-500">We Accept:</span>
                                        <div className="flex gap-1.5">
                                            <span className="bg-blue-800 text-white text-[10px] font-bold px-2 py-0.5 rounded">VISA</span>
                                            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">MC</span>
                                            <span className="bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">AMEX</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Order Note */}
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-xs">
                        <h2 className="text-base font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                            <FileText className="h-4 w-4 text-[#f76b1c]" /> Order Notes (Optional)
                        </h2>
                        <textarea
                            name="orderNote"
                            rows={2}
                            placeholder="Notes about your order, e.g. special notes for delivery."
                            value={formData.orderNote}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-transparent focus:ring-2 focus:ring-[#f76b1c] outline-none text-sm resize-none"
                        />
                    </div>
                </div>

                {/* Right: Order Summary (5 Cols) */}
                <div className="lg:col-span-5 sticky top-24">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-xs space-y-6">
                        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 border-b border-gray-100 dark:border-gray-800 pb-4">
                            Order Summary ({items.length} items)
                        </h2>

                        {/* Items List */}
                        <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
                            {items.map((item) => (
                                <div key={item.id} className="flex items-center gap-3">
                                    <div className="relative w-14 h-14 bg-gray-50 dark:bg-gray-800 rounded-xl overflow-hidden shrink-0 border border-gray-100 dark:border-gray-700">
                                        <Image src={item.image} alt={item.title} fill className="object-contain p-1" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold line-clamp-1 text-gray-900 dark:text-white">{item.title}</p>
                                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                    </div>
                                    <p className="text-sm font-extrabold text-[#f76b1c]">৳{(item.price * item.quantity).toFixed(2)}</p>
                                </div>
                            ))}
                        </div>

                        {/* Coupon Code Section */}
                        <div className="pt-2">
                            <div className="flex gap-2"> {/* ✅ flex কন্টেইনার */}
                                <div className="relative flex-1">
                                    <Tag className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Coupon code (e.g. BAZAR10)"
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value)}
                                        className="w-full pl-9 pr-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-xs bg-transparent uppercase outline-none focus:ring-1 focus:ring-[#f76b1c]"
                                    />
                                </div>
                                <button
                                    type="button" // ✅ type="button"
                                    onClick={handleApplyCoupon} // ✅ onClick
                                    className="bg-gray-900 dark:bg-gray-800 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-gray-800 transition-colors cursor-pointer"
                                >
                                    Apply
                                </button>
                            </div>
                            {couponApplied && (
                                <p className="text-xs text-green-600 font-semibold mt-1 flex items-center gap-1">
                                    <Percent className="h-3 w-3" /> 10% discount applied successfully!
                                </p>
                            )}
                        </div>

                        {/* Totals Breakdown */}
                        <div className="space-y-2.5 pt-4 border-t border-gray-100 dark:border-gray-800 text-sm">
                            <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                <span>Subtotal</span>
                                <span className="font-semibold text-gray-900 dark:text-white">৳{subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                <span>Delivery Fee ({formData.city})</span>
                                <span className="font-semibold text-gray-900 dark:text-white">৳{deliveryCharge.toFixed(2)}</span>
                            </div>
                            {discount > 0 && (
                                <div className="flex justify-between text-green-600">
                                    <span>Discount</span>
                                    <span className="font-semibold">-৳{discount.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-lg font-extrabold pt-3 border-t border-gray-100 dark:border-gray-800 text-gray-900 dark:text-white">
                                <span>Total Payable</span>
                                <span className="text-[#f76b1c]">৳{finalTotal.toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="w-full bg-[#f76b1c] hover:bg-[#e05a12] text-white py-3.5 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 shadow-md cursor-pointer text-sm md:text-base"
                        >
                            <CheckCircle2 className="h-5 w-5" /> Place Order (৳{finalTotal.toFixed(2)})
                        </button>

                        {/* Trust Badge */}
                        <div className="flex items-center justify-center gap-2 text-xs text-gray-500 pt-2 border-t border-gray-100 dark:border-gray-800">
                            <ShieldCheck className="h-4 w-4 text-green-600" />
                            <span>100% Secure & Safe Checkout</span>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}