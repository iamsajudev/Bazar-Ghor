// components/analytics/types.ts

export interface TrackingConfigItem {
  provider: string; // e.g., "ga4", "meta_pixel" / "facebook_pixel" / "fbq"
  public_identifier: string; // e.g., "G-XXXX" or pixel ID
  consent_required?: boolean;
  is_active?: boolean;
}

export interface TrackingApiResponse {
  success?: boolean;
  data?: TrackingConfigItem[];
}