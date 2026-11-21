import { createHmac, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

function sessionSecret() {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || "";
}

export function signAdminToken(username: string) {
  const secret = sessionSecret();
  if (!secret) {
    throw new Error("ADMIN_PASSWORD no configurada");
  }

  const payload = Buffer.from(
    JSON.stringify({
      username,
      role: "admin",
      exp: Date.now() + TOKEN_TTL_MS,
    })
  ).toString("base64url");
  const signature = createHmac("sha256", secret)
    .update(payload)
    .digest("base64url");
  return `${payload}.${signature}`;
}

export function verifyAdminTokenString(token: string): boolean {
  const secret = sessionSecret();
  if (!secret || !token) return false;

  const dot = token.indexOf(".");
  if (dot <= 0) return false;

  const payload = token.slice(0, dot);
  const signature = token.slice(dot + 1);
  const expected = createHmac("sha256", secret)
    .update(payload)
    .digest("base64url");

  const provided = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (
    provided.length !== expectedBuffer.length ||
    !timingSafeEqual(provided, expectedBuffer)
  ) {
    return false;
  }

  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString());
    return (
      data.role === "admin" &&
      typeof data.exp === "number" &&
      data.exp > Date.now()
    );
  } catch {
    return false;
  }
}

export function requireAdmin(request: NextRequest): boolean {
  const header = request.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  return verifyAdminTokenString(token);
}

export function adminUnauthorized() {
  return NextResponse.json(
    { success: false, error: "No autorizado" },
    { status: 401 }
  );
}

export function productionDisabled() {
  return NextResponse.json({ error: "No encontrado" }, { status: 404 });
}
