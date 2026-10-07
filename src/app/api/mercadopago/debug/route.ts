import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { blockMercadoPagoDevRoutesInProduction } from "@/lib/mercadopago-dev-routes";

// Endpoint para diagnosticar problemas con MercadoPago
export async function GET(request: NextRequest) {
  const blocked = blockMercadoPagoDevRoutesInProduction();
  if (blocked) return blocked;

  const searchParams = request.nextUrl.searchParams;
  const externalRef = searchParams.get("ref");
  const prefId = searchParams.get("pref"); // ID de preferencia para consultar

  const diagnostics: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    environment: {
      NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || "NOT SET",
      WEBHOOK_URL: `${process.env.NEXT_PUBLIC_BASE_URL || "NOT SET"}/api/mercadopago/webhook`,
      SUPABASE_URL_SET: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      SERVICE_ROLE_SET: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      MERCADOPAGO_TOKEN_SET: !!process.env.MERCADOPAGO_ACCESS_TOKEN,
      MERCADOPAGO_TOKEN_PREFIX:
        process.env.MERCADOPAGO_ACCESS_TOKEN?.substring(0, 7) || "NOT SET",
      WEBHOOK_SECRET_SET: !!process.env.MERCADOPAGO_WEBHOOK_SECRET,
    },
  };

  // Si se proporciona ID de preferencia, consultar en MercadoPago
  if (prefId) {
    try {
      const client = new MercadoPagoConfig({
        accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || "",
      });
      const preferenceClient = new Preference(client);
      const pref = await preferenceClient.get({ preferenceId: prefId });
      
      diagnostics.preference = {
        id: pref.id,
        external_reference: pref.external_reference,
        notification_url: pref.notification_url,
        back_urls: pref.back_urls,
        auto_return: pref.auto_return,
      };
    } catch (err) {
      diagnostics.preferenceError = err instanceof Error ? err.message : "Error consultando preferencia";
    }
  }

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

// POST: Simular webhook para probar que el endpoint funciona
// Uso: POST /api/mercadopago/debug con body { "external_reference": "ORDER_xxx", "simulate_payment_id": "12345" }
export async function POST(request: NextRequest) {
  const blocked = blockMercadoPagoDevRoutesInProduction();
  if (blocked) return blocked;

  try {
    const body = await request.json();
    const { external_reference, simulate_payment_id } = body;

    if (!external_reference) {
      return NextResponse.json(
        { error: "Se requiere external_reference" },
        { status: 400 },
      );
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.SUPABASE_SERVICE_ROLE_KEY || "",
    );

    // Actualizar la orden directamente (simula lo que haría el webhook)
    const { data, error } = await supabaseAdmin
      .from("orders")
      .update({
        status: "paid",
        payment_id: simulate_payment_id || "SIMULATED_" + Date.now(),
        payment_status: "approved",
        updated_at: new Date().toISOString(),
      })
      .eq("external_reference", external_reference)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Error actualizando orden", details: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Orden actualizada (simulación de webhook)",
      order: data,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 },
    );
  }
}
