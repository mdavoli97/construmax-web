import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getCustomerUserFromRequest } from "@/lib/customer-auth";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const user = await getCustomerUserFromRequest(request);
    if (!user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const email = user.email.trim().toLowerCase();
    // Solo pedidos desde que existe la cuenta (evita arrastrar historial
    // de checkouts previos como invitado con el mismo email).
    const accountCreatedAt = user.created_at;

    let query = supabaseAdmin
      .from("orders")
      .select(
        `
        id,
        customer_name,
        customer_email,
        customer_phone,
        payment_method,
        delivery_method,
        delivery_date,
        delivery_address,
        subtotal,
        tax,
        shipping_cost,
        total,
        status,
        payment_status,
        payment_id,
        external_reference,
        created_at,
        updated_at,
        order_items (
          id,
          product_id,
          product_name,
          quantity,
          unit_price,
          total_price
        )
      `
      )
      .ilike("customer_email", email)
      .order("created_at", { ascending: false });

    if (accountCreatedAt) {
      query = query.gte("created_at", accountCreatedAt);
    }

    const { data: orders, error } = await query;

    if (error) {
      console.error("Error fetching customer orders:", error);
      return NextResponse.json(
        { error: "Error al obtener los pedidos" },
        { status: 500 }
      );
    }

    const formatted = (orders || []).map((order) => ({
      ...order,
      items: order.order_items || [],
      order_items: undefined,
    }));

    return NextResponse.json({ orders: formatted });
  } catch (error) {
    console.error("Error /api/cuenta/orders:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
