// components/terms-conditions/types.ts

export interface TermsSeoMeta {
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

export interface TermsSectionItem {
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

export interface TermsPageData {
  title?: string;
  subtitle?: string;
  slug?: string;
  type?: string;
  version?: string | null;
  effective_date?: string | null;
  expiration_date?: string | null;
  updated_at?: string;
  last_updated?: string;
  seo?: TermsSeoMeta;
  body_html?: string | null;
  sections?: TermsSectionItem[];
  content?: string | null;
  body?: string | null;
}

export interface TermsApiResponse {
  success?: boolean;
  data?: TermsPageData;
  title?: string;
  body_html?: string | null;
  sections?: TermsSectionItem[];
}