import { NextRequest, NextResponse } from "next/server";
import { productService } from "@/lib/services";
import { revalidatePath } from "next/cache";
import { adminUnauthorized, requireAdmin } from "@/lib/admin-session";

// GET - Obtener producto por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!requireAdmin(request)) return adminUnauthorized();
  try {
    const { id } = await params;
    const product = await productService.getById(id);
    if (!product) {
      return NextResponse.json(
        { error: "Producto no encontrado" },
        { status: 404 }
      );
    }
    return NextResponse.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Error al obtener producto" },
      { status: 500 }
    );
  }
}

// PUT - Actualizar producto
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!requireAdmin(request)) return adminUnauthorized();
  try {
    const { id } = await params;
    const body = await request.json();

    // Usar cliente admin para bypassear RLS
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!serviceRoleKey) {
      return NextResponse.json(
        { error: "Configuración de servicio no disponible" },
        { status: 500 }
      );
    }

    const { createClient } = await import("@supabase/supabase-js");
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const lockToUyu = body.lock_to_uyu;
    const productFields = { ...body };
    delete productFields.lock_to_uyu;

    if (typeof lockToUyu === "boolean") {
      const { setUyuLock } = await import("@/lib/uyu-lock");
      await setUyuLock(id, lockToUyu);
    }

    const hasProductFields = Object.keys(productFields).length > 0;
    let data: Record<string, unknown> | null = null;
    if (hasProductFields) {
      const { data: updated, error } = await adminClient
        .from("products")
        .update({
          ...productFields,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      data = updated;
    }

    if (!data && typeof lockToUyu !== "boolean") {
      return NextResponse.json(
        { error: "Nada para actualizar" },
        { status: 400 }
      );
    }

    // Revalidate the product pages after update
    revalidatePath("/productos");
    revalidatePath("/");
    if (typeof data?.category === "string") {
      revalidatePath(`/productos/${data.category}`);
    }

    return NextResponse.json({
      ...(data || { id }),
      ...(typeof lockToUyu === "boolean" ? { lock_to_uyu: lockToUyu } : {}),
    });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Error al actualizar producto" },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar producto
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!requireAdmin(request)) return adminUnauthorized();
  try {
    const { id } = await params;
    // Usar cliente admin para bypassear RLS
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!serviceRoleKey) {
      return NextResponse.json(
        { error: "Configuración de servicio no disponible" },
        { status: 500 }
      );
    }

    const { createClient } = await import("@supabase/supabase-js");
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const { error } = await adminClient.from("products").delete().eq("id", id);

    if (error) throw error;

    const { setUyuLock } = await import("@/lib/uyu-lock");
    await setUyuLock(id, false);

    // Revalidar las páginas que muestran productos
    revalidatePath("/productos");
    revalidatePath("/");
    revalidatePath("/productos/[category]", "page");

    return NextResponse.json({ message: "Producto eliminado exitosamente" });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Error al eliminar producto" },
      { status: 500 }
    );
  }
}
