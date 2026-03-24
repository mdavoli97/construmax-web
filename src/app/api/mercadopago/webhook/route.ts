import { NextRequest, NextResponse } from "next/server";
import {
  getPaymentInfo,
  mapPaymentStatus,
  getPaymentStatusDescription,
} from "@/lib/mercadopago";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

// Cliente de Supabase con service role para operaciones admin
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "",
);

/**
 * Verifica la firma del webhook de MercadoPago
 * Documentación: https://www.mercadopago.com.ar/developers/es/docs/your-integrations/notifications/webhooks#verificarsufirma
 */
function verifyWebhookSignature(
  xSignature: string | null,
  xRequestId: string | null,
  dataId: string,
): boolean {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;

  // Si no hay secret configurado, permitir (con warning en logs)
  if (!secret) {
    console.warn(
      "⚠️ MERCADOPAGO_WEBHOOK_SECRET no configurado - se omite verificación de firma",
    );
    return true;
  }

  if (!xSignature || !xRequestId) {
    console.error("❌ Faltan headers x-signature o x-request-id");
    return false;
  }

  // Parsear x-signature: "ts=xxx,v1=xxx"
  const parts = xSignature.split(",");
  let ts = "";
  let hash = "";

  for (const part of parts) {
    const [key, value] = part.split("=");
    if (key === "ts") ts = value;
    if (key === "v1") hash = value;
  }

  if (!ts || !hash) {
    console.error("❌ Formato de x-signature inválido");
    return false;
  }

  // Construir el manifest para verificar
  // Formato: id:[data.id];request-id:[x-request-id];ts:[ts];
  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;

  // Calcular HMAC-SHA256
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(manifest);
  const calculatedHash = hmac.digest("hex");

  const isValid = calculatedHash === hash;

  if (!isValid) {
    console.error("❌ Firma del webhook inválida");
    console.error("  Expected:", hash);
    console.error("  Calculated:", calculatedHash);
  }

  return isValid;
}

/**
 * Webhook para recibir notificaciones de MercadoPago
 *
 * MercadoPago envía notificaciones cuando:
 * - Se crea un pago
 * - Se actualiza el estado de un pago
 * - Se realiza un reembolso
 * - Etc.
 *
 * Documentación: https://www.mercadopago.com.ar/developers/es/docs/checkout-pro/additional-content/notifications/webhooks
 */
export async function POST(request: NextRequest) {
  try {
    // Obtener headers para verificación
    const xSignature = request.headers.get("x-signature");
    const xRequestId = request.headers.get("x-request-id");

    const body = await request.json();

    console.log(
      "📩 Webhook de MercadoPago recibido:",
      JSON.stringify(body, null, 2),
    );
    console.log("Headers - x-signature:", xSignature);
    console.log("Headers - x-request-id:", xRequestId);

    // MercadoPago envía diferentes tipos de notificaciones
    const { type, data, action } = body;

    // Verificar firma del webhook
    if (data?.id) {
      const isValidSignature = verifyWebhookSignature(
        xSignature,
        xRequestId,
        String(data.id),
      );

      if (!isValidSignature) {
        console.error("❌ Webhook rechazado: firma inválida");
        return NextResponse.json(
          { error: "Invalid signature" },
          { status: 401 },
        );
      }
      console.log("✅ Firma del webhook verificada correctamente");
    }

    // Verificar que sea una notificación de pago
    if (type === "payment" && data?.id) {
      const paymentId = data.id;

      console.log(`💳 Procesando pago ID: ${paymentId}`);

      try {
        // Obtener información del pago desde MercadoPago
        const paymentInfo = await getPaymentInfo(paymentId);

        console.log(
          "📄 Información del pago:",
          JSON.stringify(paymentInfo, null, 2),
        );

        const status = mapPaymentStatus(paymentInfo.status || "");
        const statusDescription = getPaymentStatusDescription(
          paymentInfo.status || "",
        );
        const externalReference = paymentInfo.external_reference;

        console.log(`📊 Status: ${status} (${statusDescription})`);
        console.log(`🔗 External Reference: ${externalReference}`);

        // Actualizar el estado de la orden en la base de datos
        if (externalReference) {
          const orderStatus =
            status === "approved"
              ? "paid"
              : status === "pending"
                ? "pending_payment"
                : "payment_failed";

          const { error: updateError } = await supabaseAdmin
            .from("orders")
            .update({
              status: orderStatus,
              payment_id: String(paymentId),
              payment_status: paymentInfo.status,
              payment_method_id: paymentInfo.payment_method_id,
              payment_type: paymentInfo.payment_type_id,
              updated_at: new Date().toISOString(),
            })
            .eq("external_reference", externalReference);

          if (updateError) {
            console.error("Error actualizando orden:", updateError);
          } else {
            console.log(
              `✅ Orden ${externalReference} actualizada a: ${orderStatus}`,
            );
          }

          // Si el pago fue aprobado, ejecutar acciones adicionales
          if (status === "approved") {
            console.log("✅ Pago aprobado - Ejecutando acciones post-pago");

            // TODO: Aquí puedes agregar más acciones:
            // - Enviar email de confirmación
            // - Actualizar stock
            // - Notificar al admin
          }
        }

        return NextResponse.json({
          received: true,
          paymentId,
          status,
          externalReference,
        });
      } catch (paymentError) {
        console.error("Error al obtener información del pago:", paymentError);
        // Aún así devolvemos 200 para que MercadoPago no reintente
        return NextResponse.json({
          received: true,
          error: "Error al procesar el pago, pero se recibió la notificación",
        });
      }
    }

    // Para notificaciones de tipo "merchant_order"
    if (type === "merchant_order") {
      console.log(`📦 Orden de comercio recibida: ${data?.id}`);
      // TODO: Procesar orden de comercio si es necesario
    }

    // Para notificaciones de tipo "chargebacks"
    if (type === "chargebacks") {
      console.log(`⚠️ Contracargo recibido: ${data?.id}`);
      // TODO: Procesar contracargo - esto es importante para gestión de fraudes
    }

    // Responder con 200 OK para confirmar recepción
    return NextResponse.json({ received: true, type, action });
  } catch (error) {
    console.error("Error en webhook de MercadoPago:", error);

    // Importante: Siempre devolver 200 para evitar reintentos infinitos
    // Los errores se logean pero se confirma la recepción
    return NextResponse.json({
      received: true,
      error: error instanceof Error ? error.message : "Error desconocido",
    });
  }
}

// GET para verificación del endpoint (MercadoPago puede hacer GET para verificar)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  // MercadoPago puede enviar un challenge para verificar el endpoint
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
