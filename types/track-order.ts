// components/track-order/types.ts

export interface TrackOrderItem {
  id?: number | string;
  order_item_id?: number | string;
  name?: string;
  product_name?: string;
  variant_name?: string | null;
  sku?: string | null;
  quantity: number;
  unit_price_minor?: number;
  price_minor?: number;
  total_minor?: number;
  line_total_minor?: number;
  currency_code?: string | null;
  image_url?: string | null;
  thumbnail_url?: string | null;
}

export interface TrackOrderAddress {
  id?: number | string;
  type?: string;
  label?: string;
  recipient_name?: string;
  phone?: string;
  line1?: string;
  line2?: string | null;
  area?: string | null;
  city?: string | null;
  region?: string | null;
  postal_code?: string | null;
  country_code?: string | null;
}

export interface TrackOrderStatusHistoryItem {
  id?: number | string;
  status: string;
  note?: string | null;
  comment?: string | null;
  created_at?: string;
  timestamp?: string;
}

export interface TrackOrderDetail {
  id: number | string;
  order_number: string;
  status: string;
  payment_status?: string | null;
  payment_method?: string | null;
  currency_code?: string | null;
  subtotal_minor?: number | null;
  discount_minor?: number | null;
  tax_minor?: number | null;
  shipping_minor?: number | null;
  total_minor: number;
  created_at?: string;
  canceled_at?: string | null;
  items?: TrackOrderItem[];
  addresses?: TrackOrderAddress[];
  statusHistory?: TrackOrderStatusHistoryItem[];
  status_history?: TrackOrderStatusHistoryItem[];
}