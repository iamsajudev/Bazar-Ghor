// store/useCartStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ApiCartItem {
  id?: number;
  variant_id: number;
  name?: string;
  title?: string;
  price_minor?: number;
  unit_price_minor?: number;
  quantity: number;
  image_url?: string | null;
  thumbnail_url?: string | null;
}

export interface CartItem {
  id: number;
  variant_id: number;
  name: string;
  price: number; // In Taka (UI Display)
  quantity: number;
  image: string;
}

interface AddItemInput {
  id: number;
  title: string;
  price: number; // Minor units from product page (e.g. 119900)
  image: string;
  variantId: number;
  quantity?: number;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  guestToken: string | null;
  priceMapByVariant: Record<number, number>; // variantId -> price in Taka

  fetchCart: () => Promise<void>;
  addItem: (item: AddItemInput, isRetry?: boolean) => Promise<boolean>;
  removeItem: (variantId: number) => Promise<void>;
  updateQuantity: (variantId: number, quantity: number) => Promise<void>;
  toggleCart: () => void;
  closeCart: () => void;
  clearCart: () => void;
}

const getBaseUrl = () => {
  const raw =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    'https://ecommerce.flixzaglobal.us/api/v1';
  return raw.replace(/\/+$/, '');
};

const getHeaders = (token?: string | null): HeadersInit => ({
  'Content-Type': 'application/json',
  Accept: 'application/json',
  ...(token ? { 'X-Guest-Cart-Token': token } : {}),
});

const extractToken = (res: Response, json: any): string | null => {
  return (
    res.headers.get('X-Guest-Cart-Token') ||
    res.headers.get('x-guest-cart-token') ||
    json?.guest_cart_token ||
    json?.guest_token ||
    json?.token ||
    json?.data?.guest_cart_token ||
    json?.data?.guest_token ||
    null
  );
};

const extractApiPriceTaka = (raw: any): number | null => {
  const minorCandidates = [
    raw?.price_minor,
    raw?.unit_price_minor,
    raw?.effective_price_minor,
    raw?.variant?.effective_price_minor,
    raw?.variant?.price_minor,
    raw?.product?.price_minor,
  ];

  for (const val of minorCandidates) {
    if (typeof val === 'number' && !Number.isNaN(val) && val > 0) {
      return val / 100;
    }
    if (typeof val === 'string' && val.trim() !== '' && !Number.isNaN(Number(val)) && Number(val) > 0) {
      return Number(val) / 100;
    }
  }

  const directCandidates = [
    raw?.unit_price,
    raw?.price,
    raw?.variant?.price,
  ];

  for (const val of directCandidates) {
    if (typeof val === 'number' && !Number.isNaN(val) && val > 0) {
      return val;
    }
    if (typeof val === 'string' && val.trim() !== '' && !Number.isNaN(Number(val)) && Number(val) > 0) {
      return Number(val);
    }
  }

  return null;
};

