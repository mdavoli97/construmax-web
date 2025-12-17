import { NextRequest, NextResponse } from "next/server";
import { createPaymentSession } from "@/lib/placetopay";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { reference, description, amount, currency = "UYU", buyer } = body;

    // Validaciones
    if (!reference || !description || !amount) {
      return NextResponse.json(
        { error: "Faltan datos requeridos: reference, description, amount" },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: "El monto debe ser mayor a 0" },
        { status: 400 }
      );
    }

    // Obtener IP y User Agent del cliente
    const ipAddress =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";
    const userAgent = request.headers.get("user-agent") || "Mozilla/5.0";

    // Crear la sesión de pago
    const session = await createPaymentSession(
      reference,
      description,
      amount,
      currency,
      buyer,
      ipAddress,
      userAgent
    );

    return NextResponse.json({
      success: true,
      requestId: session.requestId,
      processUrl: session.processUrl,
      status: session.status,
    });
  } catch (error) {
    console.error("Error creating PlaceToPay session:", error);
    return NextResponse.json(
      {
        error: "Error al crear la sesión de pago",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
