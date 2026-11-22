const FEATURED_FILE = "featured-products.json";
const SETTINGS_BUCKET = "site-settings";
export const MAX_FEATURED_PRODUCTS = 8;

function storageHeaders() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  return {
    Authorization: `Bearer ${key}`,
    apikey: key,
  };
}

function storageUrl(cacheBust = false) {
  const base = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/${SETTINGS_BUCKET}/${FEATURED_FILE}`;
  return cacheBust ? `${base}?t=${Date.now()}` : base;
}

export function sanitizeFeaturedProductIds(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  const ids: string[] = [];
  for (const item of input) {
    if (typeof item !== "string") continue;
    const id = item.trim();
    if (!id || ids.includes(id)) continue;
    ids.push(id.slice(0, 80));
    if (ids.length >= MAX_FEATURED_PRODUCTS) break;
  }
  return ids;
}

export async function getFeaturedProductIds(): Promise<string[]> {
  try {
    const response = await fetch(storageUrl(true), {
      cache: "no-store",
      headers: storageHeaders(),
    });
    if (response.status === 400 || response.status === 404) return [];
    if (!response.ok) return [];
    return sanitizeFeaturedProductIds(JSON.parse(await response.text()));
  } catch {
    return [];
  }
}

export async function saveFeaturedProductIds(input: unknown) {
  const productIds = sanitizeFeaturedProductIds(input);
  const response = await fetch(storageUrl(), {
    method: "POST",
    cache: "no-store",
    headers: {
      ...storageHeaders(),
      "Content-Type": "application/json",
      "cache-control": "0",
      "x-upsert": "true",
    },
    body: JSON.stringify(productIds),
  });
  if (!response.ok) {
    return {
      productIds,
      error: new Error("No se pudieron guardar los productos de la portada"),
    };
  }
  return { productIds, error: null };
}
