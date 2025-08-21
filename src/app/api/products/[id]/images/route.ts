import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { data, error } = await supabase
      .from("product_images")
      .select("*")
      .eq("product_id", id)
      .order("display_order", { ascending: true });

    if (error) {
      throw error;
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error("Error fetching product images:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let body: any;
  try {
    const { id } = await params;
    body = await request.json();
    const { image_url, alt_text, is_primary = false, display_order = 0 } = body;

    // Si es imagen principal, actualizar las demás para que no sean principales
    if (is_primary) {
      await supabase
        .from("product_images")
        .update({ is_primary: false })
        .eq("product_id", id);
    }

    const { data, error } = await supabase
      .from("product_images")
      .insert({
        product_id: id,
        image_url,
        alt_text,
        is_primary,
        display_order,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Si es imagen principal, actualizar el campo primary_image del producto
    if (is_primary) {
      await supabase
        .from("products")
        .update({ primary_image: image_url })
        .eq("id", id);
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error adding product image:", error);

    // Manejo específico de errores de base de datos
    if (error?.code === "22001") {
      const urlLength = body.image_url?.length || 0;
      return NextResponse.json(
        {
          error: `La URL de la imagen es demasiado larga (${urlLength} caracteres). La base de datos necesita ser actualizada a TEXT.`,
          code: error.code,
          details: `URL length: ${urlLength} chars. Para imágenes base64, ejecuta: ALTER TABLE product_images ALTER COLUMN image_url TYPE TEXT;`,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: error?.message || "Error interno del servidor",
        code: error?.code || "UNKNOWN",
      },
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
    const imageId = searchParams.get("imageId");

    if (!imageId) {
      return NextResponse.json(
        { error: "ID de imagen requerido" },
        { status: 400 }
      );
    }

    // Obtener información de la imagen antes de eliminarla
    const { data: imageData, error: fetchError } = await supabase
      .from("product_images")
      .select("is_primary")
      .eq("id", imageId)
      .eq("product_id", id)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    // Eliminar la imagen
    const { error } = await supabase
      .from("product_images")
      .delete()
      .eq("id", imageId)
      .eq("product_id", id);

    if (error) {
      throw error;
    }

    // Si era la imagen principal, buscar otra para hacer principal
    if (imageData?.is_primary) {
      const { data: remainingImages } = await supabase
        .from("product_images")
        .select("*")
        .eq("product_id", id)
        .order("display_order", { ascending: true })
        .limit(1);

      if (remainingImages && remainingImages.length > 0) {
        const newPrimaryImage = remainingImages[0];

        // Actualizar como imagen principal
        await supabase
          .from("product_images")
          .update({ is_primary: true })
          .eq("id", newPrimaryImage.id);

        // Actualizar el producto
        await supabase
          .from("products")
          .update({ primary_image: newPrimaryImage.image_url })
          .eq("id", id);
      } else {
        // No hay más imágenes, limpiar el primary_image del producto
        await supabase
          .from("products")
          .update({ primary_image: null })
          .eq("id", id);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting product image:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
