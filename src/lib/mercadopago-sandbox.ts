/**
 * Modo prueba de Mercado Pago.
 *
 * Credenciales nuevas (Access Token de prueba `APP_USR-…`): usar `init_point`.
 * Credenciales legacy (`TEST-…`): aún usan `sandbox_init_point`.
 *
 * MP deprecó `sandbox_init_point` para Checkout Pro; el flujo oficial
 * es Credenciales de prueba + `init_point` + Comprador TESTUSER.
 */
export function isMercadoPagoTestMode(): boolean {
  const flag =
    process.env.MERCADOPAGO_TEST_MODE ?? process.env.MERCADOPAGO_USE_SANDBOX;
  if (flag === "true" || flag === "1") return true;
  if (flag === "false" || flag === "0") return false;

  const token = process.env.MERCADOPAGO_ACCESS_TOKEN || "";
  return token.startsWith("TEST-");
}

/** @deprecated Prefer isMercadoPagoTestMode(); kept for callers that meant "test env". */
export function shouldUseMercadoPagoSandbox(): boolean {
  return shouldUseSandboxCheckoutUrl();
}

/**
 * Solo las credenciales legacy `TEST-` deben ir a sandbox.*.
 * Forzá con MERCADOPAGO_USE_SANDBOX=true/false.
 */
export function shouldUseSandboxCheckoutUrl(): boolean {
  const flag = process.env.MERCADOPAGO_USE_SANDBOX;
  if (flag === "true" || flag === "1") return true;
  if (flag === "false" || flag === "0") return false;

  const token = process.env.MERCADOPAGO_ACCESS_TOKEN || "";
  return token.startsWith("TEST-");
}

export function resolveMercadoPagoCheckoutUrl(preference: {
  init_point?: string | null;
  sandbox_init_point?: string | null;
}): string {
  if (shouldUseSandboxCheckoutUrl()) {
    const url = preference.sandbox_init_point || preference.init_point || "";
    if (url.includes("www.mercadopago.") && !url.includes("sandbox.")) {
      return url.replace("://www.mercadopago.", "://sandbox.mercadopago.");
    }
    return url;
  }
  return preference.init_point || preference.sandbox_init_point || "";
}
