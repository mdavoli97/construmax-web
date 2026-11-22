import { NextRequest, NextResponse } from "next/server";
import { adminUnauthorized, requireAdmin } from "@/lib/admin-session";
import {
  getFeaturedProductIds,
  saveFeaturedProductIds,
} from "@/lib/featured-products";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!requireAdmin(request)) return adminUnauthorized();
  const productIds = await getFeaturedProductIds();
  return NextResponse.json({ success: true, productIds });
}

export async function PUT(request: NextRequest) {
  if (!requireAdmin(request)) return adminUnauthorized();
  try {
    const body = await request.json();
    const result = await saveFeaturedProductIds(body?.productIds);
    if (result.error) {
      return NextResponse.json(
        { success: false, error: "No se pudieron guardar los productos" },
        { status: 500 }
      );
    }
    return NextResponse.json({
      success: true,
      productIds: result.productIds,
    });
  } catch (error) {
    console.error("Error saving featured products:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
