import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!serviceRoleKey) {
      return NextResponse.json(
        {
          error: "Service role key no configurado",
        },
        { status: 500 }
      );
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // Deshabilitar RLS temporalmente para desarrollo
    const commands = [
      "ALTER TABLE products DISABLE ROW LEVEL SECURITY;",
      "ALTER TABLE categories DISABLE ROW LEVEL SECURITY;",
    ];

    const results = [];

    for (const command of commands) {
      try {
        const { data, error } = await adminClient.rpc("exec_sql", {
          sql: command,
        });
        if (error) {
          console.error(`Error ejecutando: ${command}`, error);
          results.push({ command, error: error.message });
        } else {
          results.push({ command, success: true });
        }
      } catch (err) {
        console.error(`Error con comando: ${command}`, err);
        results.push({
          command,
          error: err instanceof Error ? err.message : "Error desconocido",
        });
      }
    }

    return NextResponse.json({
      message: "RLS deshabilitado para desarrollo",
      results,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Error deshabilitando RLS",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Endpoint para deshabilitar RLS. Usar método POST para ejecutar.",
  });
}
