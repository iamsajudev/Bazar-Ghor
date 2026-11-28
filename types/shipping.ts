// components/shipping/types.ts

export interface ShippingMethodItem {
  id: number | string;
  name?: string;
  title?: string;
  code?: string;
  description?: string | null;
  carrier?: string | null;
  estimated_days?: string | null;
  delivery_time?: string | null;
  fee_minor?: number | null;
  price_minor?: number | null;
  amount_minor?: number | null;
  currency_code?: string | null;
  is_default?: boolean;
}

export interface ShippingMethodsPayload {
  checkout_mode?: string;
  shipping_method_required?: boolean;
  methods?: ShippingMethodItem[];
  default_shipping?: ShippingMethodItem | null;
  note?: string | null;
  currency_code?: string | null;
}

export interface ShippingAreaItem {
  id?: number | string;
  name?: string;
  area?: string;
  city?: string | null;
  region?: string | null;
  state?: string | null;
  country_code?: string | null;
  postal_code?: string | null;
  zone_name?: string | null;
}

export interface ShippingAreasPaginatedData {
  current_page?: number;
  data?: ShippingAreaItem[];
  last_page?: number;
  per_page?: number;
  total?: number;
}