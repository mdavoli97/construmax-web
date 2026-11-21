import { NextRequest, NextResponse } from "next/server";
import { signAdminToken } from "@/lib/admin-session";

// Credenciales de admin (solo en el servidor)
const ADMIN_CREDENTIALS = {
  username: process.env.ADMIN_USERNAME || "",
  password: process.env.ADMIN_PASSWORD || "",
};

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    // Verificar credenciales
    if (
      username === ADMIN_CREDENTIALS.username &&
      password === ADMIN_CREDENTIALS.password &&
      ADMIN_CREDENTIALS.username && // Asegurar que no esté vacío
      ADMIN_CREDENTIALS.password // Asegurar que no esté vacío
    ) {
      const token = signAdminToken(username);

      return NextResponse.json({
        success: true,
        token,
      });
    }

    return NextResponse.json(
      { success: false, error: "Credenciales inválidas" },
      { status: 401 }
    );
  } catch (error) {
    console.error("Error in admin auth:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
