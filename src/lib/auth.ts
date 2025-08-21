import { NextRequest } from "next/server";

// Función para verificar el token de autenticación
export function verifyAdminToken(request: NextRequest): boolean {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return false;
    }

    const token = authHeader.substring(7);
    const tokenData = JSON.parse(atob(token));
    const now = Date.now();

    // Verificar que el token no haya expirado
    if (tokenData.exp <= now) {
      return false;
    }

    // Verificar que sea un token de admin
    return tokenData.role === "admin";
  } catch (error) {
    return false;
  }
}

// Función simple para verificar si es admin (para desarrollo)
export function isAdmin(request: NextRequest): boolean {
  // Para desarrollo, permitimos acceso sin token
  // En producción, usar verifyAdminToken
  return true; // Cambiar a verifyAdminToken(request) en producción
}

// Middleware de autenticación para rutas de admin
export function requireAuth(handler: Function) {
  return async (request: NextRequest, context: any) => {
    // Por ahora permitimos acceso sin autenticación para desarrollo
    // En producción, descomenta las siguientes líneas:
    /*
    if (!verifyAdminToken(request)) {
      return new Response(
        JSON.stringify({ error: 'No autorizado' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }
    */

    return handler(request, context);
  };
}

// Función para validar datos de entrada
export function validateProductData(data: any) {
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
