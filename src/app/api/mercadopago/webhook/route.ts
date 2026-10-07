import { NextRequest, NextResponse } from "next/server";
import {
  getPaymentInfo,
  mapPaymentStatus,
  getPaymentStatusDescription,
} from "@/lib/mercadopago";
import { syncOrderFromMercadoPagoPayment } from "@/lib/mercadopago-orders";
import crypto from "crypto";

/**
 * Verifica la firma del webhook de MercadoPago
 * Documentación: https://www.mercadopago.com.ar/developers/es/docs/your-integrations/notifications/webhooks#verificarsufirma
 */
function verifyWebhookSignature(
  xSignature: string | null,
  xRequestId: string | null,
  dataId: string
): boolean {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;

  if (!secret) {
    console.warn(
      "⚠️ MERCADOPAGO_WEBHOOK_SECRET no configurado - se omite verificación de firma"
    );
    return true;
  }

  if (!xSignature || !xRequestId) {
    console.error("❌ Faltan headers x-signature o x-request-id");
    return false;
  }

  const parts = xSignature.split(",");
  let ts = "";
  let hash = "";

  for (const part of parts) {
    const [key, value] = part.split("=");
    if (key?.trim() === "ts") ts = value?.trim() || "";
    if (key?.trim() === "v1") hash = value?.trim() || "";
  }

  if (!ts || !hash) {
    console.error("❌ Formato de x-signature inválido");
    return false;
  }

  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
  const calculatedHash = crypto
    .createHmac("sha256", secret)
    .update(manifest)
    .digest("hex");

  const isValid = calculatedHash === hash;

  if (!isValid) {
    console.error("❌ Firma del webhook inválida");
    console.error("  Expected:", hash);
    console.error("  Calculated:", calculatedHash);
  }

  return isValid;
}

/** IDs dummy que envía el panel de MP al probar el webhook (no pagos reales). */
function isDummyWebhookNotification(body: {
  id?: unknown;
  data?: { id?: unknown };
}): boolean {
  const dataId = String(body.data?.id ?? "");
  const bodyId = String(body.id ?? "");
  return (
    dataId === "123456" ||
    dataId.startsWith("123456") ||
    bodyId === "123456"
  );
}

export async function POST(request: NextRequest) {
  try {
    const xSignature = request.headers.get("x-signature");
    const xRequestId = request.headers.get("x-request-id");
    const body = await request.json();

    console.log(
      "📩 Webhook de MercadoPago recibido:",
      JSON.stringify(body, null, 2)
    );

    const { type, data, action } = body;

    if (isDummyWebhookNotification(body)) {
      console.log("🧪 Notificación dummy de MP - respondiendo OK sin actualizar");
      return NextResponse.json({
        received: true,
        test: true,
        message: "Notificación de prueba recibida correctamente",
      });
    }

    if (data?.id) {
      const isValidSignature = verifyWebhookSignature(
        xSignature,
        xRequestId,
        String(data.id)
      );

      if (!isValidSignature) {
        if (process.env.MERCADOPAGO_WEBHOOK_SECRET) {
          return NextResponse.json(
            { error: "Firma del webhook inválida" },
            { status: 401 }
          );
        }
      } else {
        console.log("✅ Firma del webhook verificada correctamente");
      }
    }

    if (type === "payment" && data?.id) {
      const paymentId = data.id;
      console.log(`💳 Procesando pago ID: ${paymentId}`);

      try {
        const paymentInfo = await getPaymentInfo(paymentId);
        const status = mapPaymentStatus(paymentInfo.status || "");
        const statusDescription = getPaymentStatusDescription(
          paymentInfo.status || ""
        );

        console.log(`📊 Status: ${status} (${statusDescription})`);
        console.log(`🔗 External Reference: ${paymentInfo.external_reference}`);
        console.log(`🧪 live_mode: ${body.live_mode}`);

        const syncResult = await syncOrderFromMercadoPagoPayment({
          id: paymentInfo.id ?? paymentId,
          status: paymentInfo.status,
          external_reference: paymentInfo.external_reference,
          payment_method_id: paymentInfo.payment_method_id,
          payment_type_id: paymentInfo.payment_type_id,
        });

        if (syncResult.error && !syncResult.skipped) {
          console.error("Error actualizando orden:", syncResult.error);
        } else if (syncResult.updated) {
          console.log(
            `✅ Orden ${syncResult.externalReference} actualizada a: ${syncResult.orderStatus}`
          );
        } else if (syncResult.skipped) {
          console.log(
            `⏭️ Sync omitido: ${syncResult.error || "ya sincronizado"}`
          );
        }

        return NextResponse.json({
          received: true,
          paymentId,
          status,
          externalReference: paymentInfo.external_reference,
          sync: syncResult,
        });
      } catch (paymentError) {
        console.error("Error al obtener información del pago:", paymentError);
        return NextResponse.json({
          received: true,
          error: "Error al procesar el pago, pero se recibió la notificación",
        });
      }
    }

    if (type === "merchant_order") {
      console.log(`📦 Orden de comercio recibida: ${data?.id}`);
    }

    if (type === "chargebacks") {
      console.log(`⚠️ Contracargo recibido: ${data?.id}`);
    }

    return NextResponse.json({ received: true, type, action });
  } catch (error) {
    console.error("Error en webhook de MercadoPago:", error);
    return NextResponse.json({
      received: true,
      error: error instanceof Error ? error.message : "Error desconocido",
    });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const challenge = searchParams.get("hub.challenge");

  if (challenge) {
    return new NextResponse(challenge, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  }

  return NextResponse.json({
    status: "ok",
    message: "Webhook de MercadoPago activo",
    timestamp: new Date().toISOString(),
  });
}
