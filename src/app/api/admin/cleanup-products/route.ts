import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!serviceRoleKey) {
      return NextResponse.json(
        {
          error: "Service role key no configurado",
        },
        { status: 500 }
      );
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // Buscar productos con keys de Supabase en la descripción
    const { data: productsWithKeys, error: searchError } = await adminClient
      .from("products")
      .select("*")
      .ilike("description", "%eyJ%"); // Busca tokens JWT que empiezan con eyJ

    if (searchError) {
      return NextResponse.json({ error: searchError.message }, { status: 500 });
    }

    if (productsWithKeys && productsWithKeys.length > 0) {
      console.log("Productos con keys encontrados:", productsWithKeys);

      // Eliminar estos productos
      const { error: deleteError } = await adminClient
        .from("products")
        .delete()
        .ilike("description", "%eyJ%");

      if (deleteError) {
        return NextResponse.json(
          { error: deleteError.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        message: `${productsWithKeys.length} productos con keys eliminados`,
        deletedProducts: productsWithKeys,
      });
    }

    return NextResponse.json({
      message: "No se encontraron productos con keys en la descripción",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Error limpiando productos",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!serviceRoleKey) {
      return NextResponse.json(
        {
          error: "Service role key no configurado",
        },
        { status: 500 }
      );
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // Solo ver productos con problemas
    const { data: productsWithKeys, error } = await adminClient
      .from("products")
      .select("id, name, description")
      .ilike("description", "%eyJ%");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      message: "Productos con keys encontrados",
      count: productsWithKeys?.length || 0,
      products: productsWithKeys,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Error buscando productos",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}
