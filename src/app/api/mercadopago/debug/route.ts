import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Endpoint para diagnosticar problemas con MercadoPago
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const externalRef = searchParams.get("ref");

  const diagnostics: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    environment: {
      NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || "NOT SET",
      SUPABASE_URL_SET: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      SERVICE_ROLE_SET: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      MERCADOPAGO_TOKEN_SET: !!process.env.MERCADOPAGO_ACCESS_TOKEN,
      MERCADOPAGO_TOKEN_PREFIX:
        process.env.MERCADOPAGO_ACCESS_TOKEN?.substring(0, 7) || "NOT SET",
    },
  };

  // Si se proporciona una referencia externa, buscar la orden
  if (externalRef) {
    try {
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || "",
        process.env.SUPABASE_SERVICE_ROLE_KEY || "",
      );

      const { data: order, error } = await supabaseAdmin
        .from("orders")
        .select(
          "id, status, external_reference, payment_id, payment_status, created_at",
        )
        .eq("external_reference", externalRef)
        .single();

      diagnostics.orderSearch = {
        externalRef,
        found: !!order,
        order: order || null,
        error: error?.message || null,
      };
    } catch (err) {
      diagnostics.orderSearch = {
        error: err instanceof Error ? err.message : "Unknown error",
      };
    }
  }

  // Verificar estructura de la tabla orders y mostrar últimas órdenes
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.SUPABASE_SERVICE_ROLE_KEY || "",
    );

    // Obtener las últimas 5 órdenes
    const { data: recentOrders, error } = await supabaseAdmin
      .from("orders")
      .select(
        "id, status, external_reference, payment_id, payment_status, payment_method, created_at, mercadopago_preference_id",
      )
      .order("created_at", { ascending: false })
      .limit(5);

    if (recentOrders && recentOrders.length > 0) {
      diagnostics.recentOrders = recentOrders;
      diagnostics.tableColumns = Object.keys(recentOrders[0]);
      diagnostics.hasMercadoPagoColumns = {
        external_reference: "external_reference" in recentOrders[0],
        payment_id: "payment_id" in recentOrders[0],
        payment_status: "payment_status" in recentOrders[0],
        mercadopago_preference_id:
          "mercadopago_preference_id" in recentOrders[0],
      };
    }

    if (error) {
      diagnostics.tableError = error.message;
    }
  } catch (err) {
    diagnostics.tableCheckError =
      err instanceof Error ? err.message : "Unknown error";
  }

  return NextResponse.json(diagnostics, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
