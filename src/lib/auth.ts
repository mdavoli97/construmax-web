import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin-session";

export function verifyAdminToken(request: NextRequest): boolean {
  return requireAdmin(request);
}

export function isAdmin(request: NextRequest): boolean {
  return requireAdmin(request);
}

export function requireAuth(handler: (...args: unknown[]) => unknown) {
  return async (request: NextRequest, context: Record<string, unknown>) => {
    if (!verifyAdminToken(request)) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    return handler(request, context);
  };
}

// Función para validar datos de entrada
export function validateProductData(data: Record<string, unknown>) {
  const errors: string[] = [];

  if (!data.name || typeof data.name !== "string") {
    errors.push("El nombre es requerido");
  }

  if (!data.price || typeof data.price !== "number" || data.price <= 0) {
    errors.push("El precio debe ser un número mayor a 0");
  }

  if (!data.category || typeof data.category !== "string") {
    errors.push("La categoría es requerida");
  }

  if (!data.stock || typeof data.stock !== "number" || data.stock < 0) {
    errors.push("El stock debe ser un número mayor o igual a 0");
  }

  if (!data.unit || typeof data.unit !== "string") {
    errors.push("La unidad es requerida");
  }

  if (!data.sku || typeof data.sku !== "string") {
    errors.push("El SKU es requerido");
  }

  return errors;
}
