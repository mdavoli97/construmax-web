// API para gestionar categorías de productos
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const { data: categories, error } = await supabase
      .from("categories")
      .select("id, name, description, icon, slug, created_at")
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description } = body;

    // Validaciones
    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: "El nombre es requerido" },
        { status: 400 }
      );
    }

    // Verificar que no exista otra categoría con el mismo nombre
    const { data: existingCategory } = await supabase
      .from("categories")
      .select("id")
      .eq("name", name.trim())
      .single();

    if (existingCategory) {
      return NextResponse.json(
        {
          success: false,
          error: "Ya existe una categoría con ese nombre",
        },
        { status: 400 }
      );
    }

    // Crear la nueva categoría
    const slugValue = name
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/ñ/g, "n")
      .replace(/[^\w-]/g, "");
    const { data: newCategory, error } = await supabase
      .from("categories")
      .insert({
        name: name.trim(),
        description: description?.trim() || null,
        icon: "📦", // Icono por defecto
        slug: slugValue,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating category:", error);
      return NextResponse.json(
        { success: false, error: "Error al crear la categoría" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: newCategory,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in POST categories:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
