import { NextRequest, NextResponse } from "next/server";
import {
  getPaymentInfo,
  mapPaymentStatus,
  getPaymentStatusDescription,
} from "@/lib/mercadopago";
import { syncOrderFromMercadoPagoPayment } from "@/lib/mercadopago-orders";

/**
 * Obtiene información de un pago por su ID.
 * Con ?confirm=1 también sincroniza la orden en Supabase (backup del webhook).
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ paymentId: string }> }
) {
  try {
    const { paymentId } = await params;
    const confirm =
      request.nextUrl.searchParams.get("confirm") === "1" ||
      request.nextUrl.searchParams.get("confirm") === "true";

    if (!paymentId) {
      return NextResponse.json(
        { error: "Se requiere el ID del pago" },
        { status: 400 }
      );
    }

    const paymentInfo = await getPaymentInfo(paymentId);

    const status = mapPaymentStatus(paymentInfo.status || "");
    const statusDescription = getPaymentStatusDescription(
      paymentInfo.status || ""
    );

    let sync = null;
    if (confirm) {
      sync = await syncOrderFromMercadoPagoPayment({
        id: paymentInfo.id ?? paymentId,
        status: paymentInfo.status,
        external_reference: paymentInfo.external_reference,
        payment_method_id: paymentInfo.payment_method_id,
        payment_type_id: paymentInfo.payment_type_id,
      });
    }

    return NextResponse.json({
      success: true,
      payment: {
        id: paymentInfo.id,
        status: paymentInfo.status,
        status_detail: paymentInfo.status_detail,
        mapped_status: status,
        status_description: statusDescription,
        external_reference: paymentInfo.external_reference,
        transaction_amount: paymentInfo.transaction_amount,
        currency_id: paymentInfo.currency_id,
        payment_method_id: paymentInfo.payment_method_id,
        payment_type_id: paymentInfo.payment_type_id,
        date_created: paymentInfo.date_created,
        date_approved: paymentInfo.date_approved,
        payer: paymentInfo.payer,
      },
      sync,
    });
  } catch (error) {
    console.error("Error obteniendo información del pago:", error);
    return NextResponse.json(
      {
        error: "Error al obtener información del pago",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
