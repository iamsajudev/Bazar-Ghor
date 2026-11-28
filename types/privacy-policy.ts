// components/privacy-policy/types.ts

export interface PrivacySeoMeta {
  meta_title?: string | null;
  meta_description?: string | null;
  meta_keywords?: string | null;
  meta_tags?: string | null;
  og_title?: string | null;
  og_description?: string | null;
  canonical_url?: string | null;
  robots?: string | null;
  og_image_url?: string | null;
}

export interface PrivacySectionItem {
  id?: string | number;
  title?: string;
  heading?: string;
  label?: string;
  content?: string | string[] | null;
  body?: string | string[] | null;
  description?: string | null;
  html?: string | null;
  paragraphs?: string[];
  items?: string[];
  bullets?: string[];
}

export interface PrivacyPolicyData {
  title?: string;
  subtitle?: string;
  slug?: string;
  type?: string;
  version?: string | null;
  effective_date?: string | null;
  expiration_date?: string | null;
  updated_at?: string;
  last_updated?: string;
  seo?: PrivacySeoMeta;
  body_html?: string | null;
  sections?: PrivacySectionItem[];
  content?: string | null;
  body?: string | null;
}

export interface PrivacyPolicyApiResponse {
  success?: boolean;
  data?: PrivacyPolicyData;
  title?: string;
  body_html?: string | null;
  sections?: PrivacySectionItem[];
}