"use client";

import { whatsappService } from "@/lib/whatsapp";

export default function TestWhatsApp() {
  const testOrder = {
    id: 123,
    customer_name: "Juan Pérez",
    customer_phone: "099123456",
    customer_email: "juan@email.com",
    total: 1500,
    delivery_date: "2025-11-07",
    delivery_address: "Av. 18 de Julio 1234",
    payment_method: "cash",
    items: [
      {
        quantity: 2,
        product_name: "Cemento Portland",
      },
    ],
  };

  const testWhatsApp = () => {
    const url = whatsappService.generateWhatsAppURL(
      whatsappService.businessNumber,
      whatsappService.generateCustomerMessage(testOrder)
    );

    console.log("URL generada:", url);

    // Probar con window.open
    const opened = window.open(url, "_blank");

    if (!opened) {
      console.log("Popup bloqueado, probando con location.href");
      window.location.href = url;
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test WhatsApp</h1>
      <button
        onClick={testWhatsApp}
        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
      >
        Probar WhatsApp
      </button>

      <div className="mt-4 p-4 bg-gray-100 rounded">
        <p>Número de negocio: {whatsappService.businessNumber}</p>
      </div>
    </div>
  );
}
