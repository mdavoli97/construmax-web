// Interfaces para tipos específicos
interface OrderItem {
  quantity: number;
  product_name: string;
}

interface OrderData {
  id: number;
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  total: number;
  delivery_date?: string;
  delivery_address?: string;
  payment_method?: string;
  items?: OrderItem[];
}

// Servicio para generar enlaces de WhatsApp
export const whatsappService = {
  // Número de WhatsApp del negocio (sin + ni espacios)
  businessNumber: "59897971111", // Cambia por tu número

  // Generar mensaje para el cliente
  generateCustomerMessage: (orderData: OrderData) => {
    try {
      const items = orderData.items || [];
      const message = `¡Hola! 👋
    
Confirmé mi pedido #${orderData.id}:
📦 ${items
        .map((item: OrderItem) => `${item.quantity}x ${item.product_name}`)
        .join(", ")}
💰 Total: $${orderData.total}
📅 Entrega: ${orderData.delivery_date || "Por definir"}
📍 Dirección: ${orderData.delivery_address || "Por definir"}

¡Gracias!`;

      return encodeURIComponent(message);
    } catch (error) {
      console.error("Error generating customer message:", error);
      return encodeURIComponent(
        `¡Hola! Confirmé mi pedido #${orderData.id}. ¡Gracias!`
      );
    }
  },

  // Generar mensaje para admin
  generateAdminMessage: (orderData: OrderData) => {
    try {
      const items = orderData.items || [];
      const message = `🚨 NUEVA ORDEN #${orderData.id}
    
👤 Cliente: ${orderData.customer_name}
📞 Teléfono: ${orderData.customer_phone}
📧 Email: ${orderData.customer_email}
📦 Productos: ${items
        .map((item: OrderItem) => `${item.quantity}x ${item.product_name}`)
        .join(", ")}
💰 Total: $${orderData.total}
📅 Entrega: ${orderData.delivery_date || "Por definir"}
📍 Dirección: ${orderData.delivery_address || "Por definir"}
💳 Pago: ${orderData.payment_method}`;

      return encodeURIComponent(message);
    } catch (error) {
      console.error("Error generating admin message:", error);
      return encodeURIComponent(
        `🚨 NUEVA ORDEN #${orderData.id} - Cliente: ${orderData.customer_name}`
      );
    }
  },

  // Generar URL de WhatsApp
  generateWhatsAppURL: (phoneNumber: string, message: string) => {
    return `https://wa.me/${phoneNumber}?text=${message}`;
  },
};
