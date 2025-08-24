// API para gestionar grupos de precios
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const active = searchParams.get("active");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    let query = supabase.from("price_groups").select(`
        id,
        name,
        description,
        price_per_kg_usd,
        category,
        is_active,
        created_at,
        updated_at
      `);

    // Aplicar filtros
    if (category) {
      query = query.eq("category", category);
    }

    if (active !== null) {
      query = query.eq("is_active", active === "true");
    }

    // Aplicar paginación
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    // Ordenar por fecha de creación
    query = query.order("created_at", { ascending: false });

    const { data: priceGroups, error, count } = await query;

    if (error) {
      console.error("Error fetching price groups:", error);
      return NextResponse.json(
        { success: false, error: "Error al obtener grupos de precios" },
        { status: 500 }
      );
    }

    // Para cada grupo, contar productos relacionados por separado
    const formattedGroups = [];
    if (priceGroups) {
      for (const group of priceGroups) {
        // Contar productos que tienen price_group_id igual a este grupo
        const { count: productCount } = await supabase
          .from("products")
          .select("*", { count: "exact", head: true })
          .eq("price_group_id", group.id);

        formattedGroups.push({
          ...group,
          product_count: productCount || 0,
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: formattedGroups || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error("Error in price groups API:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, price_per_kg_usd, category } = body;

    // Validaciones
    if (!name || !price_per_kg_usd || !category) {
      return NextResponse.json(
        { success: false, error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    if (price_per_kg_usd <= 0) {
      return NextResponse.json(
        { success: false, error: "El precio por kg debe ser mayor a 0" },
        { status: 400 }
      );
    }

    const validCategories = [
      "construccion",
      "metalurgica",
      "herramientas",
      "herreria",
    ];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { success: false, error: "Categoría inválida" },
        { status: 400 }
      );
    }

    // Verificar que no exista otro grupo con el mismo nombre en la categoría
    const { data: existingGroup } = await supabase
      .from("price_groups")
      .select("id")
      .eq("name", name)
      .eq("category", category)
      .eq("is_active", true)
      .single();

    if (existingGroup) {
      return NextResponse.json(
        {
          success: false,
          error: "Ya existe un grupo con ese nombre en esta categoría",
        },
        { status: 400 }
      );
    }

    // Crear el nuevo grupo
    const { data: newGroup, error } = await supabase
      .from("price_groups")
      .insert({
        name,
        description,
        price_per_kg_usd: parseFloat(price_per_kg_usd),
        category,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating price group:", error);
      return NextResponse.json(
        { success: false, error: "Error al crear el grupo de precios" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          ...newGroup,
          product_count: 0,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in POST price groups:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
