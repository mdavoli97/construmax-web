import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import OrderConfirmationEmail from "../../../../emails/OrderConfirmation";

const resend = new Resend(process.env.RESEND_API_KEY);

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  total: number;
}

interface SendOrderEmailRequest {
  orderNumber: string;
  orderDate: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  items: OrderItem[];
  subtotal: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  deliveryAddress?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: SendOrderEmailRequest = await request.json();

    const {
      orderNumber,
      orderDate,
      customerName,
      customerEmail,
      customerPhone,
      items,
      subtotal,
      total,
      paymentMethod,
      paymentStatus,
      deliveryAddress,
    } = body;

    // Generar texto plano para mejor deliverability
    const plainTextContent = `
Hola ${customerName},

¡Gracias por tu pedido en Construmax!

DETALLES DEL PEDIDO
-------------------
Número de Orden: ${orderNumber}
Fecha: ${orderDate}
Estado de Pago: ${paymentStatus}
Método de Pago: ${paymentMethod}

PRODUCTOS
---------
${items.map((item) => `${item.name} - Cantidad: ${item.quantity} - $${item.total.toLocaleString("es-UY")}`).join("\n")}

RESUMEN
-------
Subtotal: $${subtotal.toLocaleString("es-UY")}
Total: $${total.toLocaleString("es-UY")}

${deliveryAddress ? `Dirección de Entrega: ${deliveryAddress}` : "Retiro en local"}

Si tienes alguna pregunta sobre tu pedido, no dudes en contactarnos.

Saludos,
Equipo Construmax
    `.trim();

    // Email para el cliente
    const customerEmailResponse = await resend.emails.send({
      from:
        process.env.RESEND_FROM_EMAIL || "Construmax <onboarding@resend.dev>",
      to: customerEmail,
      replyTo: process.env.ADMIN_EMAILS?.split(",")[0] || customerEmail,
      subject: `✅ Tu pedido #${orderNumber} ha sido recibido - Construmax`,
      text: plainTextContent,
      react: OrderConfirmationEmail({
        orderNumber,
        orderDate,
        customerName,
        customerEmail,
        customerPhone,
        items,
        subtotal,
        total,
        paymentMethod,
        paymentStatus,
        deliveryAddress,
      }),
      headers: {
        "X-Entity-Ref-ID": orderNumber,
      },
    });

    // NOTA: Delay de 100ms entre emails para evitar que Resend detecte duplicados
    // cuando el email del cliente y admin son el mismo (solo pasa en desarrollo/testing)
    // En producción esto no afecta ya que serán emails diferentes
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Email para administradores
    const adminEmails = process.env.ADMIN_EMAILS?.split(",") || [];

    let adminEmailResponse;
    if (adminEmails.length > 0) {
      const adminPlainText = `
NUEVA ORDEN RECIBIDA
====================

Número de Orden: ${orderNumber}
Fecha: ${orderDate}
Cliente: ${customerName}
Email: ${customerEmail}
Teléfono: ${customerPhone || "No proporcionado"}

MÉTODO DE PAGO
--------------
${paymentMethod}
Estado: ${paymentStatus}

PRODUCTOS
---------
${items.map((item) => `• ${item.name} - Cantidad: ${item.quantity} - $${item.total.toLocaleString("es-UY")}`).join("\n")}

TOTALES
-------
Subtotal: $${subtotal.toLocaleString("es-UY")}
Total: $${total.toLocaleString("es-UY")}

ENTREGA
-------
${deliveryAddress || "Retiro en local"}

---
Este es un email automático de notificación de orden.
      `.trim();

      adminEmailResponse = await resend.emails.send({
        from:
          process.env.RESEND_FROM_EMAIL || "Construmax <onboarding@resend.dev>",
        to: adminEmails,
        replyTo: customerEmail,
        subject: `🔔 [ADMIN] Nueva Orden #${orderNumber} de ${customerName}`,
        text: adminPlainText,
        react: OrderConfirmationEmail({
          orderNumber,
          orderDate,
          customerName,
          customerEmail,
          customerPhone,
          items,
          subtotal,
          total,
          paymentMethod,
          paymentStatus,
          deliveryAddress,
        }),
        headers: {
          "X-Entity-Ref-ID": `admin-${orderNumber}`,
        },
      });
    }

    console.log("📧 Email Results:", {
      customerEmail: customerEmail,
      customerEmailId: customerEmailResponse.data?.id,
      customerEmailError: customerEmailResponse.error,
      adminEmailId: adminEmailResponse?.data?.id,
      adminEmailError: adminEmailResponse?.error,
    });

    return NextResponse.json({
      success: true,
      customerEmailId: customerEmailResponse.data?.id,
      adminEmailId: adminEmailResponse?.data?.id,
      customerEmail: customerEmail,
      adminEmails: adminEmails,
      sentAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error sending order emails:", error);
    return NextResponse.json(
      { error: "Error sending emails", details: error },
      { status: 500 }
    );
  }
}
