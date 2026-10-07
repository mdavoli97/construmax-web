import type { Session } from "@supabase/supabase-js";
import { getStatusLabel } from "@/lib/order-fulfillment";

export type CustomerOrderItem = {
  id?: number;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
};

export type CustomerOrder = {
  id: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  payment_method: string | null;
  delivery_method: string | null;
  delivery_date: string | null;
  delivery_address: string | null;
  subtotal: number;
  tax: number;
  shipping_cost: number;
  total: number;
  status: string;
  payment_status: string | null;
  payment_id: string | null;
  external_reference: string | null;
  created_at: string;
  updated_at: string | null;
  items: CustomerOrderItem[];
};

export async function fetchCustomerOrders(
  session: Session | null
): Promise<CustomerOrder[]> {
  if (!session?.access_token) {
    throw new Error("No hay sesión");
  }

  const response = await fetch("/api/cuenta/orders", {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || "Error al cargar pedidos");
  }

  const data = await response.json();
  return (data.orders || []) as CustomerOrder[];
}

export function formatOrderStatus(
  status: string,
  deliveryMethod: string = "delivery"
): string {
  return getStatusLabel(status, deliveryMethod);
}

export function formatPaymentMethod(method: string | null): string {
  if (!method) return "—";
  const map: Record<string, string> = {
    cash: "Efectivo",
    transfer: "Transferencia",
    card: "Tarjeta / Mercado Pago",
  };
  return map[method] || method;
}

export function formatUyDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("es-UY", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export function formatUyMoney(amount: number): string {
  return new Intl.NumberFormat("es-UY", {
    style: "currency",
    currency: "UYU",
    maximumFractionDigits: 0,
  }).format(amount);
}
