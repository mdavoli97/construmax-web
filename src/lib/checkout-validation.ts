import { z } from "zod";

export type DocumentType = "cedula" | "dni" | "rut";
export type DeliveryMethod = "pickup" | "delivery";
export type PreferredTime = "8-12" | "12-18" | "after-18";

const onlyDigits = (value: string) => value.replace(/\D/g, "");

/** Solo dígitos (útil para enviar a Mercado Pago / APIs). */
export function normalizePhoneDigits(value: string): string {
  return onlyDigits(value);
}

/** Teléfono internacional: 8–15 dígitos, con o sin + / espacios / guiones. */
const phoneSchema = z
  .string()
  .trim()
  .min(1, "El teléfono es obligatorio")
  .refine((value) => {
    const digits = onlyDigits(value);
    return digits.length >= 8 && digits.length <= 15;
  }, "Ingresá un teléfono válido (8 a 15 dígitos, con o sin código de país)");

const nameSchema = z
  .string()
  .trim()
  .min(2, "Ingresá al menos 2 caracteres")
  .max(120, "Máximo 120 caracteres")
  .refine(
    (value) => /[\p{L}]/u.test(value),
    "El nombre debe incluir al menos una letra"
  );

const emailSchema = z
  .string()
  .trim()
  .min(1, "El email es obligatorio")
  .email("Ingresá un email válido")
  .max(254, "Email demasiado largo");

function validateDocumentNumber(
  documentType: DocumentType,
  documentNumber: string
): string | null {
  const raw = documentNumber.trim();
  if (!raw) return "El documento es obligatorio";

  const digits = onlyDigits(raw);

  if (documentType === "cedula") {
    // CI uruguaya: 7 u 8 dígitos
    if (!/^\d{7,8}$/.test(digits)) {
      return "Cédula inválida (7 u 8 dígitos)";
    }
    return null;
  }

  if (documentType === "dni") {
    if (!/^\d{7,10}$/.test(digits)) {
      return "DNI inválido (7 a 10 dígitos)";
    }
    return null;
  }

  // RUT Uruguay: 12 dígitos (sin formato) o con puntos/guión
  if (!/^\d{12}$/.test(digits)) {
    return "RUT inválido (12 dígitos, ej: 210000000012)";
  }
  return null;
}

export const customerCheckoutSchema = z
  .object({
    name: nameSchema,
    documentType: z.enum(["cedula", "dni", "rut"]),
    documentNumber: z.string().trim(),
    email: emailSchema,
    phone: phoneSchema,
    address: z.string().trim(),
    city: z.string().trim(),
    documentRequired: z.boolean(),
  })
  .superRefine((data, ctx) => {
    const hasDocument = data.documentNumber.length > 0;
    const mustValidateDocument = data.documentRequired || hasDocument;

    if (mustValidateDocument) {
      if (data.documentRequired && !hasDocument) {
        ctx.addIssue({
          code: "custom",
          path: ["documentNumber"],
          message: "El documento es obligatorio para este monto",
        });
      } else if (hasDocument) {
        const docError = validateDocumentNumber(
          data.documentType,
          data.documentNumber
        );
        if (docError) {
          ctx.addIssue({
            code: "custom",
            path: ["documentNumber"],
            message: docError,
          });
        }
      }
    }

    if (data.documentType === "rut") {
      if (data.address.trim().length < 5) {
        ctx.addIssue({
          code: "custom",
          path: ["address"],
          message: "Ingresá una dirección válida",
        });
      }
      if (data.city.trim().length < 2) {
        ctx.addIssue({
          code: "custom",
          path: ["city"],
          message: "Ingresá una ciudad válida",
        });
      }
    }
  });

export const shippingCheckoutSchema = z
  .object({
    deliveryDate: z.string().trim().min(1, "Seleccioná una fecha de entrega"),
    deliveryMethod: z.enum(["pickup", "delivery"]),
    deliveryAddress: z.string().trim(),
    contactPhone: z.string().trim(),
    preferredTime: z.enum(["8-12", "12-18", "after-18"]),
    observations: z
      .string()
      .trim()
      .max(500, "Máximo 500 caracteres")
      .optional()
      .or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    if (data.deliveryMethod !== "delivery") return;

    if (data.deliveryAddress.trim().length < 5) {
      ctx.addIssue({
        code: "custom",
        path: ["deliveryAddress"],
        message: "Ingresá la dirección de entrega",
      });
    }

    const phoneResult = phoneSchema.safeParse(data.contactPhone);
    if (!phoneResult.success) {
      ctx.addIssue({
        code: "custom",
        path: ["contactPhone"],
        message:
          phoneResult.error.issues[0]?.message ||
          "Teléfono de contacto inválido",
      });
    }
  });

export type CustomerCheckoutInput = z.infer<typeof customerCheckoutSchema>;
export type ShippingCheckoutInput = z.infer<typeof shippingCheckoutSchema>;

export type FieldErrors = Record<string, string>;

export function zodErrorsToFieldMap(
  error: z.ZodError
): FieldErrors {
  const map: FieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !map[key]) {
      map[key] = issue.message;
    }
  }
  return map;
}

export function validateCustomerCheckout(
  data: Omit<CustomerCheckoutInput, never>
): { ok: true; data: CustomerCheckoutInput } | { ok: false; errors: FieldErrors } {
  const parsed = customerCheckoutSchema.safeParse(data);
  if (parsed.success) return { ok: true, data: parsed.data };
  return { ok: false, errors: zodErrorsToFieldMap(parsed.error) };
}

export function validateShippingCheckout(
  data: ShippingCheckoutInput
): { ok: true; data: ShippingCheckoutInput } | { ok: false; errors: FieldErrors } {
  const parsed = shippingCheckoutSchema.safeParse(data);
  if (parsed.success) return { ok: true, data: parsed.data };
  return { ok: false, errors: zodErrorsToFieldMap(parsed.error) };
}

export function inputClassName(hasError: boolean, extra = ""): string {
  const base =
    "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent";
  const state = hasError
    ? "border-red-500 focus:ring-red-500"
    : "border-gray-300 focus:ring-orange-500";
  return `${base} ${state} ${extra}`.trim();
}
