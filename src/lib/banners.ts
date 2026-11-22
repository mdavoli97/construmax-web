const BANNERS_FILE = "banners.json";
const SETTINGS_BUCKET = "site-settings";
const MAX_BANNERS = 8;

export type PromoBanner = {
  id: string;
  imageUrl: string;
  href: string;
  alt: string;
};

function storageHeaders() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  return {
    Authorization: `Bearer ${key}`,
    apikey: key,
  };
}

function storageUrl(cacheBust = false) {
  const base = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/${SETTINGS_BUCKET}/${BANNERS_FILE}`;
  return cacheBust ? `${base}?t=${Date.now()}` : base;
}

function cleanHref(value: unknown) {
  if (typeof value !== "string") return "";
  const href = value.trim();
  if (!href) return "";
  if (href.startsWith("/") && !href.startsWith("//")) return href.slice(0, 300);
  try {
    const url = new URL(href);
    if (url.protocol === "http:" || url.protocol === "https:") {
      return url.toString().slice(0, 300);
    }
  } catch {
    return "";
  }
  return "";
}

export function sanitizeBanners(input: unknown): PromoBanner[] {
  if (!Array.isArray(input)) return [];
  const banners: PromoBanner[] = [];
  for (const item of input) {
    if (!item || typeof item !== "object") continue;
    const source = item as Partial<PromoBanner>;
    const imageUrl = typeof source.imageUrl === "string" ? source.imageUrl.trim() : "";
    if (!imageUrl.startsWith("https://")) continue;
    banners.push({
      id:
        typeof source.id === "string" && source.id.trim()
          ? source.id.trim().slice(0, 80)
          : crypto.randomUUID(),
      imageUrl: imageUrl.slice(0, 500),
      href: cleanHref(source.href),
      alt:
        typeof source.alt === "string" && source.alt.trim()
          ? source.alt.trim().slice(0, 120)
          : "Publicidad",
    });
    if (banners.length >= MAX_BANNERS) break;
  }
  return banners;
}

export async function getBanners(): Promise<PromoBanner[]> {
  try {
    const response = await fetch(storageUrl(true), {
      cache: "no-store",
      headers: storageHeaders(),
    });
    if (response.status === 400 || response.status === 404) return [];
    if (!response.ok) return [];
    return sanitizeBanners(JSON.parse(await response.text()));
  } catch {
    return [];
  }
}

export async function saveBanners(input: unknown) {
  const banners = sanitizeBanners(input);
  const response = await fetch(storageUrl(), {
    method: "POST",
    cache: "no-store",
    headers: {
      ...storageHeaders(),
      "Content-Type": "application/json",
      "cache-control": "0",
      "x-upsert": "true",
    },
    body: JSON.stringify(banners),
  });
  if (!response.ok) {
    return { banners, error: new Error("No se pudieron guardar los banners") };
  }
  return { banners, error: null };
}
