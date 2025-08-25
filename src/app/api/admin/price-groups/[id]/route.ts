// API para gestionar un grupo de precios específico
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data: priceGroup, error } = await supabase
      .from("price_groups")
      .select(
        `
        id,
        name,
        description,
        price_per_kg_usd,
        category,
        is_active,
        created_at,
        updated_at,
        products:products(
          id,
          name,
          price,
          weight_per_unit,
          is_available
        )
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { success: false, error: "Grupo de precios no encontrado" },
          { status: 404 }
        );
      }
      console.error("Error fetching price group:", error);
      return NextResponse.json(
        { success: false, error: "Error al obtener el grupo de precios" },
        { status: 500 }
      );
    }

    // Calcular estadísticas de productos
    const products = priceGroup.products || [];
    const productPrices = products.map((p) => parseFloat(p.price));

    const statistics = {
      product_count: products.length,
      avg_product_price:
        productPrices.length > 0
          ? productPrices.reduce((a, b) => a + b, 0) / productPrices.length
          : 0,
      min_product_price:
        productPrices.length > 0 ? Math.min(...productPrices) : 0,
      max_product_price:
        productPrices.length > 0 ? Math.max(...productPrices) : 0,
    };

    return NextResponse.json({
      success: true,
      data: {
        ...priceGroup,
        ...statistics,
      },
    });
  } catch (error) {
    console.error("Error in GET price group:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, price_per_kg_usd, category, is_active } = body;

    // Validaciones
    if (price_per_kg_usd !== undefined && price_per_kg_usd <= 0) {
      return NextResponse.json(
        { success: false, error: "El precio por kg debe ser mayor a 0" },
        { status: 400 }
      );
    }

    if (category) {
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
    }

    // Verificar que el grupo existe
    const { data: existingGroup, error: fetchError } = await supabase
      .from("price_groups")
      .select("id, name, price_per_kg_usd")
      .eq("id", id)
      .single();

    if (fetchError || !existingGroup) {
      return NextResponse.json(
        { success: false, error: "Grupo de precios no encontrado" },
        { status: 404 }
      );
    }

    // Verificar nombre único si se está cambiando
    if (name && name !== existingGroup.name) {
      const { data: duplicateGroup } = await supabase
        .from("price_groups")
        .select("id")
        .eq("name", name)
        .eq("category", category || "metalurgica")
        .eq("is_active", true)
        .neq("id", id)
        .single();

      if (duplicateGroup) {
        return NextResponse.json(
          {
            success: false,
            error: "Ya existe un grupo con ese nombre en esta categoría",
          },
          { status: 400 }
        );
      }
    }

    // Actualizar el grupo
    const updateData: {
      updated_at: string;
      name?: string;
      description?: string;
      price_per_kg_usd?: number;
      category?: string;
      is_active?: boolean;
    } = { updated_at: new Date().toISOString() };
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price_per_kg_usd !== undefined)
      updateData.price_per_kg_usd = parseFloat(price_per_kg_usd);
    if (category !== undefined) updateData.category = category;
    if (is_active !== undefined) updateData.is_active = is_active;

    const { data: updatedGroup, error: updateError } = await supabase
      .from("price_groups")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating price group:", updateError);
      return NextResponse.json(
        { success: false, error: "Error al actualizar el grupo de precios" },
        { status: 500 }
      );
    }

    // Si se cambió el precio por kg, actualizar productos relacionados
    let productsUpdated = 0;
    if (
      price_per_kg_usd !== undefined &&
      price_per_kg_usd !== existingGroup.price_per_kg_usd
    ) {
      try {
        // Buscar productos que están asociados a este grupo de precios
        const { data: products } = await supabase
          .from("products")
          .select("id, weight_per_unit, product_type")
          .eq("price_group_id", id)
          .eq("product_type", "perfiles")
          .not("weight_per_unit", "is", null);

        if (products && products.length > 0) {
          // Actualizar precios de productos
          const updatePromises = products.map((product) => {
            const newPrice =
              parseFloat(product.weight_per_unit) *
              parseFloat(price_per_kg_usd);
            return supabase
              .from("products")
              .update({
                price: newPrice.toFixed(2),
                price_per_kg: parseFloat(price_per_kg_usd),
                updated_at: new Date().toISOString(),
              })
              .eq("id", product.id);
          });

          await Promise.all(updatePromises);
          productsUpdated = products.length;
        }
      } catch (productUpdateError) {
        console.error("Error updating related products:", productUpdateError);
        // No fallar la actualización del grupo por esto
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        ...updatedGroup,
        products_updated: productsUpdated,
      },
      message:
        productsUpdated > 0
          ? `Grupo actualizado y ${productsUpdated} productos actualizados automáticamente`
          : "Grupo actualizado exitosamente",
    });
  } catch (error) {
    console.error("Error in PUT price group:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const force = searchParams.get("force") === "true";

    // Verificar que el grupo existe
    const { data: existingGroup, error: fetchError } = await supabase
      .from("price_groups")
      .select("id, name")
      .eq("id", id)
      .single();

    if (fetchError || !existingGroup) {
      return NextResponse.json(
        { success: false, error: "Grupo de precios no encontrado" },
        { status: 404 }
      );
    }

    // Contar productos asociados
    const { count: productCount } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("price_group_id", id);

    // Si tiene productos y no se fuerza la eliminación, devolver error
    if (productCount && productCount > 0 && !force) {
      return NextResponse.json(
        {
          success: false,
          error: `No se puede eliminar el grupo porque tiene ${productCount} productos asociados`,
          data: {
            product_count: productCount,
            suggestion: "Desvincule los productos primero o use force=true",
          },
        },
        { status: 400 }
      );
    }

    // Si se fuerza la eliminación, desvincular productos primero
    if (force && productCount && productCount > 0) {
      // Desvincular productos del grupo de precios
      const { error: updateError } = await supabase
        .from("products")
        .update({
          price_group_id: null,
          updated_at: new Date().toISOString(),
        })
        .eq("price_group_id", id);

      if (updateError) {
        console.error("Error unlinking products:", updateError);
        return NextResponse.json(
          { success: false, error: "Error al desvincular productos del grupo" },
          { status: 500 }
        );
      }
    }

    // Eliminar el grupo de la base de datos
    const { error: deleteError } = await supabase
      .from("price_groups")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Error deleting price group:", deleteError);
      return NextResponse.json(
        { success: false, error: "Error al eliminar el grupo de precios" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message:
        force && productCount && productCount > 0
          ? `Grupo "${existingGroup.name}" eliminado exitosamente y ${productCount} productos desvinculados`
          : "Grupo eliminado exitosamente",
    });
  } catch (error) {
    console.error("Error in DELETE price group:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
