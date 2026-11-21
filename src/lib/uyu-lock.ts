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
  if (!Array.isArray(value)) return [];
  return [
    ...new Set(
      value.filter((id): id is string => typeof id === "string" && id.length > 0)
    ),
  ];
}

async function readFile(): Promise<{ groupIds?: unknown; ids?: unknown } | null> {
  try {
    const supabase = adminClient();
    const { data, error } = await supabase.storage
      .from(SETTINGS_BUCKET)
      .download(LOCK_FILE);
    if (error || !data) return null;
    return JSON.parse(await data.text());
  } catch {
    return null;
  }
}

async function saveGroupIds(groupIds: string[]) {
  const supabase = adminClient();
  const { error } = await supabase.storage
    .from(SETTINGS_BUCKET)
    .upload(LOCK_FILE, JSON.stringify({ groupIds }), {
      upsert: true,
      contentType: "application/json",
    });
  if (error) throw error;
}

async function groupsForProducts(productIds: string[]) {
  const supabase = adminClient();
  const { data, error } = await supabase
    .from("products")
    .select("price_group_id")
    .in("id", productIds);
  if (error) throw error;
  return asIds((data || []).map((row) => row.price_group_id));
}

export async function getUyuLockedGroupIds(): Promise<string[]> {
  const raw = await readFile();
  if (!raw) return [];
  if (Array.isArray(raw.groupIds)) return asIds(raw.groupIds);

  const legacyProductIds = asIds(raw.ids);
  if (legacyProductIds.length === 0) return [];
  const groupIds = await groupsForProducts(legacyProductIds);
  await saveGroupIds(groupIds);
  return groupIds;
}

export async function setGroupUyuLock(groupId: string, locked: boolean) {
  const ids = new Set(await getUyuLockedGroupIds());
  if (locked) ids.add(groupId);
  else ids.delete(groupId);
  await saveGroupIds([...ids]);
}
