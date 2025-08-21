import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    // Probar conexión con categorías
    const { data: categories, error: catError } = await supabase
      .from("categories")
      .select("*");

    if (catError) {
      return NextResponse.json(
        {
          error: "Error obteniendo categorías",
          details: catError,
        },
        { status: 500 }
      );
    }

    // Probar conexión con productos
    const { data: products, error: prodError } = await supabase
      .from("products")
      .select("*")
      .limit(5);

    if (prodError) {
      return NextResponse.json(
        {
          error: "Error obteniendo productos",
          details: prodError,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Conexión exitosa a Supabase",
      categories,
      products,
      categoriesCount: categories?.length || 0,
      productsCount: products?.length || 0,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Error de conexión",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}
