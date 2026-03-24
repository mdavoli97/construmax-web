import { MercadoPagoConfig, Preference, Payment } from "mercadopago";

// Configuración del cliente de MercadoPago
// Usa las credenciales de prueba para desarrollo
const MERCADOPAGO_ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN || "";
const MERCADOPAGO_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY || "";

// Verificar que las credenciales estén configuradas
if (!MERCADOPAGO_ACCESS_TOKEN) {
  console.warn("⚠️ MERCADOPAGO_ACCESS_TOKEN no está configurado");
}

// Inicializar el cliente de MercadoPago
const client = new MercadoPagoConfig({
  accessToken: MERCADOPAGO_ACCESS_TOKEN,
  options: {
    timeout: 5000,
  },
});

// Instancia de Preference para crear preferencias de pago
const preferenceClient = new Preference(client);

// Instancia de Payment para consultar pagos
const paymentClient = new Payment(client);

export interface MercadoPagoItem {
  id: string;
  title: string;
  description?: string;
  picture_url?: string;
  category_id?: string;
  quantity: number;
  currency_id: string;
  unit_price: number;
}

export interface MercadoPagoPayer {
  name: string;
  surname: string;
  email: string;
  phone?: {
    area_code: string;
    number: string;
  };
  identification?: {
    type: string;
    number: string;
  };
  address?: {
    street_name: string;
    street_number: string; // MercadoPago SDK espera string
    zip_code: string;
  };
}

export interface CreatePreferenceParams {
  items: MercadoPagoItem[];
  payer?: MercadoPagoPayer;
  external_reference?: string;
  notification_url?: string;
  back_urls?: {
    success: string;
    failure: string;
    pending: string;
  };
  auto_return?: "approved" | "all";
  statement_descriptor?: string;
  expires?: boolean;
  expiration_date_from?: string;
  expiration_date_to?: string;
}

export interface PreferenceResponse {
  id: string;
  init_point: string;
  sandbox_init_point: string;
  external_reference?: string;
}

/**
 * Crea una preferencia de pago en MercadoPago
 */
export async function createPreference(
  params: CreatePreferenceParams,
): Promise<PreferenceResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const isLocalhost =
    baseUrl.includes("localhost") || baseUrl.includes("127.0.0.1");

  // Construir el objeto de preferencia compatible con el SDK
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const preferenceData: any = {
    items: params.items.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      picture_url: item.picture_url,
      category_id: item.category_id,
      quantity: item.quantity,
      currency_id: item.currency_id,
      unit_price: item.unit_price,
    })),
    external_reference: params.external_reference,
    statement_descriptor: params.statement_descriptor || "CONSTRUMAX",
  };

  // Siempre agregar back_urls para que MercadoPago muestre el botón "Volver al sitio"
  // En localhost el auto_return no funciona, pero el usuario puede clickear manualmente
  preferenceData.back_urls = params.back_urls || {
    success: `${baseUrl}/checkout/return?status=approved`,
    failure: `${baseUrl}/checkout/return?status=rejected`,
    pending: `${baseUrl}/checkout/return?status=pending`,
  };

  // auto_return solo funciona con URLs públicas (no localhost)
  if (!isLocalhost) {
    preferenceData.auto_return = params.auto_return || "approved";
    preferenceData.notification_url =
      params.notification_url || `${baseUrl}/api/mercadopago/webhook`;
  }

  // Agregar payer solo si está definido
  if (params.payer) {
    preferenceData.payer = {
      name: params.payer.name,
      surname: params.payer.surname,
      email: params.payer.email,
      phone: params.payer.phone,
      identification: params.payer.identification,
    };
  }

  // Agregar fechas de expiración solo si están definidas
  if (params.expires !== undefined) {
    preferenceData.expires = params.expires;
  }
  if (params.expiration_date_from) {
    preferenceData.expiration_date_from = params.expiration_date_from;
  }
  if (params.expiration_date_to) {
    preferenceData.expiration_date_to = params.expiration_date_to;
  }

  try {
    console.log(
      "📤 Enviando preferencia a MercadoPago:",
      JSON.stringify(preferenceData, null, 2),
    );
    const response = await preferenceClient.create({ body: preferenceData });
    console.log(
      "📥 Respuesta de MercadoPago:",
      JSON.stringify(response, null, 2),
    );

    if (!response.id || !response.init_point) {
      throw new Error("Respuesta inválida de MercadoPago");
    }

    return {
      id: response.id,
      init_point: response.init_point,
      sandbox_init_point: response.sandbox_init_point || response.init_point,
      external_reference: response.external_reference,
    };
  } catch (error) {
    console.error("Error creando preferencia de MercadoPago:", error);
    throw error;
  }
}

/**
 * Obtiene información de un pago por su ID
 */
export async function getPaymentInfo(paymentId: string | number) {
  try {
    const response = await paymentClient.get({ id: String(paymentId) });
    return response;
  } catch (error) {
    console.error("Error obteniendo información del pago:", error);
    throw error;
  }
}

/**
 * Verifica si un pago fue aprobado
 */
export function isPaymentApproved(payment: any): boolean {
  return payment?.status === "approved";
}

/**
 * Verifica si un pago está pendiente
 */
export function isPaymentPending(payment: any): boolean {
  return payment?.status === "pending" || payment?.status === "in_process";
}

/**
 * Verifica si un pago fue rechazado
 */
export function isPaymentRejected(payment: any): boolean {
  return payment?.status === "rejected" || payment?.status === "cancelled";
}

/**
 * Mapea el status de MercadoPago a un status interno
 */
export function mapPaymentStatus(
  mpStatus: string,
): "approved" | "pending" | "rejected" {
  switch (mpStatus) {
    case "approved":
      return "approved";
    case "pending":
    case "in_process":
    case "authorized":
      return "pending";
    case "rejected":
    case "cancelled":
    case "refunded":
    case "charged_back":
    default:
      return "rejected";
  }
}

/**
 * Obtiene la descripción del status de pago
 */
export function getPaymentStatusDescription(status: string): string {
  const descriptions: Record<string, string> = {
    approved: "Pago aprobado",
    pending: "Pago pendiente",
    in_process: "Pago en proceso",
    rejected: "Pago rechazado",
    cancelled: "Pago cancelado",
    refunded: "Pago reembolsado",
    charged_back: "Contracargo realizado",
    authorized: "Pago autorizado",
  };

  return descriptions[status] || "Estado desconocido";
}

// Exportar la public key para uso en el frontend
export const MERCADOPAGO_PUBLIC_KEY_CLIENT = MERCADOPAGO_PUBLIC_KEY;

export { client as mercadoPagoClient };
