import { Resend } from "resend";
import { getStatusLabel } from "@/lib/order-fulfillment";

type OrderNotice = {
  id: number | string;
  customer_name?: string | null;
  customer_email?: string | null;
  customer_phone?: string | null;
  delivery_method?: string | null;
};

function whatsappPhone(raw: string) {
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("0")) digits = digits.slice(1);
  if (digits.length <= 9) digits = `598${digits}`;
  return digits;
}

export async function notifyOrderStatusChange(
  order: OrderNotice,
  status: string
) {
  const label = getStatusLabel(status, order.delivery_method || "delivery");
  const text = `Hola ${order.customer_name || ""}. Tu pedido #${order.id} en ConstruMax ahora está: ${label}.`;
  const phone = order.customer_phone ? whatsappPhone(order.customer_phone) : "";
  const whatsappUrl = phone
    ? `https://wa.me/${phone}?text=${encodeURIComponent(text)}`
    : null;

  let emailSent = false;
  if (process.env.RESEND_API_KEY && order.customer_email) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from:
          process.env.RESEND_FROM_EMAIL ||
          "ConstruMax <onboarding@resend.dev>",
        to: order.customer_email,
        subject: `Pedido #${order.id}: ${label}`,
        text,
      });
      emailSent = true;
    } catch (error) {
      console.error("No se pudo avisar el cambio de estado por email:", error);
    }
  }

  return { emailSent, whatsappUrl, label };
}
