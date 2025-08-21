import { NextRequest, NextResponse } from "next/server";
import { productService } from "@/lib/services";
import { validateProductData } from "@/lib/auth";

// GET - Obtener todos los productos
export async function GET() {
  try {
    const { supabase } = await import("@/lib/supabase");

    // Primero verificar la conexión con las categorías
    const { error: catError } = await supabase.from("categories").select("*");

    if (catError) {
      console.error("Error obteniendo categorías:", catError);
    }

    const products = await productService.getAll();
    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Error al obtener productos" },
      { status: 500 }
    );
  }
}

// POST - Crear nuevo producto
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validar datos
    const validationErrors = validateProductData(body);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: "Datos inválidos", details: validationErrors },
        { status: 400 }
      );
    }

    // Usar cliente con service role para bypassear RLS
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!serviceRoleKey) {
      return NextResponse.json(
        { error: "Service role key no configurado" },
        { status: 500 }
      );
    }

    const { createClient } = await import("@supabase/supabase-js");
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // Primero asegurarse de que las categorías existen (usar upsert con cliente anon)
    const defaultCategories = [
      {
        name: "Construcción",
        description: "Materiales para construcción y obra",
        icon: "🏗️",
        slug: "construccion",
      },
      {
        name: "Metalúrgica",
        description: "Productos de acero y metal",
        icon: "⚙️",
        slug: "metalurgica",
      },
      {
        name: "Herramientas",
        description: "Herramientas manuales y eléctricas",
        icon: "🔧",
        slug: "herramientas",
      },
      {
        name: "Herrería",
        description: "Materiales de herrería",
        icon: "⚡",
        slug: "herreria",
      },
    ];

    console.log("Intentando asegurar que las categorías existen...");

    // Verificar si la categoría específica existe
    const { data: categoryExists } = await adminClient
      .from("categories")
      .select("slug")
      .eq("slug", body.category)
      .single();

    if (!categoryExists) {
      // Intentar insertar solo la categoría necesaria
      const categoryToInsert = defaultCategories.find(
        (cat) => cat.slug === body.category
      );
      if (categoryToInsert) {
        const { error: catError } = await adminClient
          .from("categories")
          .insert(categoryToInsert);

        if (catError) {
          console.log(
            "Error insertando categoría (puede ya existir):",
            catError
          );
        }
      }
    }

    const productData = {
      name: body.name,
      description: body.description,
      price: body.price,
      category: body.category,
      image: body.image,
      stock: body.stock,
      unit: body.unit,
      brand: body.brand,
      sku: body.sku,
      featured: body.featured,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    console.log("Datos del producto a insertar (sanitizados):", productData);
    console.log("Body original recibido:", JSON.stringify(body, null, 2));

    // Insertar producto usando cliente admin
    const { data, error } = await adminClient
      .from("products")
      .insert(productData)
      .select()
      .single();

    if (error) {
      console.error("Error de Supabase al insertar producto:", error);

      // Si es un error de RLS, devolver un mensaje más claro
      if (error.code === "42501") {
        return NextResponse.json(
          {
            error: "Error de permisos en la base de datos",
            details:
              "Las políticas de seguridad están bloqueando la inserción. Necesita configurar Supabase correctamente.",
            suggestion:
              "Contacte al administrador para configurar las políticas de RLS o deshabilitar RLS temporalmente.",
          },
          { status: 403 }
        );
      }

      throw error;
    }

    console.log("Producto creado exitosamente:", data);
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      {
        error: "Error al crear producto",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}
