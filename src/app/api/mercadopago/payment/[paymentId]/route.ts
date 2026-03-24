import { NextRequest, NextResponse } from "next/server";
import {
  getPaymentInfo,
  mapPaymentStatus,
  getPaymentStatusDescription,
} from "@/lib/mercadopago";

/**
 * Obtiene información de un pago por su ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ paymentId: string }> }
) {
  try {
    const { paymentId } = await params;

    if (!paymentId) {
      return NextResponse.json(
        { error: "Se requiere el ID del pago" },
        { status: 400 }
      );
    }

    // Obtener información del pago
    const paymentInfo = await getPaymentInfo(paymentId);

    const status = mapPaymentStatus(paymentInfo.status || "");
    const statusDescription = getPaymentStatusDescription(
      paymentInfo.status || ""
    );

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
