// API pública para obtener categorías (sin autenticación)
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const { data: categories, error } = await supabase
      .from("categories")
      .select("id, name, description, slug, icon, created_at")
      .order("name");

    if (error) {
      console.error("Error fetching categories:", error);
      return NextResponse.json(
        { success: false, error: "Error al obtener categorías" },
        { status: 500 }
      );
    }

    // Agregar is_active y updated_at para compatibilidad con el frontend
    const categoriesWithActive = (categories || []).map((cat) => ({
      ...cat,
      is_active: true,
      updated_at: cat.created_at, // Usar created_at como updated_at por ahora
    }));

    return NextResponse.json({
      success: true,
      data: categoriesWithActive,
    });
  } catch (error) {
    console.error("Error in categories API:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
