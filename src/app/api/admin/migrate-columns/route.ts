import { NextRequest, NextResponse } from "next/server";

// API endpoint temporal para añadir columnas size y thickness
// USAR SOLO EN DESARROLLO - ELIMINAR DESPUÉS DE LA MIGRACIÓN
export async function POST(request: NextRequest) {
  try {
    // Solo permitir en desarrollo
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "Esta API solo está disponible en desarrollo" },
        { status: 403 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!serviceRoleKey) {
      return NextResponse.json(
        { error: "Service role key no configurado" },
        { status: 500 }
      );
    }

    const { createClient } = await import("@supabase/supabase-js");
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // Script SQL para añadir las columnas
    const migrationSQL = `
      -- Añadir columna thickness (espesor)
      ALTER TABLE products 
      ADD COLUMN IF NOT EXISTS thickness TEXT;

      -- Añadir columna size (tamaño)
      ALTER TABLE products 
      ADD COLUMN IF NOT EXISTS size TEXT;
    `;

    // Ejecutar la migración
    const { data, error } = await adminClient.rpc("exec_sql", {
      sql: migrationSQL,
    });

    if (error) {
      // Si no existe la función exec_sql, intentar con una query directa
      console.log(
        "Función exec_sql no encontrada, intentando método alternativo..."
      );

      // Crear las columnas una por una
      const { error: error1 } = await adminClient
        .from("products")
        .select("thickness")
        .limit(1);
      if (error1?.code === "42703") {
        // Columna thickness no existe, la necesitamos crear manualmente
        console.log(
          "Columna thickness no existe - necesita ser creada manualmente en Supabase Dashboard"
        );
      }

      const { error: error2 } = await adminClient
        .from("products")
        .select("size")
        .limit(1);
      if (error2?.code === "42703") {
        // Columna size no existe, la necesitamos crear manualmente
        console.log(
          "Columna size no existe - necesita ser creada manualmente en Supabase Dashboard"
        );
      }

      return NextResponse.json(
        {
          error: "No se pudo ejecutar la migración automáticamente",
          message:
            "Por favor ejecuta el SQL manualmente en Supabase Dashboard:",
          sql: `
ALTER TABLE products ADD COLUMN IF NOT EXISTS thickness TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS size TEXT;
        `.trim(),
          details: error.message,
        },
        { status: 500 }
      );
    }

    // Verificar que las columnas se crearon
    const { data: columns, error: checkError } = await adminClient
      .from("information_schema.columns")
      .select("column_name, data_type")
      .eq("table_name", "products")
      .in("column_name", ["thickness", "size"]);

    if (checkError) {
      console.log("No se pudo verificar las columnas:", checkError);
    }

    return NextResponse.json({
      success: true,
      message: "Migración ejecutada exitosamente",
      data,
      columns,
    });
  } catch (error) {
    console.error("Error en migración:", error);
    return NextResponse.json(
      {
        error: "Error al ejecutar migración",
        details: error instanceof Error ? error.message : "Error desconocido",
        instruction:
          "Por favor ejecuta manualmente en Supabase Dashboard:\n\nALTER TABLE products ADD COLUMN IF NOT EXISTS thickness TEXT;\nALTER TABLE products ADD COLUMN IF NOT EXISTS size TEXT;",
      },
      { status: 500 }
    );
  }
}
