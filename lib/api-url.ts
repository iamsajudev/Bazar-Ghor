// lib/api-url.ts
export function buildApiUrl(path: string): string {
  const rawBase = (
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "https://ecommerce.goflixza.com/api/v1"
  )
    .trim()
    .replace(/\/+$/, "");

  const cleanPath = `/${path.replace(/^\/+/, "")}`;

  if (rawBase.endsWith("/api/v1") && cleanPath.startsWith("/api/v1/")) {
    return `${rawBase}${cleanPath.slice("/api/v1".length)}`;
  }

  return `${rawBase}${cleanPath}`;
}