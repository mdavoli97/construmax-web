import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { mapPaymentStatus } from "@/lib/mercadopago";
import {
  isFulfillmentStatus,
  normalizeStatus,
} from "@/lib/order-fulfillment";

export type MercadoPagoPaymentLike = {
  id?: string | number | null;
  status?: string | null;
  external_reference?: string | null;
  payment_method_id?: string | null;
  payment_type_id?: string | null;
};

function getSupabaseAdmin(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || ""
  );
}

export function orderStatusFromMpPayment(
  mpStatus: string
): "confirmed" | "pending_payment" | "payment_failed" {
  const mapped = mapPaymentStatus(mpStatus);
  // Pago aprobado → pedido confirmado (inicio del seguimiento)
  if (mapped === "approved") return "confirmed";
  if (mapped === "pending") return "pending_payment";
  return "payment_failed";
}

/**
 * Actualiza la orden asociada a un pago de Mercado Pago.
 * Idempotente: si ya tiene el mismo payment_id y status, no escribe.
 */
export async function syncOrderFromMercadoPagoPayment(
  payment: MercadoPagoPaymentLike,
  supabaseAdmin: SupabaseClient = getSupabaseAdmin()
): Promise<{
  updated: boolean;
  skipped: boolean;
  orderStatus?: string;
  externalReference?: string | null;
  error?: string;
}> {
  const externalReference = payment.external_reference;
  const paymentId = payment.id != null ? String(payment.id) : null;
  const mpStatus = payment.status || "";

  if (!externalReference || !paymentId) {
    return {
      updated: false,
      skipped: true,
      externalReference,
      error: "Falta external_reference o payment id",
    };
  }

  const orderStatus = orderStatusFromMpPayment(mpStatus);

  const { data: existing, error: fetchError } = await supabaseAdmin
    .from("orders")
    .select("id, status, payment_id, payment_status")
    .eq("external_reference", externalReference)
    .maybeSingle();

  if (fetchError) {
    return {
      updated: false,
      skipped: false,
      orderStatus,
      externalReference,
      error: fetchError.message,
    };
  }

  if (!existing) {
    return {
      updated: false,
      skipped: true,
      orderStatus,
      externalReference,
      error: "Orden no encontrada",
    };
  }

  const currentNormalized = normalizeStatus(existing.status);
  const alreadyInFulfillment =
    isFulfillmentStatus(existing.status) && currentNormalized !== "confirmed";

  // Si el admin ya avanzó el seguimiento, no pisar el status con confirmed.
  const nextStatus =
    orderStatus === "confirmed" && alreadyInFulfillment
      ? existing.status
      : orderStatus;

  if (
    existing.payment_id === paymentId &&
    existing.status === nextStatus &&
    existing.payment_status === mpStatus
  ) {
    return {
      updated: false,
      skipped: true,
      orderStatus: nextStatus,
      externalReference,
    };
  }

  const { error: updateError } = await supabaseAdmin
    .from("orders")
    .update({
      status: nextStatus,
      payment_id: paymentId,
      payment_status: mpStatus,
      payment_method_id: payment.payment_method_id ?? null,
      payment_type: payment.payment_type_id ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("external_reference", externalReference);

  if (updateError) {
    return {
      updated: false,
      skipped: false,
      orderStatus,
      externalReference,
      error: updateError.message,
    };
  }

  return {
    updated: true,
    skipped: false,
    orderStatus: nextStatus,
    externalReference,
  };
}
