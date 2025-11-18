// API para gestionar grupos de precios
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const active = searchParams.get("active");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    let query = supabase.from("price_groups").select(`
        id,
        name,
        description,
        price_per_kg,
        currency,
        is_active,
        thickness,
        size,
        created_at,
        updated_at
      `);

    // Aplicar filtros
    if (active !== null) {
      query = query.eq("is_active", active === "true");
    }

    // Aplicar paginación
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    // Ordenar por fecha de creación
    query = query.order("created_at", { ascending: false });

    const { data: priceGroups, error, count } = await query;

    if (error) {
      console.error("Error fetching price groups:", error);
      return NextResponse.json(
        { success: false, error: "Error al obtener grupos de precios" },
        { status: 500 }
      );
    }

    // Para cada grupo, contar productos relacionados y obtener precios
    const formattedGroups = [];
    if (priceGroups) {
      for (const group of priceGroups) {
        // Contar productos que tienen price_group_id igual a este grupo
        const { count: productCount } = await supabase
          .from("products")
          .select("*", { count: "exact", head: true })
          .eq("price_group_id", group.id);

        // Obtener precios del grupo
        const { data: groupPrices } = await supabase
          .from("price_group_prices")
          .select("id, name, description, price_per_kg, currency, is_active")
          .eq("price_group_id", group.id)
          .eq("is_active", true)
          .order("created_at", { ascending: true });

        // Calcular estadísticas de precios
        let priceStats = {};
        if (groupPrices && groupPrices.length > 0) {
          const prices = groupPrices.map((p) => p.price_per_kg);
          const currencies = [...new Set(groupPrices.map((p) => p.currency))];

          priceStats = {
            price_count: groupPrices.length,
            min_price: Math.min(...prices),
            max_price: Math.max(...prices),
            main_currency: currencies.length === 1 ? currencies[0] : null,
            price_group_prices: groupPrices,
          };
        }

        formattedGroups.push({
          ...group,
          product_count: productCount || 0,
          ...priceStats,
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: formattedGroups || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error("Error in price groups API:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      thickness = false,
      size = false,
      prices = [], // Array of prices to create with the group
      // Legacy support
      price_per_kg,
      currency = "USD",
    } = body;

    // Validaciones básicas
    if (!name) {
      return NextResponse.json(
        {
          success: false,
          error: "Faltan campos requeridos (nombre)",
        },
        { status: 400 }
      );
    }

    // Validar precios si se proporcionaron
    if (prices.length > 0) {
      for (const price of prices) {
        if (!price.name || !price.price_per_kg || price.price_per_kg <= 0) {
          return NextResponse.json(
            {
              success: false,
              error: "Todos los precios deben tener nombre y precio válido",
            },
            { status: 400 }
          );
        }

        if (!["USD", "UYU"].includes(price.currency)) {
          return NextResponse.json(
            { success: false, error: "Moneda inválida en precios" },
            { status: 400 }
          );
        }
      }

      // Verificar nombres únicos en precios
      const priceNames = prices.map((p: any) => p.name.toLowerCase());
      const uniqueNames = new Set(priceNames);
      if (priceNames.length !== uniqueNames.size) {
        return NextResponse.json(
          { success: false, error: "Los nombres de precios deben ser únicos" },
          { status: 400 }
        );
      }
    } else if (price_per_kg && currency) {
      // Legacy support - convert single price to prices array
      if (price_per_kg <= 0) {
        return NextResponse.json(
          { success: false, error: "El precio por kg debe ser mayor a 0" },
          { status: 400 }
        );
      }

      if (!["USD", "UYU"].includes(currency)) {
        return NextResponse.json(
          { success: false, error: "Moneda inválida" },
          { status: 400 }
        );
      }

      prices.push({
        name: "Precio Base",
        description: "Precio base del grupo",
        price_per_kg: parseFloat(price_per_kg),
        currency,
        is_active: true,
      });
    }

    // Verificar que no exista otro grupo con el mismo nombre
    const { data: existingGroup } = await supabase
      .from("price_groups")
      .select("id")
      .eq("name", name.trim())
      .eq("is_active", true)
      .single();

    if (existingGroup) {
      return NextResponse.json(
        {
          success: false,
          error: "Ya existe un grupo con ese nombre en esta categoría",
        },
        { status: 400 }
      );
    }

    // Si no hay precios, crear grupo sin precios iniciales
    if (prices.length === 0) {
      const { data: newGroup, error } = await supabase
        .from("price_groups")
        .insert({
          name: name.trim(),
          description: description?.trim() || null,
          is_active: true,
          thickness,
          size,
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating price group:", error);
        return NextResponse.json(
          { success: false, error: "Error al crear el grupo de precios" },
          { status: 500 }
        );
      }

      return NextResponse.json(
        {
          success: true,
          data: {
            ...newGroup,
            product_count: 0,
            price_group_prices: [],
          },
        },
        { status: 201 }
      );
    }

    // Crear grupo con precios en una transacción
    const { data: newGroup, error: groupError } = await supabase
      .from("price_groups")
      .insert({
        name: name.trim(),
        description: description?.trim() || null,
        is_active: true,
        thickness,
        size,
      })
      .select()
      .single();

    if (groupError) {
      console.error("Error creating price group:", groupError);
      return NextResponse.json(
        { success: false, error: "Error al crear el grupo de precios" },
        { status: 500 }
      );
    }

    // Crear precios asociados
    const pricesData = prices.map((price: any) => ({
      price_group_id: newGroup.id,
      name: price.name.trim(),
      description: price.description?.trim() || null,
      price_per_kg: parseFloat(price.price_per_kg),
      currency: price.currency,
      is_active: price.is_active !== false, // default to true
    }));

    const { data: createdPrices, error: pricesError } = await supabase
      .from("price_group_prices")
      .insert(pricesData)
      .select();

    if (pricesError) {
      console.error("Error creating prices:", pricesError);
      // Rollback: delete the group if price creation fails
      await supabase.from("price_groups").delete().eq("id", newGroup.id);
      return NextResponse.json(
        { success: false, error: "Error al crear los precios del grupo" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          ...newGroup,
          product_count: 0,
          price_group_prices: createdPrices || [],
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in POST price groups:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
