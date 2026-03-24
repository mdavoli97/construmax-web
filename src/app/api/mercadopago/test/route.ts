import { NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";

export async function GET() {
  try {
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

    if (!accessToken) {
      return NextResponse.json(
        {
          error: "MERCADOPAGO_ACCESS_TOKEN no está configurado",
          configured: false,
        },
        { status: 500 },
      );
    }

    console.log(
      "🔑 Access Token (primeros 20 chars):",
      accessToken.substring(0, 20) + "...",
    );

    const client = new MercadoPagoConfig({
      accessToken: accessToken,
      options: { timeout: 10000 },
    });

    const preferenceClient = new Preference(client);

    // Crear una preferencia de prueba simple
    // Nota: Para desarrollo local, no usar auto_return ya que MercadoPago
    // requiere URLs públicas válidas para back_urls
    const testPreference = {
      items: [
        {
          id: "test-item-1",
          title: "Producto de Prueba",
          quantity: 1,
          currency_id: "UYU",
          unit_price: 100,
        },
      ],
    };

    console.log(
      "📤 Enviando preferencia de prueba:",
      JSON.stringify(testPreference, null, 2),
    );

    const response = await preferenceClient.create({ body: testPreference });

    console.log("✅ Preferencia creada exitosamente!");
    console.log("📥 Respuesta:", JSON.stringify(response, null, 2));

    return NextResponse.json({
      success: true,
      message: "Conexión con MercadoPago exitosa!",
      preferenceId: response.id,
      initPoint: response.init_point,
      sandboxInitPoint: response.sandbox_init_point,
    });
  } catch (error: unknown) {
    console.error("❌ Error en test de MercadoPago:", error);

    let errorDetails = "Error desconocido";
    let errorName = "Error";
    let errorStack = "";

    if (error instanceof Error) {
      errorDetails = error.message;
      errorName = error.name;
      errorStack = error.stack || "";

      // Intentar extraer más info si existe
      const anyError = error as unknown as Record<string, unknown>;
      if (anyError.cause) {
        console.error("Cause:", anyError.cause);
      }
      if (anyError.response) {
        console.error("Response:", anyError.response);
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: errorName,
        message: errorDetails,
        stack: errorStack,
        fullError: JSON.stringify(
          error,
          Object.getOwnPropertyNames(error as object),
          2,
        ),
      },
      { status: 500 },
    );
  }
}
