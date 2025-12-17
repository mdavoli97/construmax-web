import { NextRequest, NextResponse } from "next/server";
import {
  getSessionInfo,
  isPaymentApproved,
  getPaymentReference,
} from "@/lib/placetopay";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  try {
    const { requestId: requestIdStr } = await params;
    const requestId = parseInt(requestIdStr);

    if (isNaN(requestId)) {
      return NextResponse.json(
        { error: "requestId debe ser un número válido" },
        { status: 400 }
      );
    }

    // Consultar la información de la sesión
    const sessionInfo = await getSessionInfo(requestId);

    // Verificar si el pago fue aprobado
    const approved = isPaymentApproved(sessionInfo);
    const paymentReference = getPaymentReference(sessionInfo);

    return NextResponse.json({
      success: true,
      requestId: sessionInfo.requestId,
      status: sessionInfo.status,
      approved,
      paymentReference,
      payment: sessionInfo.payment,
      request: sessionInfo.request,
    });
  } catch (error) {
    console.error("Error getting PlaceToPay session info:", error);
    return NextResponse.json(
      {
        error: "Error al consultar el estado del pago",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  // Alias para permitir también POST
  return GET(request, { params });
}
