import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data } = body;

    if (type === 'payment') {
      const paymentId = data.id;
      
      // Configurar cliente de MercadoPago
      const client = new MercadoPagoConfig({
        accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || 'TEST-12345678-1234-1234-1234-123456789012',
      });
      
      // Obtener información del pago
      const paymentClient = new Payment(client);
      const payment = await paymentClient.get({ id: paymentId });
      const paymentInfo = payment;

      // Procesar el pago según su estado
      switch (paymentInfo.status) {
        case 'approved':
          // Pago aprobado - actualizar orden en tu base de datos
          console.log('Pago aprobado:', paymentInfo);
          // Aquí deberías actualizar el estado de la orden en tu base de datos
          break;
        
        case 'pending':
          // Pago pendiente
          console.log('Pago pendiente:', paymentInfo);
          break;
        
        case 'rejected':
          // Pago rechazado
          console.log('Pago rechazado:', paymentInfo);
          break;
        
        case 'cancelled':
          // Pago cancelado
          console.log('Pago cancelado:', paymentInfo);
          break;
        
        default:
          console.log('Estado de pago desconocido:', paymentInfo.status);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Error processing webhook' },
      { status: 500 }
    );
  }
}
