// API para gestionar un precio específico dentro de un grupo
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; priceId: string }> }
) {
  try {
    const { id: groupId, priceId } = await params;

    // Verificar que el precio existe y pertenece al grupo
    const { data: existingPrice, error: fetchError } = await supabase
      .from("price_group_prices")
      .select("id, price_group_id, name")
      .eq("id", priceId)
      .eq("price_group_id", groupId)
      .single();

    if (fetchError || !existingPrice) {
      return NextResponse.json(
        { success: false, error: "Precio no encontrado" },
        { status: 404 }
      );
    }

    // Verificar que no es el único precio activo del grupo
    const { data: activePrices, error: countError } = await supabase
      .from("price_group_prices")
      .select("id")
      .eq("price_group_id", groupId)
      .eq("is_active", true);

    if (countError) {
      console.error("Error checking active prices:", countError);
      return NextResponse.json(
        { success: false, error: "Error al verificar precios activos" },
        { status: 500 }
      );
    }

    if (activePrices && activePrices.length <= 1) {
      return NextResponse.json(
        {
          success: false,
          error:
            "No se puede eliminar el único precio activo del grupo. Debe haber al menos un precio activo.",
        },
        { status: 400 }
      );
    }

    // Eliminar el precio
    const { error: deleteError } = await supabase
      .from("price_group_prices")
      .delete()
      .eq("id", priceId)
      .eq("price_group_id", groupId);

    if (deleteError) {
      console.error("Error deleting price:", deleteError);
      return NextResponse.json(
        { success: false, error: "Error al eliminar el precio" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Precio eliminado exitosamente",
    });
  } catch (error) {
    console.error("Error in DELETE price:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; priceId: string }> }
) {
  try {
    const { id: groupId, priceId } = await params;
    const body = await request.json();
    const { name, description, price_per_kg, currency, is_active } = body;

    // Validaciones
    if (name !== undefined && !name?.trim()) {
      return NextResponse.json(
        { success: false, error: "El nombre no puede estar vacío" },
        { status: 400 }
      );
    }

    if (
      price_per_kg !== undefined &&
      (!price_per_kg || parseFloat(price_per_kg) <= 0)
    ) {
      return NextResponse.json(
        { success: false, error: "El precio debe ser mayor a 0" },
        { status: 400 }
      );
    }

    if (currency !== undefined && !["USD", "UYU"].includes(currency)) {
      return NextResponse.json(
        { success: false, error: "Moneda inválida" },
        { status: 400 }
      );
    }

    // Verificar que el precio existe y pertenece al grupo
    const { data: existingPrice, error: fetchError } = await supabase
      .from("price_group_prices")
      .select("id, price_group_id, is_active")
      .eq("id", priceId)
      .eq("price_group_id", groupId)
      .single();

    if (fetchError || !existingPrice) {
      return NextResponse.json(
        { success: false, error: "Precio no encontrado" },
        { status: 404 }
      );
    }

    // Si se intenta desactivar, verificar que no es el único precio activo
    if (is_active === false && existingPrice.is_active) {
      const { data: activePrices, error: countError } = await supabase
        .from("price_group_prices")
        .select("id")
        .eq("price_group_id", groupId)
        .eq("is_active", true);

      if (countError) {
        console.error("Error checking active prices:", countError);
        return NextResponse.json(
          { success: false, error: "Error al verificar precios activos" },
          { status: 500 }
        );
      }

      if (activePrices && activePrices.length <= 1) {
        return NextResponse.json(
          {
            success: false,
            error:
              "No se puede desactivar el único precio activo del grupo. Debe haber al menos un precio activo.",
          },
          { status: 400 }
        );
      }
    }

    // Preparar datos para actualizar
    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description?.trim();
    if (price_per_kg !== undefined)
      updateData.price_per_kg = parseFloat(price_per_kg);
    if (currency !== undefined) updateData.currency = currency;
    if (is_active !== undefined) updateData.is_active = is_active;

    // Actualizar el precio
    const { data: updatedPrice, error: updateError } = await supabase
      .from("price_group_prices")
      .update(updateData)
      .eq("id", priceId)
      .eq("price_group_id", groupId)
      .select()
      .single();

    if (updateError) {
      if (updateError.code === "23505") {
        return NextResponse.json(
          {
            success: false,
            error: "Ya existe un precio con este nombre en el grupo",
          },
          { status: 409 }
        );
      }
      console.error("Error updating price:", updateError);
      return NextResponse.json(
        { success: false, error: "Error al actualizar el precio" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedPrice,
    });
  } catch (error) {
    console.error("Error in PUT price:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
