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

    // Crear políticas para permitir operaciones admin en productos
    const policies = [
      // Política para INSERT en productos (permitir a todos por ahora para admin)
      `CREATE POLICY IF NOT EXISTS "Admin puede insertar productos" ON products
       FOR INSERT WITH CHECK (true);`,

      // Política para UPDATE en productos
      `CREATE POLICY IF NOT EXISTS "Admin puede actualizar productos" ON products
       FOR UPDATE USING (true);`,

      // Política para DELETE en productos
      `CREATE POLICY IF NOT EXISTS "Admin puede eliminar productos" ON products
       FOR DELETE USING (true);`,

      // Políticas para categorías
      `CREATE POLICY IF NOT EXISTS "Admin puede insertar categorías" ON categories
       FOR INSERT WITH CHECK (true);`,

      `CREATE POLICY IF NOT EXISTS "Admin puede actualizar categorías" ON categories
       FOR UPDATE USING (true);`,

      `CREATE POLICY IF NOT EXISTS "Admin puede eliminar categorías" ON categories
       FOR DELETE USING (true);`,
    ];

    const results = [];

    for (const policy of policies) {
      try {
        const { data, error } = await adminClient.rpc("exec_sql", {
          sql: policy,
        });
        if (error) {
          console.error(`Error creando política: ${policy}`, error);
          results.push({ policy, error: error.message });
        } else {
          results.push({ policy, success: true });
        }
      } catch (err) {
        console.error(`Error ejecutando: ${policy}`, err);
        results.push({
          policy,
          error: err instanceof Error ? err.message : "Error desconocido",
        });
      }
    }

    return NextResponse.json({
      message: "Políticas RLS configuradas",
      results,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Error configurando políticas RLS",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Endpoint para configurar políticas RLS. Usar método POST.",
  });
}
