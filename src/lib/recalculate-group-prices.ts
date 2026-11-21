// El cliente de Supabase tiene genéricos recursivos; acá solo usamos select/update.
type SupabaseLike = {
  from: (table: string) => any;
};

type PriceProduct = {
  id: string;
  product_type?: string | null;
  weight_per_unit?: number | null;
  kg_per_meter?: number | null;
  price_per_kg?: number | null;
};

function nextUnitPrice(product: PriceProduct, pricePerKg: number) {
  if (product.product_type === "perfiles" && product.weight_per_unit) {
    return Number(product.weight_per_unit) * pricePerKg;
  }
  if (product.product_type === "chapas_conformadas" && product.kg_per_meter) {
    return Number(product.kg_per_meter) * pricePerKg;
  }
  return null;
}

/**
 * Recalcula products.price de los perfiles y chapas del grupo cuyo $/kg
 * coincide con la tarifa anterior. Si previousRate es null, actualiza todos.
 */
export async function recalculateGroupProducts(
  supabase: SupabaseLike,
  groupId: string,
  previousRate: number | null,
  nextRate: number
) {
  const { data, error } = await supabase
    .from("products")
    .select("id, product_type, weight_per_unit, kg_per_meter, price_per_kg")
    .eq("price_group_id", groupId);

  const products = (data || []) as PriceProduct[];
  if (error || products.length === 0) return 0;

  let updated = 0;
  for (const product of products) {
    const currentRate =
      product.price_per_kg == null ? null : Number(product.price_per_kg);
    const matches =
      previousRate == null ||
      currentRate == null ||
      Math.abs(currentRate - previousRate) < 0.001;
    if (!matches) continue;

    const price = nextUnitPrice(product, nextRate);
    if (price == null || !Number.isFinite(price) || price <= 0) continue;

    const { error: updateError } = await supabase
      .from("products")
      .update({
        price: Math.round(price * 100) / 100,
        price_per_kg: nextRate,
        updated_at: new Date().toISOString(),
      })
      .eq("id", product.id);

    if (!updateError) updated += 1;
  }

  return updated;
}
