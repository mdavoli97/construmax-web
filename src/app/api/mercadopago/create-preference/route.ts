import { NextRequest, NextResponse } from "next/server";
import {
  createPreference,
  MercadoPagoItem,
  MercadoPagoPayer,
} from "@/lib/mercadopago";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      items,
      payer,
      external_reference,
    }: {
      items: MercadoPagoItem[];
      payer?: MercadoPagoPayer;
      external_reference?: string;
    } = body;

    // Validaciones
    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "Se requiere al menos un item" },
        { status: 400 }
      );
    }

    // Validar cada item
    for (const item of items) {
      if (!item.title || !item.quantity || !item.unit_price) {
        return NextResponse.json(
          { error: "Cada item debe tener title, quantity y unit_price" },
          { status: 400 }
        );
      }

      if (item.quantity <= 0) {
        return NextResponse.json(
          { error: "La cantidad debe ser mayor a 0" },
          { status: 400 }
        );
      }

      if (item.unit_price <= 0) {
        return NextResponse.json(
          { error: "El precio unitario debe ser mayor a 0" },
          { status: 400 }
        );
      }
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    // Crear la preferencia de pago
    const preference = await createPreference({
      items: items.map((item) => ({
        id: item.id || `item-${Date.now()}`,
        title: item.title,
        description: item.description,
        picture_url: item.picture_url,
        category_id: item.category_id || "others",
        quantity: item.quantity,
        currency_id: item.currency_id || "UYU",
        unit_price: item.unit_price,
      })),
      payer: payer,
      external_reference: external_reference || `ORDER_${Date.now()}`,
      back_urls: {
        success: `${baseUrl}/checkout/return?status=approved`,
        failure: `${baseUrl}/checkout/return?status=rejected`,
        pending: `${baseUrl}/checkout/return?status=pending`,
      },
      auto_return: "approved",
      notification_url: `${baseUrl}/api/mercadopago/webhook`,
      statement_descriptor: "CONSTRUMAX",
    });

    return NextResponse.json({
      success: true,
      preferenceId: preference.id,
      initPoint: preference.init_point,
      sandboxInitPoint: preference.sandbox_init_point,
      externalReference: preference.external_reference,
    });
  } catch (error) {
    console.error("Error creating MercadoPago preference:", error);

    // Extraer más detalles del error si es posible
    let errorMessage = "Error al crear la preferencia de pago";
    let errorDetails = "Unknown error";

    if (error instanceof Error) {
      errorDetails = error.message;
      // Verificar si es un error de MercadoPago con más detalles
      if ("cause" in error && error.cause) {
        console.error("Error cause:", error.cause);
        errorDetails += ` - Cause: ${JSON.stringify(error.cause)}`;
      }
    }

    // Log completo del error para debug
    console.error(
      "Full error object:",
      JSON.stringify(error, Object.getOwnPropertyNames(error), 2)
    );

    return NextResponse.json(
      {
        error: errorMessage,
        details: errorDetails,
      },
      { status: 500 }
    );
  }
}
