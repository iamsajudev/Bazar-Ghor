import { create } from 'zustand';

export interface CartItem {
  id: number;
  title: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  toggleCart: () => void;
  closeCart: () => void;
  buyNow: (item: Omit<CartItem, 'quantity'>) => void;
}

export const useCartStore = create<CartStore>((set) => ({
  items: [],
  isOpen: false,
  addItem: (item) => set((state) => {
    const existingItem = state.items.find((i) => i.id === item.id);
    if (existingItem) {
      // যদি প্রোডাক্ট আগে থেকেই থাকে, তবে কোয়ান্টিটি ১ বাড়বে
      return {
        items: state.items.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        ),
      };
    }
    // নতুন প্রোডাক্ট হিসেবে যোগ হবে
    return { items: [...state.items, { ...item, quantity: 1 }] };
  }),
  removeItem: (id) => set((state) => ({
    items: state.items.filter((i) => i.id !== id),
  })),
  updateQuantity: (id, quantity) => set((state) => ({
    items: state.items.map((i) =>
      i.id === id ? { ...i, quantity: Math.max(1, quantity) } : i
    ),
  })),
  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
  closeCart: () => set({ isOpen: false }),
  buyNow: (item) => set((state) => {
    const existingItem = state.items.find((i) => i.id === item.id);
    let updatedItems;
    if (existingItem) {
      updatedItems = state.items.map((i) =>
        i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
      );
    } else {
      updatedItems = [...state.items, { ...item, quantity: 1 }];
    }
    return { items: updatedItems, isOpen: false };
  }),
}));