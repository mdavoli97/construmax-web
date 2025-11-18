// API para gestionar precios individuales dentro de un grupo
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: groupId } = await params;
    const body = await request.json();
    const { name, description, price_per_kg, currency } = body;

    // Validaciones
    if (!name?.trim()) {
      return NextResponse.json(
        { success: false, error: "El nombre es requerido" },
        { status: 400 }
      );
    }

    if (!price_per_kg || parseFloat(price_per_kg) <= 0) {
      return NextResponse.json(
        { success: false, error: "El precio debe ser mayor a 0" },
        { status: 400 }
      );
    }

    if (!currency || !["USD", "UYU"].includes(currency)) {
      return NextResponse.json(
        { success: false, error: "Moneda inválida" },
        { status: 400 }
      );
    }

    // Verificar que el grupo existe
    const { data: group, error: groupError } = await supabase
      .from("price_groups")
      .select("id")
      .eq("id", groupId)
      .single();

    if (groupError || !group) {
      return NextResponse.json(
        { success: false, error: "Grupo de precios no encontrado" },
        { status: 404 }
      );
    }

    // Crear el nuevo precio
    const { data: newPrice, error } = await supabase
      .from("price_group_prices")
      .insert({
        price_group_id: groupId,
        name: name.trim(),
        description: description?.trim(),
        price_per_kg: parseFloat(price_per_kg),
        currency,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        // Unique constraint violation
        return NextResponse.json(
          {
            success: false,
            error: "Ya existe un precio con este nombre en el grupo",
          },
          { status: 409 }
        );
      }
      console.error("Error creating price:", error);
      return NextResponse.json(
        { success: false, error: "Error al crear el precio" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: newPrice,
    });
  } catch (error) {
    console.error("Error in POST price:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
