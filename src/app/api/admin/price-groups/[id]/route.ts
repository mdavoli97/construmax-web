// API para gestionar un grupo de precios específico
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { adminUnauthorized, requireAdmin } from "@/lib/admin-session";
import { recalculateGroupProducts } from "@/lib/recalculate-group-prices";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!requireAdmin(request)) return adminUnauthorized();
  try {
    const { id } = await params;

    const { data: priceGroup, error } = await supabase
      .from("price_groups")
      .select(
        `
        id,
        name,
        description,
        category,
        is_active,
        thickness,
        size,
        presentation,
        length,
        created_at,
        updated_at,
        products:products(
          id,
          name,
          price,
          weight_per_unit,
          is_available
        ),
        price_group_prices:price_group_prices(
          id,
          name,
          description,
          price_per_kg,
          currency,
          is_active,
          created_at,
          updated_at
        )
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { success: false, error: "Grupo de precios no encontrado" },
          { status: 404 }
        );
      }
      console.error("Error fetching price group:", error);
      return NextResponse.json(
        { success: false, error: "Error al obtener el grupo de precios" },
        { status: 500 }
      );
    }

    // Calcular estadísticas de productos
    const products = priceGroup.products || [];
    const productPrices = products.map((p) => parseFloat(p.price));

    // Calcular estadísticas de precios del grupo
    const groupPrices = priceGroup.price_group_prices || [];
    const activePrices = groupPrices.filter((p) => p.is_active);
    const priceValues = activePrices.map((p) => parseFloat(p.price_per_kg));

    const statistics = {
      product_count: products.length,
      avg_product_price:
        productPrices.length > 0
          ? productPrices.reduce((a, b) => a + b, 0) / productPrices.length
          : 0,
      min_product_price:
        productPrices.length > 0 ? Math.min(...productPrices) : 0,
      max_product_price:
        productPrices.length > 0 ? Math.max(...productPrices) : 0,

      // Estadísticas de precios del grupo
      price_count: groupPrices.length,
      active_price_count: activePrices.length,
      avg_group_price:
        priceValues.length > 0
          ? priceValues.reduce((a, b) => a + b, 0) / priceValues.length
          : 0,
      min_group_price: priceValues.length > 0 ? Math.min(...priceValues) : 0,
      max_group_price: priceValues.length > 0 ? Math.max(...priceValues) : 0,
      main_price: priceValues.length > 0 ? Math.min(...priceValues) : 0,
    };

    const { getUyuLockedGroupIds } = await import("@/lib/uyu-lock");
    const lockedGroups = new Set(await getUyuLockedGroupIds());

    return NextResponse.json({
      success: true,
      data: {
        ...priceGroup,
        ...statistics,
        lock_to_uyu: lockedGroups.has(id),
      },
    });
  } catch (error) {
    console.error("Error in GET price group:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!requireAdmin(request)) return adminUnauthorized();
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      name,
      description,
      category,
      is_active,
      thickness,
      size,
      presentation,
      length,
      price_per_kg,
      currency,
      lock_to_uyu,
    } = body;

    // Verificar que el grupo existe
    const { data: existingGroup, error: fetchError } = await supabase
      .from("price_groups")
      .select("id, name, price_per_kg, currency")
      .eq("id", id)
      .single();

    if (fetchError || !existingGroup) {
      return NextResponse.json(
        { success: false, error: "Grupo de precios no encontrado" },
        { status: 404 }
      );
    }

    // Verificar nombre único si se está cambiando
    if (name && name !== existingGroup.name) {
      const { data: duplicateGroup } = await supabase
        .from("price_groups")
        .select("id")
        .eq("name", name)
        .eq("category", category || "metalurgica")
        .eq("is_active", true)
        .neq("id", id)
        .single();

      if (duplicateGroup) {
        return NextResponse.json(
          {
            success: false,
            error: "Ya existe un grupo con ese nombre en esta categoría",
          },
          { status: 400 }
        );
      }
    }

    // Actualizar el grupo
    const updateData: {
      updated_at: string;
      name?: string;
      description?: string;
      category?: string;
      is_active?: boolean;
      thickness?: boolean;
      size?: boolean;
      presentation?: boolean;
      length?: boolean;
    } = { updated_at: new Date().toISOString() };
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (is_active !== undefined) updateData.is_active = is_active;
    if (thickness !== undefined) updateData.thickness = thickness;
    if (size !== undefined) updateData.size = size;
    if (presentation !== undefined) updateData.presentation = presentation;
    if (length !== undefined) updateData.length = length;

    if (typeof lock_to_uyu === "boolean") {
      const { setGroupUyuLock } = await import("@/lib/uyu-lock");
      await setGroupUyuLock(id, lock_to_uyu);
    }

    const { data: updatedGroup, error: updateError } = await supabase
      .from("price_groups")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating price group:", updateError);
      return NextResponse.json(
        { success: false, error: "Error al actualizar el grupo de precios" },
        { status: 500 }
      );
    }

    let productsUpdated = 0;
    const nextRate =
      price_per_kg !== undefined && price_per_kg !== null
        ? Number(price_per_kg)
        : null;
    if (nextRate !== null && Number.isFinite(nextRate) && nextRate > 0) {
      const { data: activePrices } = await supabase
        .from("price_group_prices")
        .select("id, price_per_kg")
        .eq("price_group_id", id)
        .eq("is_active", true);

      const prices = activePrices || [];
      const previousGroupRate =
        existingGroup.price_per_kg != null
          ? Number(existingGroup.price_per_kg)
          : null;
      const target =
        prices.length === 1
          ? prices[0]
          : prices.find(
              (price) =>
                previousGroupRate != null &&
                Math.abs(Number(price.price_per_kg) - previousGroupRate) < 0.001
            ) || prices[0];
      const previousRate = target
        ? Number(target.price_per_kg)
        : previousGroupRate;

      if (target) {
        await supabase
          .from("price_group_prices")
          .update({
            price_per_kg: nextRate,
            ...(currency ? { currency } : {}),
          })
          .eq("id", target.id);
      }

      await supabase
        .from("price_groups")
        .update({
          price_per_kg: nextRate,
          ...(currency ? { currency } : {}),
        })
        .eq("id", id);

      productsUpdated = await recalculateGroupProducts(
        supabase,
        id,
        previousRate,
        nextRate
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ...updatedGroup,
        products_updated: productsUpdated,
        ...(typeof lock_to_uyu === "boolean" ? { lock_to_uyu } : {}),
      },
      message: "Grupo actualizado exitosamente",
    });
  } catch (error) {
    console.error("Error in PUT price group:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!requireAdmin(request)) return adminUnauthorized();
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const force = searchParams.get("force") === "true";

    // Verificar que el grupo existe
    const { data: existingGroup, error: fetchError } = await supabase
      .from("price_groups")
      .select("id, name")
      .eq("id", id)
      .single();

    if (fetchError || !existingGroup) {
      return NextResponse.json(
        { success: false, error: "Grupo de precios no encontrado" },
        { status: 404 }
      );
    }

    // Contar productos asociados
    const { count: productCount } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("price_group_id", id);

    // Si tiene productos y no se fuerza la eliminación, devolver error
    if (productCount && productCount > 0 && !force) {
      return NextResponse.json(
        {
          success: false,
          error: `No se puede eliminar el grupo porque tiene ${productCount} productos asociados`,
          data: {
            product_count: productCount,
            suggestion: "Desvincule los productos primero o use force=true",
          },
        },
        { status: 400 }
      );
    }

    // Si se fuerza la eliminación, desvincular productos primero
    if (force && productCount && productCount > 0) {
      // Desvincular productos del grupo de precios
      const { error: updateError } = await supabase
        .from("products")
        .update({
          price_group_id: null,
          updated_at: new Date().toISOString(),
        })
        .eq("price_group_id", id);

      if (updateError) {
        console.error("Error unlinking products:", updateError);
        return NextResponse.json(
          { success: false, error: "Error al desvincular productos del grupo" },
          { status: 500 }
        );
      }
    }

    // Eliminar el grupo de la base de datos
    const { error: deleteError } = await supabase
      .from("price_groups")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Error deleting price group:", deleteError);
      return NextResponse.json(
        { success: false, error: "Error al eliminar el grupo de precios" },
        { status: 500 }
      );
    }

    const { setGroupUyuLock } = await import("@/lib/uyu-lock");
    await setGroupUyuLock(id, false);

    return NextResponse.json({
      success: true,
      message:
        force && productCount && productCount > 0
          ? `Grupo "${existingGroup.name}" eliminado exitosamente y ${productCount} productos desvinculados`
          : "Grupo eliminado exitosamente",
    });
  } catch (error) {
    console.error("Error in DELETE price group:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
