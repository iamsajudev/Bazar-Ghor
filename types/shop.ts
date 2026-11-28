// components/shop/types.ts

export interface ShopCategoryItem {
  id: number | string;
  name: string;
  slug: string;
  parent_id?: number | string | null;
}

export interface ShopBrandItem {
  id: number | string;
  name: string;
  slug: string;
}

export interface ShopAttributeItem {
  id: number | string;
  name: string;
  slug?: string;
  values?: Array<string | { id?: number | string; name?: string; value?: string }>;
}

export interface RawShopVariant {
  id?: number | string;
  regular_price_minor?: number;
  sale_price_minor?: number | null;
  effective_price_minor?: number;
  price_minor?: number;
  compare_at_price_minor?: number | null;
  in_stock?: boolean;
  stock_quantity?: number;
}

export interface RawShopProduct {
  id: number | string;
  name?: string;
  title?: string;
  slug: string;
  short_description?: string | null;
  rating?: number;
  in_stock?: boolean;
  price_minor?: number;
  compare_at_price_minor?: number | null;
  sale_price_minor?: number | null;
  regular_price_minor?: number | null;
  thumbnail_url?: string | null;
  image_url?: string | null;
  primary_image?: { url?: string | null } | null;
  category?: { name?: string; slug?: string } | null;
  brand?: { name?: string; slug?: string } | null;
  variants?: RawShopVariant[];
}

export interface NormalizedShopProduct {
  id: number;
  title: string;
  slug: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  categoryName?: string;
  brandName?: string;
  inStock: boolean;
}

export interface ShopPaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

const DIVIDE_BY_100 = true;

export function toMajorAmount(minor?: number | null): number {
  if (typeof minor !== "number" || Number.isNaN(minor)) return 0;
  return DIVIDE_BY_100 ? Number((minor / 100).toFixed(2)) : minor;
}

export function normalizeShopProduct(
  raw: RawShopProduct
): NormalizedShopProduct | null {
  if (!raw || !raw.slug) return null;
  const title = (raw.name || raw.title || "").trim();
  if (!title) return null;

  const variant = raw.variants?.[0];
  const rawEffective =
    variant?.effective_price_minor ??
    variant?.sale_price_minor ??
    raw.sale_price_minor ??
    raw.price_minor ??
    variant?.regular_price_minor ??
    raw.regular_price_minor ??
    0;

  const rawOriginal =
    variant?.compare_at_price_minor ??
    raw.compare_at_price_minor ??
    variant?.regular_price_minor ??
    raw.regular_price_minor ??
    null;

  const price = toMajorAmount(rawEffective);
  const originalPrice =
    typeof rawOriginal === "number" && rawOriginal > rawEffective
      ? toMajorAmount(rawOriginal)
      : undefined;

  const image =
    raw.primary_image?.url?.trim() ||
    raw.thumbnail_url?.trim() ||
    raw.image_url?.trim() ||
    "/images/product-not-found.webp";

  const inStock =
    typeof raw.in_stock === "boolean"
      ? raw.in_stock
      : typeof variant?.in_stock === "boolean"
        ? variant.in_stock
        : true;

  return {
    id: Number(raw.id) || 0,
    title,
    slug: raw.slug,
    price,
    originalPrice,
    image,
    rating: typeof raw.rating === "number" ? raw.rating : 0,
    categoryName: raw.category?.name,
    brandName: raw.brand?.name,
    inStock,
  };
}