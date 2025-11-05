// API pública para obtener grupos de precios (para formularios de productos)
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    let query = supabase
      .from("price_groups")
      .select(
        "id, name, price_per_kg, currency, category, description, thickness, size"
      )
      .eq("is_active", true);

    // Aplicar filtro de categoría si se especifica
    if (category) {
      query = query.eq("category", category);
    }

    // Ordenar por nombre
    query = query.order("name", { ascending: true });

    const { data: priceGroups, error } = await query;

    if (error) {
      console.error("Error fetching public price groups:", error);
      return NextResponse.json(
        { success: false, error: "Error al obtener grupos de precios" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: priceGroups || [],
    });
  } catch (error) {
    console.error("Error in public price groups API:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
