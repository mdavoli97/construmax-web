import { NextRequest, NextResponse } from "next/server";
import { adminUnauthorized, requireAdmin } from "@/lib/admin-session";
import { getSiteSettings, saveSiteSettings } from "@/lib/site-settings";

export async function GET(request: NextRequest) {
  if (!requireAdmin(request)) return adminUnauthorized();
  const settings = await getSiteSettings();
  return NextResponse.json({ success: true, settings });
}

export async function PUT(request: NextRequest) {
  if (!requireAdmin(request)) return adminUnauthorized();
  try {
    const body = await request.json();
    const result = await saveSiteSettings(body);
    if (result.error) {
      return NextResponse.json(
        { success: false, error: "No se pudieron guardar los ajustes" },
        { status: 500 }
      );
    }
    return NextResponse.json({ success: true, settings: result.settings });
  } catch (error) {
    console.error("Error saving site settings:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
