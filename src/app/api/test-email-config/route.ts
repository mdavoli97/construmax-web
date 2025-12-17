import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const diagnostics = {
    resendConfigured: !!process.env.RESEND_API_KEY,
    resendKeyPrefix: process.env.RESEND_API_KEY?.substring(0, 8),
    fromEmailConfigured: !!process.env.RESEND_FROM_EMAIL,
    fromEmail: process.env.RESEND_FROM_EMAIL,
    adminEmailsConfigured: !!process.env.ADMIN_EMAILS,
    adminEmails: process.env.ADMIN_EMAILS?.split(",").length || 0,
  };

  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    diagnostics,
  });
}
