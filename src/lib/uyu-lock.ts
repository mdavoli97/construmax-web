import { createClient } from "@supabase/supabase-js";

const SETTINGS_BUCKET = "site-settings";
const LOCK_FILE = "uyu-only.json";

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function asIds(value: unknown): string[] {
  if (!value || typeof value !== "object") return [];
  const ids = (value as { ids?: unknown }).ids;
  if (!Array.isArray(ids)) return [];
  return [...new Set(ids.filter((id): id is string => typeof id === "string" && id.length > 0))];
}

export async function getUyuLockedIds(): Promise<string[]> {
  try {
    const supabase = adminClient();
    const { data, error } = await supabase.storage
      .from(SETTINGS_BUCKET)
      .download(LOCK_FILE);
    if (error || !data) return [];
    return asIds(JSON.parse(await data.text()));
  } catch {
    return [];
  }
}

async function saveIds(ids: string[]) {
  const supabase = adminClient();
  const { error } = await supabase.storage
    .from(SETTINGS_BUCKET)
    .upload(LOCK_FILE, JSON.stringify({ ids }), {
      upsert: true,
      contentType: "application/json",
    });
  if (error) throw error;
}

export async function setUyuLock(productId: string, locked: boolean) {
  const ids = new Set(await getUyuLockedIds());
  if (locked) ids.add(productId);
  else ids.delete(productId);
  await saveIds([...ids]);
}
