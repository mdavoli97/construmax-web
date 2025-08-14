import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from "mercadopago";

// Configurar MercadoPago con tu access token
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || 'TEST-12345678-1234-1234-1234-123456789012',
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, customer, back_urls } = body;

    // Crear preferencia de pago
    const preference = {
      items: items.map((item: { title: string; unit_price: number; quantity: number; currency_id: string }) => ({
        title: item.title,
        unit_price: Number(item.unit_price),
        quantity: Number(item.quantity),
        currency_id: item.currency_id,
      })),
      payer: {
        name: customer.name,
        email: customer.email,
        phone: {
          number: customer.phone,
        },
        address: {
          street_name: customer.address,
          city: customer.city,
          zip_code: customer.zipCode,
        },
      },
      back_urls: {
        success: back_urls.success,
        failure: back_urls.failure,
        pending: back_urls.pending,
      },
      auto_return: 'approved',
      notification_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/webhook`,
      statement_descriptor: 'BARRACA CONSTRUCCION',
      external_reference: `order_${Date.now()}`,
    };

    const preferenceClient = new Preference(client);
    const response = await preferenceClient.create({ body: preference });

    return NextResponse.json({
      preferenceId: response.id,
      initPoint: response.init_point,
    });
  } catch (error) {
    console.error('Error creating preference:', error);
    return NextResponse.json(
      { error: 'Error al crear la preferencia de pago' },
      { status: 500 }
    );
  }
}
