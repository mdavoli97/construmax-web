
export type SiteSettings = {
  phoneDisplay: string;
  whatsapp: string;
  email: string;
  address: string;
  hoursWeekday: string;
  hoursSaturday: string;
  shippingBaseUyu: number;
  freeShippingFromUyu: number;
  documentFromUyu: number;
  ivaRate: number;
  salesOpen: boolean;
};

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  phoneDisplay: "+598 97 971 111",
  whatsapp: "59897971111",
  email: "curlamsas@gmail.com.uy",
  address: "José Mármol 615, Montevideo, Uruguay",
  hoursWeekday: "Lunes a viernes: 8:00 a 12:00 / 13:30 a 18:30",
  hoursSaturday: "Sábados: 8:00 a 13:00",
  shippingBaseUyu: 700,
  freeShippingFromUyu: 50000,
  documentFromUyu: 30000,
  ivaRate: 0.22,
  salesOpen: true,
};

export const SALES_CLOSED_MESSAGE =
  "El sitio está en mantenimiento y por ahora no tomamos pedidos por la web. Escribinos por WhatsApp y te ayudamos.";

const SETTINGS_BUCKET = "site-settings";
const SETTINGS_FILE = "default.json";

function asNumber(value: unknown, fallback: number) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function mergeSettings(partial: unknown): SiteSettings {
  const source =
    partial && typeof partial === "object"
      ? (partial as Partial<SiteSettings>)
      : {};
  return {
    phoneDisplay:
      typeof source.phoneDisplay === "string" && source.phoneDisplay.trim()
        ? source.phoneDisplay.trim()
        : DEFAULT_SITE_SETTINGS.phoneDisplay,
    whatsapp:
      typeof source.whatsapp === "string" && source.whatsapp.trim()
        ? source.whatsapp.replace(/\D/g, "")
        : DEFAULT_SITE_SETTINGS.whatsapp,
    email:
      typeof source.email === "string" && source.email.trim()
        ? source.email.trim()
        : DEFAULT_SITE_SETTINGS.email,
    address:
      typeof source.address === "string" && source.address.trim()
        ? source.address.trim()
        : DEFAULT_SITE_SETTINGS.address,
    hoursWeekday:
      typeof source.hoursWeekday === "string" && source.hoursWeekday.trim()
        ? source.hoursWeekday.trim()
        : DEFAULT_SITE_SETTINGS.hoursWeekday,
    hoursSaturday:
      typeof source.hoursSaturday === "string" && source.hoursSaturday.trim()
        ? source.hoursSaturday.trim()
        : DEFAULT_SITE_SETTINGS.hoursSaturday,
    shippingBaseUyu: Math.max(
      0,
      asNumber(source.shippingBaseUyu, DEFAULT_SITE_SETTINGS.shippingBaseUyu)
    ),
    freeShippingFromUyu: Math.max(
      0,
      asNumber(
        source.freeShippingFromUyu,
        DEFAULT_SITE_SETTINGS.freeShippingFromUyu
      )
    ),
    documentFromUyu: Math.max(
      0,
      asNumber(source.documentFromUyu, DEFAULT_SITE_SETTINGS.documentFromUyu)
    ),
    ivaRate: Math.min(
      1,
      Math.max(0, asNumber(source.ivaRate, DEFAULT_SITE_SETTINGS.ivaRate))
    ),
    salesOpen:
      typeof source.salesOpen === "boolean"
        ? source.salesOpen
        : DEFAULT_SITE_SETTINGS.salesOpen,
  };
}

function storageHeaders() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  return {
    Authorization: `Bearer ${key}`,
    apikey: key,
  };
}

function storageUrl(cacheBust = false) {
  const base = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/${SETTINGS_BUCKET}/${SETTINGS_FILE}`;
  return cacheBust ? `${base}?t=${Date.now()}` : base;
}

async function readStoredSettings(): Promise<SiteSettings | null> {
  try {
    const response = await fetch(storageUrl(true), {
      cache: "no-store",
      headers: storageHeaders(),
    });
    if (response.status === 400 || response.status === 404) {
      return DEFAULT_SITE_SETTINGS;
    }
    if (!response.ok) return null;
    return mergeSettings(JSON.parse(await response.text()));
  } catch {
    return null;
  }
}

export async function getSiteSettings(): Promise<SiteSettings> {
  return (await readStoredSettings()) ?? DEFAULT_SITE_SETTINGS;
}

export async function saveSiteSettings(input: unknown) {
  const current = await readStoredSettings();
  if (!current) {
    return {
      settings: DEFAULT_SITE_SETTINGS,
      error: new Error("No se pudieron leer los ajustes actuales"),
    };
  }
  const incoming =
    input && typeof input === "object" ? (input as Partial<SiteSettings>) : {};
  const settings = mergeSettings({ ...current, ...incoming });
  const response = await fetch(storageUrl(), {
    method: "POST",
    cache: "no-store",
    headers: {
      ...storageHeaders(),
      "Content-Type": "application/json",
      "cache-control": "0",
      "x-upsert": "true",
    },
    body: JSON.stringify(settings),
  });
  if (!response.ok) {
    return {
      settings,
      error: new Error("No se pudieron guardar los ajustes"),
    };
  }
  return { settings, error: null };
}
