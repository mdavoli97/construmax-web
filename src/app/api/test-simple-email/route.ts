import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { to } = await request.json();

    console.log("🧪 Testing simple email send...");
    console.log("API Key configured:", !!process.env.RESEND_API_KEY);
    console.log("API Key prefix:", process.env.RESEND_API_KEY?.substring(0, 8));
    console.log("To:", to);

    // Email simple sin componente React
    const result = await resend.emails.send({
      from: "Construmax <onboarding@resend.dev>",
      to: to || "curlamsas@gmail.com",
      subject: "Test Email - Construmax",
      html: "<h1>Hola!</h1><p>Este es un email de prueba desde Construmax.</p>",
      text: "Hola! Este es un email de prueba desde Construmax.",
    });

    console.log("📧 Resend Response:", result);

    return NextResponse.json({
      success: true,
      emailId: result.data?.id,
      error: result.error,
      fullResponse: result,
    });
  } catch (error: any) {
    console.error("❌ Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        details: error,
      },
      { status: 500 }
    );
  }
}
