import { NextRequest, NextResponse } from "next/server";
import { adminUnauthorized, requireAdmin } from "@/lib/admin-session";
import { getBanners, saveBanners } from "@/lib/banners";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!requireAdmin(request)) return adminUnauthorized();
  const banners = await getBanners();
  return NextResponse.json({ success: true, banners });
}

export async function PUT(request: NextRequest) {
  if (!requireAdmin(request)) return adminUnauthorized();
  try {
    const body = await request.json();
    const result = await saveBanners(body?.banners);
    if (result.error) {
      return NextResponse.json(
        { success: false, error: "No se pudieron guardar los banners" },
        { status: 500 }
      );
    }
    return NextResponse.json({ success: true, banners: result.banners });
  } catch (error) {
    console.error("Error saving banners:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