const mapToUiItem = (
  raw: any,
  context: {
    priceMap: Record<number, number>;
    existingItems: CartItem[];
    fallback?: {
      id?: number;
      variantId?: number;
      name?: string;
      priceTaka?: number;
      image?: string;
    };
  }
): CartItem => {
  const variantId = Number(raw?.variant_id ?? raw?.variantId ?? context.fallback?.variantId ?? 0);
  const existing = context.existingItems.find((i) => i.variant_id === variantId);

  const apiPrice = extractApiPriceTaka(raw);
  const resolvedPrice =
    apiPrice ??
    context.fallback?.priceTaka ??
    context.priceMap[variantId] ??
    existing?.price ??
    0;

  return {
    id: raw?.id ?? existing?.id ?? context.fallback?.id ?? variantId,
    variant_id: variantId,
    name:
      raw?.name ||
      raw?.title ||
      raw?.product?.name ||
      context.fallback?.name ||
      existing?.name ||
      'Product',
    price: resolvedPrice,
    quantity: Number(raw?.quantity ?? 1),
    image:
      raw?.thumbnail_url ||
      raw?.image_url ||
      raw?.variant?.image_url ||
      raw?.product?.thumbnail_url ||
      raw?.product?.image_url ||
      context.fallback?.image ||
      existing?.image ||
      '/images/product-not-found.webp',
  };
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      guestToken: null,
      priceMapByVariant: {},

      fetchCart: async () => {
        try {
          const { guestToken, priceMapByVariant, items: existingItems } = get();

          const res = await fetch(`${getBaseUrl()}/cart`, {
            method: 'GET',
            headers: getHeaders(guestToken),
            cache: 'no-store',
          });

          const json = await res.json().catch(() => ({}));
          const token = extractToken(res, json);
          if (token) {
            set({ guestToken: token });
          }

          if (res.status === 404) {
            set({ items: [] });
            return;
          }

          if (!res.ok) {
            throw new Error(`Failed to fetch cart (${res.status})`);
          }

          const rawItems = json?.data?.items ?? json?.items ?? [];
          const uiItems: CartItem[] = Array.isArray(rawItems)
            ? rawItems.map((item) =>
                mapToUiItem(item, {
                  priceMap: priceMapByVariant,
                  existingItems,
                })
              )
            : [];

          set({ items: uiItems });
        } catch (error) {
          console.error('Cart fetch error:', error);
        }
      },

      addItem: async (
        { id, title, price, image, variantId, quantity = 1 },
        isRetry = false
      ) => {
        try {
          const priceTaka = price / 100;

          // আগে থেকেই এই variantId-এর প্রাইস ও ইমেজ ম্যাপে সেভ করে রাখছি
          set((state) => ({
            priceMapByVariant: {
              ...state.priceMapByVariant,
              ...(priceTaka > 0 ? { [variantId]: priceTaka } : {}),
            },
          }));

          const { guestToken } = get();

          const res = await fetch(`${getBaseUrl()}/cart/items`, {
            method: 'POST',
            headers: getHeaders(guestToken),
            body: JSON.stringify({
              variant_id: variantId,
              quantity,
            }),
          });

          const json = await res.json().catch(() => ({}));
          const token = extractToken(res, json);
          if (token) {
            set({ guestToken: token });
          }

          if (
            res.status === 422 &&
            !isRetry &&
            typeof json?.message === 'string' &&
            json.message.toLowerCase().includes('guest cart')
          ) {
            set({ guestToken: null });
            await get().fetchCart();
            return await get().addItem(
              { id, title, price, image, variantId, quantity },
              true
            );
          }

          if (!res.ok) {
            console.error('Add to cart API response:', res.status, json);
            throw new Error(json?.message || `Add failed (${res.status})`);
          }

          const { priceMapByVariant, items: existingItems } = get();
          const rawItemsList = json?.data?.items ?? json?.items;

          if (Array.isArray(rawItemsList) && rawItemsList.length > 0) {
            const mappedList = rawItemsList.map((item) => {
              const itemVariantId = Number(item?.variant_id ?? item?.variantId);
              const isCurrentAdded = itemVariantId === variantId;

              return mapToUiItem(item, {
                priceMap: priceMapByVariant,
                existingItems,
                fallback: isCurrentAdded
                  ? {
                      id,
                      variantId,
                      name: title,
                      priceTaka: priceTaka > 0 ? priceTaka : undefined,
                      image,
                    }
                  : undefined,
              });
            });

            set({
              items: mappedList,
              isOpen: true,
            });
            return true;
          }

          const rawItem = json?.data?.item ??
            json?.item ??
            json?.data ?? {
              id,
              variant_id: variantId,
              name: title,
              quantity,
            };

          const newItem = mapToUiItem(rawItem, {
            priceMap: priceMapByVariant,
            existingItems,
            fallback: {
              id,
              variantId,
              name: title,
              priceTaka: priceTaka > 0 ? priceTaka : undefined,
              image,
            },
          });

          set((state) => {
            const existingIndex = state.items.findIndex(
              (i) => i.variant_id === newItem.variant_id
            );

            let updatedItems: CartItem[];
            if (existingIndex >= 0) {
              updatedItems = state.items.map((item, index) =>
                index === existingIndex
                  ? {
                      ...item,
                      quantity: newItem.quantity || item.quantity + quantity,
                      price: newItem.price || item.price,
                      image: newItem.image || item.image,
                    }
                  : item
              );
            } else {
              updatedItems = [...state.items, newItem];
            }

            return {
              items: updatedItems,
              isOpen: true,
            };
          });

          return true;
        } catch (error) {
          console.error('Add to cart error:', error);
          alert('Failed to add item to cart. Please try again.');
          return false;
        }
      },

      removeItem: async (variantId) => {
        try {
          const { guestToken, priceMapByVariant, items: existingItems } = get();
          const res = await fetch(`${getBaseUrl()}/cart/items/${variantId}`, {
            method: 'DELETE',
            headers: getHeaders(guestToken),
          });

          const json = await res.json().catch(() => ({}));
          const rawItemsList = json?.data?.items ?? json?.items;

          if (Array.isArray(rawItemsList)) {
            set({
              items: rawItemsList.map((item) =>
                mapToUiItem(item, { priceMap: priceMapByVariant, existingItems })
              ),
            });
            return;
          }

          set((state) => ({
            items: state.items.filter((i) => i.variant_id !== variantId),
          }));
        } catch (error) {
          console.error('Remove error:', error);
        }
      },

      updateQuantity: async (variantId, quantity) => {
        try {
          const { guestToken, priceMapByVariant, items: existingItems } = get();
          if (quantity <= 0) {
            await get().removeItem(variantId);
            return;
          }

          const res = await fetch(`${getBaseUrl()}/cart/items/${variantId}`, {
            method: 'PATCH',
            headers: getHeaders(guestToken),
            body: JSON.stringify({ quantity }),
          });

          const json = await res.json().catch(() => ({}));
          const rawItemsList = json?.data?.items ?? json?.items;

          if (Array.isArray(rawItemsList)) {
            set({
              items: rawItemsList.map((item) =>
                mapToUiItem(item, { priceMap: priceMapByVariant, existingItems })
              ),
            });
            return;
          }

          set((state) => ({
            items: state.items.map((i) =>
              i.variant_id === variantId ? { ...i, quantity } : i
            ),
          }));
        } catch (error) {
          console.error('Update qty error:', error);
        }
      },

      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      closeCart: () => set({ isOpen: false }),
      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({
        guestToken: state.guestToken,
        priceMapByVariant: state.priceMapByVariant,
      }),
    }
  )
);