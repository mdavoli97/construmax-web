import { createClient } from "@supabase/supabase-js";

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
};

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
  };
}

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const supabase = adminClient();
    const { data, error } = await supabase.storage
      .from(SETTINGS_BUCKET)
      .download(SETTINGS_FILE);
    if (error || !data) return DEFAULT_SITE_SETTINGS;
    return mergeSettings(JSON.parse(await data.text()));
  } catch {
    return DEFAULT_SITE_SETTINGS;
  }
}

export async function saveSiteSettings(input: unknown) {
  const settings = mergeSettings(input);
  const supabase = adminClient();
  const { error } = await supabase.storage
    .from(SETTINGS_BUCKET)
    .upload(SETTINGS_FILE, JSON.stringify(settings), {
      upsert: true,
      contentType: "application/json",
    });
  if (error) {
    return { settings, error };
  }
  return { settings, error: null };
}
