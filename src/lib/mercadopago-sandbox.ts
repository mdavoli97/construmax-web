/**
 * Indica si debemos usar el checkout sandbox de Mercado Pago.
 * - MERCADOPAGO_USE_SANDBOX=true fuerza sandbox (recomendado al probar en producción)
 * - Tokens que empiezan con TEST- también usan sandbox
 */
export function shouldUseMercadoPagoSandbox(): boolean {
  const flag = process.env.MERCADOPAGO_USE_SANDBOX;
  if (flag === "true" || flag === "1") {
    return true;
  }

  const token = process.env.MERCADOPAGO_ACCESS_TOKEN || "";
  return token.startsWith("TEST-");
}

export function resolveMercadoPagoCheckoutUrl(preference: {
  init_point?: string | null;
  sandbox_init_point?: string | null;
}): string {
  const useSandbox = shouldUseMercadoPagoSandbox();
  if (useSandbox) {
    return (
      preference.sandbox_init_point ||
      preference.init_point ||
      ""
    );
  }
  return preference.init_point || preference.sandbox_init_point || "";
}
