// API para gestionar categorías individuales - versión simplificada
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { adminUnauthorized, requireAdmin } from "@/lib/admin-session";
import { categorySlug } from "@/lib/category-slug";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!requireAdmin(request)) return adminUnauthorized();
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
      .select("id, name, description, icon, slug")
      .eq("id", categoryId)
      .single();

    if (fetchError || !existingCategory) {
      return NextResponse.json(
        { success: false, error: "Categoría no encontrada" },
        { status: 404 }
      );
    }

    const nextName = name.trim();
    const nextDescription = description?.trim() || null;
    const slugValue = categorySlug(nextName);
    if (!slugValue) {
      return NextResponse.json(
        { success: false, error: "El nombre tiene que incluir letras o números" },
        { status: 400 }
      );
    }

    const { data: duplicateCategory, error: duplicateError } = await supabase
      .from("categories")
      .select("id")
      .eq("name", nextName)
      .neq("id", categoryId)
      .maybeSingle();

    if (duplicateError) {
      console.error("Error checking category name:", duplicateError);
      return NextResponse.json(
        { success: false, error: "Error al actualizar la categoría" },
        { status: 500 }
      );
    }

    if (duplicateCategory) {
      return NextResponse.json(
        {
          success: false,
          error: "Ya existe otra categoría con ese nombre",
        },
        { status: 400 }
      );
    }

    const { data: duplicateSlug } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", slugValue)
      .neq("id", categoryId)
      .maybeSingle();

    if (duplicateSlug) {
      return NextResponse.json(
        {
          success: false,
          error: "Ya existe otra categoría con un nombre parecido",
        },
        { status: 400 }
      );
    }

    const oldSlug = existingCategory.slug;
    const slugChanges = Boolean(oldSlug) && oldSlug !== slugValue;
    let holdingId: string | null = null;
    let holdingSlug: string | null = null;

    if (slugChanges) {
      const { count: productCount, error: productCountError } = await supabase
        .from("products")
        .select("id", { count: "exact", head: true })
        .eq("category", oldSlug);

      if (productCountError) {
        console.error("Error counting products:", productCountError);
        return NextResponse.json(
          { success: false, error: "Error al actualizar la categoría" },
          { status: 500 }
        );
      }

      if ((productCount || 0) > 0) {
        holdingSlug = `tmp-rename-${Date.now()}`;
        const { data: holding, error: holdingError } = await supabase
          .from("categories")
          .insert({
            name: `Temporal ${holdingSlug}`,
            description: null,
            icon: existingCategory.icon || "📦",
            slug: holdingSlug,
          })
          .select("id")
          .single();

        if (holdingError || !holding) {
          console.error("Error creating holding category:", holdingError);
          return NextResponse.json(
            { success: false, error: "Error al actualizar la categoría" },
            { status: 500 }
          );
        }

        holdingId = holding.id;
        const { error: parkError } = await supabase
          .from("products")
          .update({ category: holdingSlug })
          .eq("category", oldSlug);

        if (parkError) {
          console.error("Error parking products:", parkError);
          await supabase.from("categories").delete().eq("id", holdingId);
          return NextResponse.json(
            { success: false, error: "Error al actualizar la categoría" },
            { status: 500 }
          );
        }
      }
    }

    const { data: updatedCategory, error: updateError } = await supabase
      .from("categories")
      .update({
        name: nextName,
        description: nextDescription,
        slug: slugValue,
      })
      .eq("id", categoryId)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating category:", updateError);
      if (holdingId && holdingSlug) {
        await supabase
          .from("products")
          .update({ category: oldSlug })
          .eq("category", holdingSlug);
        await supabase.from("categories").delete().eq("id", holdingId);
      }
      return NextResponse.json(
        { success: false, error: "Error al actualizar la categoría" },
        { status: 500 }
      );
    }

    if (holdingId && holdingSlug) {
      const { error: restoreError } = await supabase
        .from("products")
        .update({ category: slugValue })
        .eq("category", holdingSlug);

      if (restoreError) {
        console.error("Error restoring products:", restoreError);
        await supabase
          .from("categories")
          .update({
            name: existingCategory.name,
            description: existingCategory.description,
            slug: oldSlug,
          })
          .eq("id", categoryId);
        await supabase
          .from("products")
          .update({ category: oldSlug })
          .eq("category", holdingSlug);
        await supabase.from("categories").delete().eq("id", holdingId);
        return NextResponse.json(
          { success: false, error: "Error al actualizar la categoría" },
          { status: 500 }
        );
      }

      const { error: holdingDeleteError } = await supabase
        .from("categories")
        .delete()
        .eq("id", holdingId);

      if (holdingDeleteError) {
        console.error("Error deleting holding category:", holdingDeleteError);
      }
    }

    if (slugChanges) {
      const { error: moveGroupsError } = await supabase
        .from("price_groups")
        .update({ category: slugValue })
        .eq("category", oldSlug);

      if (moveGroupsError) {
        console.error("Error moving price groups:", moveGroupsError);
        return NextResponse.json(
          {
            success: false,
            error: "La categoría se renombró, pero no se pudieron mover los grupos de precios",
          },
          { status: 500 }
        );
      }

      revalidatePath(`/productos/${oldSlug}`);
      revalidatePath(`/productos/${slugValue}`);
      revalidatePath("/productos");
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
  if (!requireAdmin(request)) return adminUnauthorized();
  try {
    const { id: categoryId } = await params;
    const { searchParams } = new URL(request.url);
    const force = searchParams.get("force") === "true";

    // Verificar que la categoría existe
    const { data: existingCategory, error: fetchError } = await supabase
      .from("categories")
      .select("id, name, slug")
      .eq("id", categoryId)
      .single();

    if (fetchError || !existingCategory) {
      return NextResponse.json(
        { success: false, error: "Categoría no encontrada" },
        { status: 404 }
      );
    }

    const slug = existingCategory.slug;
    const { count: productCount, error: productCountError } = await supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("category", slug);
    const { count: groupCount, error: groupCountError } = await supabase
      .from("price_groups")
      .select("id", { count: "exact", head: true })
      .eq("category", slug);

    if (productCountError || groupCountError) {
      console.error("Error counting category references:", {
        productCountError,
        groupCountError,
      });
      return NextResponse.json(
        { success: false, error: "Error al revisar la categoría" },
        { status: 500 }
      );
    }

    const products = productCount || 0;
    const groups = groupCount || 0;
    const moveTo = searchParams.get("moveTo")?.trim() || "";

    if ((products > 0 || groups > 0) && !force) {
      const parts: string[] = [];
      if (products > 0) {
        parts.push(`${products} producto${products > 1 ? "s" : ""}`);
      }
      if (groups > 0) {
        parts.push(`${groups} grupo${groups > 1 ? "s" : ""} de precios`);
      }
      return NextResponse.json(
        {
          success: false,
          error: `No se puede eliminar "${existingCategory.name}" porque tiene ${parts.join(" y ")}.`,
          productCount: products,
          groupCount: groups,
          requiresMove: products > 0,
        },
        { status: 400 }
      );
    }

    if (products > 0) {
      if (!moveTo || moveTo === slug) {
        return NextResponse.json(
          {
            success: false,
            error: "Elegí otra categoría para mover los productos.",
            productCount: products,
            groupCount: groups,
            requiresMove: true,
          },
          { status: 400 }
        );
      }

      const { data: destination, error: destinationError } = await supabase
        .from("categories")
        .select("id, name, slug")
        .eq("slug", moveTo)
        .maybeSingle();

      if (destinationError || !destination) {
        return NextResponse.json(
          {
            success: false,
            error: "La categoría de destino no existe.",
            productCount: products,
            groupCount: groups,
            requiresMove: true,
          },
          { status: 400 }
        );
      }

      const { error: moveProductsError } = await supabase
        .from("products")
        .update({ category: destination.slug })
        .eq("category", slug);

      if (moveProductsError) {
        console.error("Error moving products:", moveProductsError);
        return NextResponse.json(
          {
            success: false,
            error: "No se pudieron mover los productos a la otra categoría.",
          },
          { status: 500 }
        );
      }
    }

    if (groups > 0) {
      const nextCategory = moveTo || null;
      const { error: moveGroupsError } = await supabase
        .from("price_groups")
        .update({ category: nextCategory })
        .eq("category", slug);

      if (moveGroupsError) {
        console.error("Error moving price groups:", moveGroupsError);
        return NextResponse.json(
          {
            success: false,
            error: "No se pudieron desvincular los grupos de precios.",
          },
          { status: 500 }
        );
      }
    }

    const { data: deletedRows, error: deleteError } = await supabase
      .from("categories")
      .delete()
      .eq("id", categoryId)
      .select("id");

    if (deleteError) {
      console.error("Error deleting category:", deleteError);
      const blocked = deleteError.code === "23503";
      return NextResponse.json(
        {
          success: false,
          error: blocked
            ? "No se puede eliminar la categoría porque todavía tiene productos asociados."
            : "Error al eliminar la categoría",
          productCount: blocked ? products || 1 : products,
          groupCount: groups,
          requiresMove: blocked,
        },
        { status: blocked ? 400 : 500 }
      );
    }

    if (!deletedRows?.length) {
      return NextResponse.json(
        { success: false, error: "No se pudo eliminar la categoría" },
        { status: 500 }
      );
    }

    revalidatePath("/productos");
    revalidatePath(`/productos/${slug}`);
    if (moveTo) revalidatePath(`/productos/${moveTo}`);

    let message = `Categoría "${existingCategory.name}" eliminada exitosamente`;
    if (products > 0) {
      message +=
        products === 1
          ? ". 1 producto pasó a otra categoría"
          : `. ${products} productos pasaron a otra categoría`;
    } else if (groups > 0) {
      message +=
        groups === 1
          ? ". 1 grupo de precios quedó sin categoría"
          : `. ${groups} grupos de precios quedaron sin categoría`;
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
