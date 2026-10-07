import { NextResponse } from "next/server";

/**
 * Bloquea rutas de debug/test de Mercado Pago en producción
 * (salvo MERCADOPAGO_ALLOW_DEBUG=true).
 */
export function blockMercadoPagoDevRoutesInProduction(): NextResponse | null {
  const allowDebug =
    process.env.MERCADOPAGO_ALLOW_DEBUG === "true" ||
    process.env.MERCADOPAGO_ALLOW_DEBUG === "1";

  if (process.env.NODE_ENV === "production" && !allowDebug) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return null;
}
