import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

interface OrderItem {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const { data: orders, error } = await supabase
      .from("orders")
      .select(
        `
        *,
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
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching orders:", error);
      return NextResponse.json(
        { error: "Error al obtener las órdenes" },
        { status: 500 }
      );
    }

    // Formatear las órdenes para incluir los items
    const formattedOrders = orders.map((order) => ({
      ...order,
      items: order.order_items || [],
    }));

    return NextResponse.json(formattedOrders);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      customer_name,
      customer_email,
      customer_phone,
      document_type,
      document_number,
      address,
      city,
      payment_method,
      delivery_method,
      delivery_date,
      delivery_address,
      contact_phone,
      preferred_time,
      observations,
      subtotal,
      tax,
      shipping_cost,
      total,
      items,
    } = body;

    // Crear la orden
    const orderData = {
      customer_name,
      customer_email,
      customer_phone,
      document_type,
      document_number,
      address,
      city,
      payment_method,
      delivery_method,
      delivery_date,
      delivery_address,
      contact_phone,
      preferred_time,
      observations,
      subtotal,
      tax,
      shipping_cost,
      total,
      status: "pending",
    };

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert(orderData)
      .select()
      .single();

    if (orderError) {
      console.error("Error creating order:", orderError);
      return NextResponse.json(
        { error: "Error al crear la orden", details: orderError },
        { status: 500 }
      );
    }

    if (items && items.length > 0) {
      const orderItems = items.map((item: OrderItem) => ({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.product_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) {
        console.error("Error creating order items:", itemsError);
        // Si falla crear los items, eliminar la orden
        await supabase.from("orders").delete().eq("id", order.id);
        return NextResponse.json(
          {
            error: "Error al crear los items de la orden",
            details: itemsError,
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ success: true, order }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
