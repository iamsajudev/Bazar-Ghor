// components/CartDrawer.tsx
"use client";

import { useCartStore } from "@/store/useCartStore";
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useEffect } from "react";

export const CartDrawer = () => {
  const { items, isOpen, closeCart, removeItem, updateQuantity, fetchCart, guestToken } = useCartStore();

  // ✅ লজিক: ড্রয়ার খুললে বা টোকেন চেঞ্জ হলে ডাটা ফেচ করবে
  useEffect(() => {
    if (isOpen) {
      fetchCart();
    }
  }, [isOpen, guestToken, fetchCart]);

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 transition-opacity" onClick={closeCart} />
      )}

      <div className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white dark:bg-gray-950 z-50 border-l border-gray-200 dark:border-gray-800 transition-transform duration-300 ease-in-out transform ${isOpen ? "translate-x-0" : "translate-x-full"} flex flex-col`}>
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-green-50 dark:bg-green-950/40 text-green-600 rounded-lg">
              <ShoppingBag className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900 dark:text-white">Your Shopping Bag</h2>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">{items.length} items added</p>
            </div>
          </div>
          <button onClick={closeCart} className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 divide-y divide-gray-100 dark:divide-gray-900">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 mt-[-30px]">
              <div className="h-16 w-16 bg-green-50 dark:bg-green-950/30 text-green-600 rounded-full flex items-center justify-center mb-3">
                <ShoppingBag className="h-8 w-8 opacity-60" />
              </div>
              <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-1">Your cart is empty!</h3>
              <button onClick={closeCart} className="mt-4 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold px-5 py-2 rounded-lg transition-all cursor-pointer">
                Browse Products
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.variant_id} className="flex gap-3.5 pt-4 first:pt-0 group">
                <div className="relative h-16 w-16 bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden shrink-0 border border-gray-200 dark:border-gray-800">
                  <Image src={item.image || '/images/placeholder.png'} alt={item.name} fill className="object-contain p-1.5" />
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-semibold text-gray-800 dark:text-gray-200 line-clamp-2 leading-snug">{item.name}</h3>
                    <p className="text-xs font-bold text-green-600 mt-1">৳{item.price.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-900 overflow-hidden">
                      <button onClick={() => updateQuantity(item.variant_id, item.quantity - 1)} disabled={item.quantity <= 1} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors cursor-pointer disabled:opacity-50">
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="px-2.5 text-xs font-bold text-gray-800 dark:text-gray-200">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.variant_id, item.quantity + 1)} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors cursor-pointer">
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <button onClick={() => removeItem(item.variant_id)} className="p-1 text-gray-400 hover:text-red-600 rounded-md transition-colors cursor-pointer">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
            <div className="space-y-1.5 mb-3.5">
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>Subtotal</span>
                <span className="font-medium text-gray-800 dark:text-gray-200">৳{subtotal.toFixed(2)}</span>
              </div>
              <div className="pt-2 border-t border-gray-200 dark:border-gray-800 flex justify-between items-center">
                <span className="text-xs font-bold text-gray-900 dark:text-white">Total</span>
                <span className="text-base font-bold text-green-700 dark:text-green-500">৳{subtotal.toFixed(2)}</span>
              </div>
            </div>
            <Link href="/checkout" onClick={closeCart} className="w-full bg-green-600 hover:bg-green-700 text-white text-center py-2.5 rounded-lg font-bold text-xs transition-colors flex items-center justify-center gap-2 group">
              <span>Proceed to Checkout</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        )}
      </div>
    </>
  );
};