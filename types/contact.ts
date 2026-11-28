// components/contact/types.ts

export interface SiteEmailItem {
    title: string;
    email: string;
}

export interface SitePhoneItem {
    title: string;
    phone: string;
}

export interface SiteAddressItem {
    title: string;
    address: string;
}

export interface SiteContactPerson {
    name: string;
    designation?: string;
    email?: string;
    phone?: string;
}

export interface BusinessHourDay {
    open?: string;
    close?: string;
    closed?: boolean;
}

export interface SocialLinkItem {
    icon_class?: string;
    url: string;
}

export interface SiteSettings {
    website_name?: string;
    site_title?: string;
    site_tagline?: string;
    branding?: {
        site_logo?: string | null;
        logo_dark_url?: string | null;
        logo_light_url?: string | null;
        theme_color?: string;
    };
    contact?: {
        emails?: SiteEmailItem[];
        phones?: SitePhoneItem[];
        addresses?: SiteAddressItem[];
        contact_person?: SiteContactPerson;
    };
    social_links?: SocialLinkItem[];
    business_hours?: Record<string, BusinessHourDay>;
    currency?: string;
}

export interface SiteInformationResponse {
    success: boolean;
    settings?: SiteSettings;
}