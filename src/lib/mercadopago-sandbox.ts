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
    const url = preference.sandbox_init_point || preference.init_point || "";
    // Defensa: si por algún motivo vino el init_point de producción, forzar host sandbox
    if (url.includes("www.mercadopago.") && !url.includes("sandbox.")) {
      return url.replace(
        "://www.mercadopago.",
        "://sandbox.mercadopago."
      );
    }
    return url;
  }
  return preference.init_point || preference.sandbox_init_point || "";
}
