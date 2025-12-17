import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Section,
  Text,
  Hr,
  Row,
  Column,
} from "@react-email/components";
import * as React from "react";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  total: number;
}

interface OrderConfirmationEmailProps {
  orderNumber: string;
  orderDate: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  items: OrderItem[];
  subtotal: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  deliveryAddress?: string;
}

export const OrderConfirmationEmail = ({
  orderNumber = "ORD-12345",
  orderDate = new Date().toLocaleDateString("es-UY"),
  customerName = "Cliente",
  customerEmail = "cliente@ejemplo.com",
  customerPhone = "",
  items = [
    {
      name: "Producto ejemplo",
      quantity: 1,
      price: 100,
      total: 100,
    },
  ],
  subtotal = 100,
  total = 100,
  paymentMethod = "MercadoPago",
  paymentStatus = "Aprobado",
  deliveryAddress = "",
}: OrderConfirmationEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Confirmación de tu pedido #{orderNumber} - Construmax</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={h1}>Construmax</Heading>
            <Text style={subtitle}>Materiales de Construcción</Text>
          </Section>

          {/* Success Message */}
          <Section style={successSection}>
            <Text style={successIcon}>✓</Text>
            <Heading style={h2}>¡Pedido Confirmado!</Heading>
            <Text style={text}>
              Gracias por tu compra. Hemos recibido tu pedido y lo estamos
              procesando.
            </Text>
          </Section>

          <Hr style={hr} />

          {/* Order Details */}
          <Section style={section}>
            <Heading style={h3}>Detalles del Pedido</Heading>
            <Row>
              <Column>
                <Text style={label}>Número de Orden:</Text>
                <Text style={value}>{orderNumber}</Text>
              </Column>
              <Column>
                <Text style={label}>Fecha:</Text>
                <Text style={value}>{orderDate}</Text>
              </Column>
            </Row>
            <Row style={marginTop}>
              <Column>
                <Text style={label}>Estado de Pago:</Text>
                <Text style={value}>{paymentStatus}</Text>
              </Column>
              <Column>
                <Text style={label}>Método de Pago:</Text>
                <Text style={value}>{paymentMethod}</Text>
              </Column>
            </Row>
          </Section>

          <Hr style={hr} />

          {/* Customer Info */}
          <Section style={section}>
            <Heading style={h3}>Información del Cliente</Heading>
            <Text style={label}>Nombre:</Text>
            <Text style={value}>{customerName}</Text>
            <Text style={label}>Email:</Text>
            <Text style={value}>{customerEmail}</Text>
            {customerPhone && (
              <>
                <Text style={label}>Teléfono:</Text>
                <Text style={value}>{customerPhone}</Text>
              </>
            )}
            {deliveryAddress && (
              <>
                <Text style={label}>Dirección de Entrega:</Text>
                <Text style={value}>{deliveryAddress}</Text>
              </>
            )}
          </Section>

          <Hr style={hr} />

          {/* Order Items */}
          <Section style={section}>
            <Heading style={h3}>Productos</Heading>
            {items.map((item, index) => (
              <Row key={index} style={itemRow}>
                <Column style={{ width: "50%" }}>
                  <Text style={itemName}>{item.name}</Text>
                  <Text style={itemQuantity}>Cantidad: {item.quantity}</Text>
                </Column>
                <Column style={{ width: "25%", textAlign: "right" }}>
                  <Text style={itemPrice}>
                    ${item.price.toLocaleString("es-UY")}
                  </Text>
                </Column>
                <Column style={{ width: "25%", textAlign: "right" }}>
                  <Text style={itemTotal}>
                    ${item.total.toLocaleString("es-UY")}
                  </Text>
                </Column>
              </Row>
            ))}
          </Section>

          <Hr style={hr} />

          {/* Total */}
          <Section style={section}>
            <Row>
              <Column style={{ width: "75%", textAlign: "right" }}>
                <Text style={totalLabel}>Subtotal:</Text>
              </Column>
              <Column style={{ width: "25%", textAlign: "right" }}>
                <Text style={totalValue}>
                  ${subtotal.toLocaleString("es-UY")}
                </Text>
              </Column>
            </Row>
            <Row>
              <Column style={{ width: "75%", textAlign: "right" }}>
                <Text style={totalLabelFinal}>Total:</Text>
              </Column>
              <Column style={{ width: "25%", textAlign: "right" }}>
                <Text style={totalValueFinal}>
                  ${total.toLocaleString("es-UY")}
                </Text>
              </Column>
            </Row>
          </Section>

          <Hr style={hr} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Si tienes alguna pregunta sobre tu pedido, no dudes en
              contactarnos.
            </Text>
            <Text style={footerText}>
              © {new Date().getFullYear()} Construmax. Todos los derechos
              reservados.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default OrderConfirmationEmail;

// Styles
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
  maxWidth: "600px",
};

const header = {
  padding: "32px 32px 0",
  textAlign: "center" as const,
};

const h1 = {
  color: "#ea580c",
  fontSize: "32px",
  fontWeight: "bold",
  margin: "0",
  padding: "0",
};

const subtitle = {
  color: "#6b7280",
  fontSize: "14px",
  margin: "8px 0 0",
};

const successSection = {
  padding: "32px",
  textAlign: "center" as const,
};

const successIcon = {
  color: "#22c55e",
  fontSize: "48px",
  margin: "0",
};

const h2 = {
  color: "#1f2937",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "16px 0 8px",
};

const h3 = {
  color: "#1f2937",
  fontSize: "18px",
  fontWeight: "bold",
  margin: "0 0 16px",
};

const text = {
  color: "#6b7280",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "0",
};

const section = {
  padding: "0 32px",
  margin: "24px 0",
};

const label = {
  color: "#6b7280",
  fontSize: "12px",
  fontWeight: "600",
  textTransform: "uppercase" as const,
  margin: "0 0 4px",
};

const value = {
  color: "#1f2937",
  fontSize: "16px",
  margin: "0 0 16px",
};

const marginTop = {
  marginTop: "16px",
};

const hr = {
  borderColor: "#e5e7eb",
  margin: "0",
};

const itemRow = {
  padding: "12px 0",
  borderBottom: "1px solid #f3f4f6",
};

const itemName = {
  color: "#1f2937",
  fontSize: "14px",
  fontWeight: "500",
  margin: "0",
};

const itemQuantity = {
  color: "#6b7280",
  fontSize: "12px",
  margin: "4px 0 0",
};

const itemPrice = {
  color: "#6b7280",
  fontSize: "14px",
  margin: "0",
};

const itemTotal = {
  color: "#1f2937",
  fontSize: "14px",
  fontWeight: "600",
  margin: "0",
};

const totalLabel = {
  color: "#6b7280",
  fontSize: "14px",
  margin: "8px 0",
};

const totalValue = {
  color: "#1f2937",
  fontSize: "14px",
  margin: "8px 0",
};

const totalLabelFinal = {
  color: "#1f2937",
  fontSize: "18px",
  fontWeight: "bold",
  margin: "8px 0",
};

const totalValueFinal = {
  color: "#ea580c",
  fontSize: "20px",
  fontWeight: "bold",
  margin: "8px 0",
};

const footer = {
  padding: "24px 32px",
  textAlign: "center" as const,
};

const footerText = {
  color: "#9ca3af",
  fontSize: "12px",
  lineHeight: "20px",
  margin: "8px 0",
};
