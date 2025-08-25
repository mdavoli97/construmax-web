import { NextRequest, NextResponse } from "next/server";
import { productService } from "@/lib/services";
import { validateProductData } from "@/lib/auth";
import { revalidatePath } from "next/cache";

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

    // Extraer datos del description si viene como JSON
    let extraData: {
      product_type?: string;
      weight_per_unit?: number;
      kg_per_meter?: number;
      price_per_kg?: number;
      stock_type?: string;
      is_available?: boolean;
    } = {};
    let cleanDescription = body.description;

    try {
      if (body.description && body.description.startsWith("{")) {
        const descObj = JSON.parse(body.description);
        if (descObj.meta) {
          extraData = descObj.meta;
          cleanDescription = descObj.description || "";
        }
      }
    } catch (e) {
      // Si no es JSON válido, usar la descripción tal como viene
      console.log("Description is not JSON, using as-is");
    }

    // Normalizar stock basándose en el tipo de producto
    let finalStock = body.stock;
    if (
      (extraData.product_type === "perfiles" ||
        extraData.product_type === "chapas_conformadas") &&
      extraData.stock_type === "availability"
    ) {
      // Para perfiles y chapas conformadas con stock por disponibilidad, usar 1 = disponible, 0 = no disponible
      finalStock = extraData.is_available ? 1 : 0;
    }

    const productData = {
      name: body.name,
      description: cleanDescription,
      price: body.price,
      category: body.category,
      image: body.image,
      stock: finalStock,
      unit: body.unit,
      brand: body.brand,
      sku: body.sku,
      featured: body.featured,
      price_group_id: body.price_group_id || null,
      // Campos específicos para perfiles y chapas conformadas (ahora las columnas ya existen)
      product_type: extraData.product_type || "standard",
      weight_per_unit: extraData.weight_per_unit || null,
      kg_per_meter: extraData.kg_per_meter || null,
      price_per_kg: extraData.price_per_kg || null,
      stock_type: extraData.stock_type || "quantity",
      is_available:
        extraData.is_available !== undefined ? extraData.is_available : true,
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

    // Revalidate the product pages after creation
    revalidatePath("/productos");
    revalidatePath("/");
    if (data.category) {
      revalidatePath(`/productos/${data.category}`);
    }

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
