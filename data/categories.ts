// types/category.ts (অথবা আপনার প্রজেক্টের টাইপ ফাইলে)
export interface ApiCategory {
  id: number;
  parent_id: number | null;
  name: string;
  slug: string;
  image_id: number | null;
}

export interface CategoryApiResponse {
  data: ApiCategory[];
}