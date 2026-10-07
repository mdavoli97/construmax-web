import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  ALLOWED_ORDER_STATUSES,
  canTransitionStatus,
  normalizeStatus,
} from "@/lib/order-fulfillment";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const status = typeof body.status === "string" ? body.status.trim() : "";
    const resolvedParams = await params;
    const orderId = resolvedParams.id;

    if (!status || !(ALLOWED_ORDER_STATUSES as readonly string[]).includes(status)) {
      return NextResponse.json(
        { error: "Estado de orden inválido" },
        { status: 400 }
      );
    }

    const { data: existing, error: fetchError } = await supabase
      .from("orders")
      .select("id, status, delivery_method")
      .eq("id", orderId)
      .maybeSingle();

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: "Orden no encontrada" },
        { status: 404 }
      );
    }

    const deliveryMethod = existing.delivery_method || "delivery";
    if (!canTransitionStatus(existing.status, status, deliveryMethod)) {
      return NextResponse.json(
        {
          error: `Transición no permitida: ${normalizeStatus(
            existing.status
          )} → ${normalizeStatus(status)}`,
        },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("orders")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)
      .select()
      .single();

    if (error) {
      console.error("Error updating order:", error);
      return NextResponse.json(
        { error: "Error al actualizar la orden" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, order: data });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
