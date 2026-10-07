import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const CONTACT_TO =
  process.env.CONTACT_TO_EMAIL ||
  process.env.ADMIN_EMAIL ||
  "curlamsas@gmail.com.uy";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim();
    const phone = String(body.phone || "").trim();
    const message = String(body.message || "").trim();

    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, error: "Nombre, email y mensaje son obligatorios" },
        { status: 400 }
      );
    }

    if (!resend) {
      return NextResponse.json(
        {
          success: false,
          error: "Servicio de email no configurado",
          fallback: "whatsapp",
        },
        { status: 503 }
      );
    }

    await resend.emails.send({
      from:
        process.env.RESEND_FROM_EMAIL || "Construmax <onboarding@resend.dev>",
      to: CONTACT_TO,
      replyTo: email,
      subject: `Contacto web: ${name}`,
      text: [
        `Nombre: ${name}`,
        `Email: ${email}`,
        phone ? `Teléfono: ${phone}` : null,
        "",
        "Mensaje:",
        message,
      ]
        .filter(Boolean)
        .join("\n"),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending contact email:", error);
    return NextResponse.json(
      { success: false, error: "No se pudo enviar el mensaje" },
      { status: 500 }
    );
  }
}
