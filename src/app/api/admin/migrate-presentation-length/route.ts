// API Route para migrar columnas presentation y length
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    console.log("Iniciando migración de columna length...");

    // 1. Agregar columna length a products si no existe
    console.log("Agregando columna length a products...");

    const { error: productsError } = await supabase.rpc("exec_sql", {
      sql: `
        DO $$ 
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'products' AND column_name = 'length'
          ) THEN
            ALTER TABLE products ADD COLUMN length TEXT;
          END IF;
        END $$;
      `,
    });

    if (productsError) {
      console.error("Error al agregar columna a products:", productsError);

      // Intentar método alternativo usando SQL directo
      try {
        await supabase.from("products").select("length").limit(1);
      } catch (e: any) {
        if (
          e.message?.includes("column") &&
          e.message?.includes("does not exist")
        ) {
          console.log("Intentando agregar columna length manualmente...");
          const { error: altError } = await supabase.rpc("exec_sql", {
            sql: "ALTER TABLE products ADD COLUMN IF NOT EXISTS length TEXT;",
          });

          if (altError) {
            console.error("Error en método alternativo para length:", altError);
          }
        }
      }
    }

    // 2. Agregar columna length a price_groups si no existe
    console.log("Agregando columna length a price_groups...");

    const { error: priceGroupsError } = await supabase.rpc("exec_sql", {
      sql: `
        DO $$ 
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'price_groups' AND column_name = 'length'
          ) THEN
            ALTER TABLE price_groups ADD COLUMN length BOOLEAN DEFAULT false;
          END IF;
        END $$;
      `,
    });

    if (priceGroupsError) {
      console.error(
        "Error al agregar columna a price_groups:",
        priceGroupsError
      );

      // Intentar método alternativo
      try {
        await supabase.from("price_groups").select("length").limit(1);
      } catch (e: any) {
        if (
          e.message?.includes("column") &&
          e.message?.includes("does not exist")
        ) {
          console.log(
            "Intentando agregar columna length a price_groups manualmente..."
          );
          const { error: altError } = await supabase.rpc("exec_sql", {
            sql: "ALTER TABLE price_groups ADD COLUMN IF NOT EXISTS length BOOLEAN DEFAULT false;",
          });

          if (altError) {
            console.error(
              "Error en método alternativo para length en price_groups:",
              altError
            );
          }
        }
      }
    }

    // 3. Verificar que las columnas se crearon correctamente
    console.log("Verificando columnas...");

    const { data: productCheck, error: productCheckError } = await supabase
      .from("products")
      .select("id, length")
      .limit(1);

    const { data: priceGroupCheck, error: priceGroupCheckError } =
      await supabase.from("price_groups").select("id, length").limit(1);

    if (productCheckError || priceGroupCheckError) {
      return NextResponse.json(
        {
          success: false,
          error: "La columna no se pudo crear completamente",
          details: {
            productError: productCheckError?.message,
            priceGroupError: priceGroupCheckError?.message,
          },
          message:
            "Por favor ejecuta manualmente en Supabase Dashboard:\n\n" +
            "-- Para products:\n" +
            "ALTER TABLE products ADD COLUMN IF NOT EXISTS length TEXT;\n\n" +
            "-- Para price_groups:\n" +
            "ALTER TABLE price_groups ADD COLUMN IF NOT EXISTS length BOOLEAN DEFAULT false;",
        },
        { status: 500 }
      );
    }

    console.log("✅ Migración completada exitosamente");

    return NextResponse.json({
      success: true,
      message: "Columna length agregada exitosamente",
      details: {
        productsColumns: ["length"],
        priceGroupsColumns: ["length"],
      },
    });
  } catch (error) {
    console.error("Error en migración:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error durante la migración",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}
