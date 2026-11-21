"use client";

import { useState, useEffect } from "react";
import { LoaderFive } from "@/components/ui/loader";
import { toast } from "sonner";
import { adminFetch } from "@/lib/admin-fetch";
import {
  getAdminStatusOptions,
  getStatusColorClass,
  getStatusLabel,
  normalizeStatus,
} from "@/lib/order-fulfillment";

interface OrderItem {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface Order {
  id: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  document_type?: string;
  document_number?: string;
  address?: string;
  city?: string;
  payment_method: string;
  delivery_method: string;
  delivery_date: string;
  delivery_address?: string;
  contact_phone?: string;
  preferred_time?: string;
  observations?: string;
  subtotal: number;
  tax: number;
  shipping_cost: number;
  total: number;
  status: string;
  created_at: string;
  items: OrderItem[];
  external_reference?: string | null;
  payment_id?: string | null;
  payment_status?: string | null;
  mercadopago_preference_id?: string | null;
}

function formatOrderWhen(iso: string) {
  return new Date(iso).toLocaleString("es-UY", {
    timeZone: "America/Montevideo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await adminFetch("/api/admin/orders");
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      } else {
        throw new Error("Error al cargar órdenes");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al cargar las órdenes");
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      const response = await adminFetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        const data = await response.json().catch(() => ({}));
        const whatsappUrl = data.notification?.whatsappUrl as string | undefined;
        toast.success(
          data.notification?.emailSent
            ? "Estado actualizado y email enviado"
            : "Estado de la orden actualizado",
          whatsappUrl
            ? {
                action: {
                  label: "WhatsApp",
                  onClick: () => window.open(whatsappUrl, "_blank"),
                },
              }
            : undefined
        );
        fetchOrders();
      } else {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Error al actualizar estado");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Error al actualizar el estado de la orden"
      );
    }
  };

  const getPaymentMethodLabel = (order: Order) => {
    if (order.payment_method === "cash") return "Efectivo";
    if (order.payment_method === "transfer") return "Transferencia";
    if (
      order.payment_method === "card" ||
      order.mercadopago_preference_id ||
      order.payment_id
    ) {
      return "Tarjeta (Mercado Pago)";
    }
    return order.payment_method;
  };

  const filteredOrders = orders.filter((order) => {
    const haystack = `${order.id} ${order.customer_name} ${order.customer_email} ${order.customer_phone}`.toLowerCase();
    const matchesQuery = !query || haystack.includes(query.trim().toLowerCase());
    const matchesStatus =
      statusFilter === "all" || normalizeStatus(order.status) === statusFilter;
    return matchesQuery && matchesStatus;
  });
  const selected = orders.find((order) => order.id === selectedId) || null;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoaderFive text="Cargando órdenes..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Órdenes</h1>
          <p className="text-sm text-gray-500">
            {filteredOrders.length} de {orders.length} órdenes
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar cliente, email o número"
            className="rounded border border-gray-300 px-3 py-2 text-sm"
          />
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="all">Todos los estados</option>
            <option value="pending">Pendiente</option>
            <option value="pending_payment">Pago pendiente</option>
            <option value="confirmed">Confirmado</option>
            <option value="preparing">Preparando</option>
            <option value="in_transit">En camino</option>
            <option value="ready_for_pickup">Listo para retirar</option>
            <option value="delivered">Entregado</option>
            <option value="cancelled">Cancelado</option>
          </select>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Orden
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Método de Pago
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Entrega
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      #{order.id.toString().padStart(8, "0")}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatOrderWhen(order.created_at)}
                    </div>
                    {order.external_reference && (
                      <div className="text-xs text-gray-400 mt-1 truncate max-w-[160px]" title={order.external_reference}>
                        Ref: {order.external_reference}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {order.customer_name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {order.customer_email}
                    </div>
                    <div className="text-sm text-gray-500">
                      {order.customer_phone}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>{getPaymentMethodLabel(order)}</div>
                    {order.payment_id && (
                      <div
                        className="text-xs text-gray-400 mt-1 truncate max-w-[140px]"
                        title={order.payment_id}
                      >
                        MP: {order.payment_id}
                      </div>
                    )}
                    {order.payment_status && (
                      <div className="text-xs text-gray-400">
                        {order.payment_status}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {order.delivery_method === "pickup"
                        ? "Retiro en local"
                        : "Envío a domicilio"}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(order.delivery_date).toLocaleDateString(
                        "es-UY"
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${order.total.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColorClass(
                        order.status
                      )}`}
                    >
                      {getStatusLabel(order.status, order.delivery_method)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedId((current) =>
                            current === order.id ? null : order.id
                          )
                        }
                        className="block text-xs font-medium text-gray-700 underline"
                      >
                        {selectedId === order.id ? "Ocultar detalle" : "Ver detalle"}
                      </button>
                      {(order.payment_method === "cash" ||
                        order.payment_method === "transfer") &&
                        ["pending", "pending_payment", "payment_failed"].includes(
                          normalizeStatus(order.status)
                        ) && (
                          <button
                            type="button"
                            onClick={() =>
                              updateOrderStatus(order.id, "confirmed")
                            }
                            className="block w-full text-left text-xs font-medium text-emerald-700 hover:text-emerald-800 underline"
                          >
                            Confirmar pago
                          </button>
                        )}
                      <select
                        value={
                          normalizeStatus(order.status) === "ready"
                            ? "ready_for_pickup"
                            : normalizeStatus(order.status)
                        }
                        onChange={(e) =>
                          updateOrderStatus(order.id, e.target.value)
                        }
                        className="rounded border-gray-300 text-sm max-w-[220px]"
                      >
                        {getAdminStatusOptions(order.delivery_method).map(
                          (opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          )
                        )}
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500">No hay órdenes para mostrar</div>
          </div>
        )}
      </div>

      {selected && (
        <div className="bg-white shadow-sm rounded-lg p-6 space-y-4">
          <div className="flex justify-between gap-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Pedido #{selected.id.toString().padStart(8, "0")}
            </h2>
            <span className="text-sm text-gray-500">
              {formatOrderWhen(selected.created_at)}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div>
              <p className="font-medium text-gray-900">{selected.customer_name}</p>
              <p>{selected.customer_email}</p>
              <p>{selected.customer_phone}</p>
              {selected.document_number && (
                <p>
                  {selected.document_type}: {selected.document_number}
                </p>
              )}
              {selected.address && (
                <p>
                  {selected.address}
                  {selected.city ? `, ${selected.city}` : ""}
                </p>
              )}
            </div>
            <div>
              <p>
                {selected.delivery_method === "pickup"
                  ? "Retiro en local"
                  : "Envío a domicilio"}
              </p>
              {selected.delivery_address && <p>{selected.delivery_address}</p>}
              {selected.preferred_time && <p>Franja: {selected.preferred_time}</p>}
              {selected.contact_phone && <p>Contacto: {selected.contact_phone}</p>}
              {selected.observations && <p>Notas: {selected.observations}</p>}
              <p className="font-medium mt-2">Total: ${selected.total.toFixed(2)}</p>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">Ítems</h3>
            <ul className="divide-y divide-gray-100 text-sm">
              {(selected.items || []).map((item, index) => (
                <li key={`${item.product_id}-${index}`} className="py-2 flex justify-between gap-4">
                  <span>
                    {item.quantity} × {item.product_name}
                  </span>
                  <span>${Number(item.total_price).toFixed(2)}</span>
                </li>
              ))}
              {(!selected.items || selected.items.length === 0) && (
                <li className="py-2 text-gray-500">Sin ítems cargados</li>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
