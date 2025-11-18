// API para gestionar categorías individuales - versión simplificada
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: categoryId } = await params;
    const body = await request.json();
    const { name, description } = body;

    // Validaciones
    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: "El nombre es requerido" },
        { status: 400 }
      );
    }

    // Verificar que la categoría existe
    const { data: existingCategory, error: fetchError } = await supabase
      .from("categories")
      .select("id, name, icon, slug")
      .eq("id", categoryId)
      .single();

    if (fetchError || !existingCategory) {
      return NextResponse.json(
        { success: false, error: "Categoría no encontrada" },
        { status: 404 }
      );
    }

    // Verificar que no exista otra categoría con el mismo nombre (excluir la actual)
    const { data: duplicateCategory } = await supabase
      .from("categories")
      .select("id")
      .eq("name", name.trim())
      .neq("id", categoryId)
      .single();

    if (duplicateCategory) {
      return NextResponse.json(
        {
          success: false,
          error: "Ya existe otra categoría con ese nombre",
        },
        { status: 400 }
      );
    }

    // Actualizar la categoría (sin updated_at porque la tabla no lo tiene)
    const slugValue = name
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/ñ/g, "n")
      .replace(/[^\w-]/g, "");
    const { data: updatedCategory, error: updateError } = await supabase
      .from("categories")
      .update({
        name: name.trim(),
        description: description?.trim() || null,
        slug: slugValue,
      })
      .eq("id", categoryId)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating category:", updateError);
      return NextResponse.json(
        { success: false, error: "Error al actualizar la categoría" },
        { status: 500 }
      );
    }

    // Agregar is_active y updated_at para compatibilidad con el frontend
    const categoryWithActive = {
      ...updatedCategory,
      is_active: true,
      updated_at: updatedCategory.created_at,
    };

    return NextResponse.json({
      success: true,
      data: categoryWithActive,
    });
  } catch (error) {
    console.error("Error in PUT category:", error);
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
    const { id: categoryId } = await params;
    const { searchParams } = new URL(request.url);
    const force = searchParams.get("force") === "true";

    // Verificar que la categoría existe
    const { data: existingCategory, error: fetchError } = await supabase
      .from("categories")
      .select("id, name")
      .eq("id", categoryId)
      .single();

    if (fetchError || !existingCategory) {
      return NextResponse.json(
        { success: false, error: "Categoría no encontrada" },
        { status: 404 }
      );
    }

    // Verificar si hay productos asociados
    const { count: productCount } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("category", existingCategory.name);

    if (productCount && productCount > 0 && !force) {
      return NextResponse.json(
        {
          success: false,
          error: `No se puede eliminar la categoría porque tiene ${productCount} producto${
            productCount > 1 ? "s" : ""
          } asociado${productCount > 1 ? "s" : ""}.`,
          productCount,
        },
        { status: 400 }
      );
    }

    // Eliminar la categoría (hard delete ya que no tenemos is_active)
    const { error: deleteError } = await supabase
      .from("categories")
      .delete()
      .eq("id", categoryId);

    if (deleteError) {
      console.error("Error deleting category:", deleteError);
      return NextResponse.json(
        { success: false, error: "Error al eliminar la categoría" },
        { status: 500 }
      );
    }

    let message = `Categoría "${existingCategory.name}" eliminada exitosamente`;
    if (productCount && productCount > 0) {
      message += ` (${productCount} producto${
        productCount > 1 ? "s" : ""
      } quedarán sin categoría)`;
    }

    return NextResponse.json({
      success: true,
      message,
    });
  } catch (error) {
    console.error("Error in DELETE category:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
