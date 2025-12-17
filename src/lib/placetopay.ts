import crypto from "crypto";
import type {
  PlaceToPayAuth,
  PlaceToPayCreateSessionRequest,
  PlaceToPayCreateSessionResponse,
  PlaceToPaySessionInfo,
} from "@/types";

const PLACETOPAY_LOGIN = process.env.PLACETOPAY_LOGIN || "";
const PLACETOPAY_SECRET_KEY = process.env.PLACETOPAY_SECRET_KEY || "";
const PLACETOPAY_BASE_URL =
  process.env.PLACETOPAY_BASE_URL || "https://checkout-test.placetopay.com/api";

/**
 * Genera la autenticación requerida por PlaceToPay
 * Formula: tranKey = Base64(SHA-256(nonce + seed + secretKey))
 */
export function generateAuth(): PlaceToPayAuth {
  const seed = new Date().toISOString();
  const nonce = Math.random().toString(36).substring(2, 15);

  // Crear el hash SHA-256
  const hash = crypto
    .createHash("sha256")
    .update(nonce + seed + PLACETOPAY_SECRET_KEY)
    .digest();

  // Codificar en base64
  const tranKey = hash.toString("base64");
  const nonceBase64 = Buffer.from(nonce).toString("base64");

  return {
    login: PLACETOPAY_LOGIN,
    tranKey,
    nonce: nonceBase64,
    seed,
  };
}

/**
 * Crea una sesión de pago en PlaceToPay
 */
export async function createPaymentSession(
  reference: string,
  description: string,
  amount: number,
  currency: "USD" | "UYU",
  buyer?: {
    name: string;
    surname: string;
    email: string;
    mobile?: string;
  },
  ipAddress?: string,
  userAgent?: string
): Promise<PlaceToPayCreateSessionResponse> {
  const auth = generateAuth();

  // Expiración de la sesión: 1 hora desde ahora
  const expiration = new Date();
  expiration.setHours(expiration.getHours() + 1);

  const requestBody: PlaceToPayCreateSessionRequest = {
    auth,
    payment: {
      reference,
      description,
      amount: {
        currency,
        total: amount,
      },
    },
    expiration: expiration.toISOString(),
    returnUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/return`,
    ipAddress: ipAddress || "127.0.0.1",
    userAgent: userAgent || "Mozilla/5.0",
  };

  if (buyer) {
    requestBody.buyer = buyer;
  }

  const response = await fetch(`${PLACETOPAY_BASE_URL}/session`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    throw new Error(
      `PlaceToPay API error: ${response.status} ${response.statusText}`
    );
  }

  const data: PlaceToPayCreateSessionResponse = await response.json();

  if (data.status.status !== "OK") {
    throw new Error(`PlaceToPay error: ${data.status.message}`);
  }

  return data;
}

/**
 * Consulta el estado de una sesión de pago
 */
export async function getSessionInfo(
  requestId: number
): Promise<PlaceToPaySessionInfo> {
  const auth = generateAuth();

  const response = await fetch(`${PLACETOPAY_BASE_URL}/session/${requestId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ auth }),
  });

  if (!response.ok) {
    throw new Error(
      `PlaceToPay API error: ${response.status} ${response.statusText}`
    );
  }

  const data: PlaceToPaySessionInfo = await response.json();
  return data;
}

/**
 * Verifica si un pago fue aprobado
 */
export function isPaymentApproved(sessionInfo: PlaceToPaySessionInfo): boolean {
  return !!(
    sessionInfo.status.status === "APPROVED" &&
    sessionInfo.payment &&
    sessionInfo.payment.length > 0 &&
    sessionInfo.payment[0].status.status === "APPROVED"
  );
}

/**
 * Obtiene la referencia interna de PlaceToPay si el pago fue aprobado
 */
export function getPaymentReference(
  sessionInfo: PlaceToPaySessionInfo
): string | null {
  if (isPaymentApproved(sessionInfo) && sessionInfo.payment) {
    return sessionInfo.payment[0].authorization || null;
  }
  return null;
}
