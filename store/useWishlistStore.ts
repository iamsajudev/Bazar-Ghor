import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface WishlistItem {
  id: number;
  title: string;
  price: number;
  image: string;
  slug?: string;
  variantId?: number | null;
}

interface RawWishlistEntry {
  id?: number | string;
  product_id?: number | string;
  product?: {
    id?: number | string;
    name?: string;
    title?: string;
    slug?: string;
    price?: number | string;
    price_minor?: number | string;
    image?: string | { url?: string };
    thumbnail?: string | { url?: string };
  };
  title?: string;
  name?: string;
  price?: number | string;
  image?: string | { url?: string };
  slug?: string;
  variant_id?: number | null;
}

interface WishlistStore {
  items: WishlistItem[];
  isHydrated: boolean;
  isSyncing: boolean;
  addItem: (item: WishlistItem) => Promise<void>;
  removeItem: (id: number) => Promise<void>;
  syncWithServer: () => Promise<void>;
  isInWishlist: (id: number) => boolean;
  setHydrated: () => void;
}

function resolveImage(img: unknown): string {
  if (typeof img === "string" && img.trim()) return img.trim();
  if (img && typeof img === "object" && "url" in img && typeof (img as { url?: unknown }).url === "string") {
    return ((img as { url: string }).url || "").trim();
  }
  return "/images/placeholder-category.png";
}

function normalizeServerWishlist(payload: unknown): WishlistItem[] | null {
  const root = payload as {
    data?:
    | RawWishlistEntry[]
    | { data?: RawWishlistEntry[]; items?: RawWishlistEntry[] };
    items?: RawWishlistEntry[];
    wishlist?: RawWishlistEntry[];
  };

  const list = Array.isArray(root?.data)
    ? root.data
    : Array.isArray((root?.data as { data?: RawWishlistEntry[] })?.data)
      ? (root.data as { data: RawWishlistEntry[] }).data
      : Array.isArray((root?.data as { items?: RawWishlistEntry[] })?.items)
        ? (root.data as { items: RawWishlistEntry[] }).items
        : Array.isArray(root?.items)
          ? root.items
          : Array.isArray(root?.wishlist)
            ? root.wishlist
            : null;

  if (!list) return null;

  return list.flatMap((entry): WishlistItem[] => {
    const prod = entry.product;
    const rawId = prod?.id ?? entry.product_id ?? entry.id;
    const numericId = Number(rawId);
    if (!Number.isFinite(numericId) || numericId <= 0) return [];

    const title =
      prod?.name ||
      prod?.title ||
      entry.title ||
      entry.name ||
      `Product #${numericId}`;
    const rawPrice = prod?.price ?? entry.price ?? 0;
    const numericPrice = Number(String(rawPrice).replace(/[^0-9.-]+/g, ""));
    const price = Number.isFinite(numericPrice) ? numericPrice : 0;
    const resolvedSlug = (prod?.slug ?? entry.slug)?.trim();

    return [
      {
        id: numericId,
        title,
        price,
        image: resolveImage(prod?.image ?? prod?.thumbnail ?? entry.image),
        ...(resolvedSlug ? { slug: resolvedSlug } : {}),
        variantId: entry.variant_id ?? null,
      },
    ];
  });
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      isHydrated: false,
      isSyncing: false,

      addItem: async (item) => {
        const previous = get().items;
        if (!previous.some((i) => i.id === item.id)) {
          set({ items: [...previous, item] });
        }

        try {
          const res = await fetch("/api/wishlist", {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              product_id: item.id,
              variant_id: item.variantId ?? null,
            }),
            cache: "no-store",
          });

          if (res.ok) {
            const body = await res.json().catch(() => null);
            const serverItems = normalizeServerWishlist(body);
            if (serverItems) {
              set({ items: serverItems });
            }
          }
        } catch {
          // Keep optimistic local item if offline/guest
        }
      },

      removeItem: async (id) => {
        const previous = get().items;
        set({ items: previous.filter((i) => i.id !== id) });

        try {
          const res = await fetch(`/api/wishlist/${encodeURIComponent(String(id))}`, {
            method: "DELETE",
            headers: { Accept: "application/json" },
            cache: "no-store",
          });

          if (res.ok) {
            const body = await res.json().catch(() => null);
            const serverItems = normalizeServerWishlist(body);
            if (serverItems) {
              set({ items: serverItems });
            }
          }
        } catch {
          // Keep local removal if offline/guest
        }
      },

      syncWithServer: async () => {
        set({ isSyncing: true });
        try {
          const res = await fetch("/api/wishlist", {
            method: "GET",
            headers: { Accept: "application/json" },
            cache: "no-store",
          });

          if (res.ok) {
            const body = await res.json();
            const serverItems = normalizeServerWishlist(body);
            if (serverItems) {
              set({ items: serverItems });
            }
          }
        } catch {
          // Keep persisted items on network error
        } finally {
          set({ isSyncing: false });
        }
      },

      isInWishlist: (id) => get().items.some((i) => i.id === id),
      setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: "wishlist-storage",
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    }
  )
);