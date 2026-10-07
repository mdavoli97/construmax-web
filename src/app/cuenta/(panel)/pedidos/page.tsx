"use client";

import { useEffect, useState } from "react";
import { ChevronDownIcon } from "lucide-react";
import { useCustomerAuth } from "@/contexts/CustomerAuthContext";
import {
  CustomerOrder,
  fetchCustomerOrders,
  formatOrderStatus,
  formatPaymentMethod,
  formatUyDate,
  formatUyMoney,
} from "@/lib/customer-orders";
import { getStatusColorClass } from "@/lib/order-fulfillment";
import OrderTrackingStepper from "@/components/cuenta/OrderTrackingStepper";
import { cn } from "@/lib/utils";

export default function CuentaPedidosPage() {
  const { session } = useCustomerAuth();
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openId, setOpenId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!session) return;
      setLoading(true);
      setError("");
      try {
        const data = await fetchCustomerOrders(session);
        if (!cancelled) setOrders(data);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "No se pudieron cargar los pedidos"
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [session]);

  return (
    <div className="space-y-4">
      <section className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Mis pedidos</h2>
        <p className="text-sm text-gray-600">
          Historial de compras asociadas a tu email.
        </p>
      </section>

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-20 rounded-xl border border-gray-100 bg-white animate-pulse"
            />
          ))}
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {!loading && !error && orders.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center shadow-sm">
          <p className="text-gray-700 font-medium mb-1">No hay pedidos todavía</p>
          <p className="text-sm text-gray-500">
            Cuando compres en ConstruMax, van a aparecer acá.
          </p>
        </div>
      )}

      {!loading &&
        orders.map((order) => {
          const open = openId === order.id;
          return (
            <div
              key={order.id}
              className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setOpenId(open ? null : order.id)}
                className="w-full text-left px-5 py-4 flex items-start justify-between gap-3 hover:bg-gray-50 transition-colors"
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="font-semibold text-gray-900">
                      Pedido #{order.id}
                    </span>
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full text-xs font-medium px-2 py-0.5",
                        getStatusColorClass(order.status)
                      )}
                    >
                      {formatOrderStatus(
                        order.status,
                        order.delivery_method || "delivery"
                      )}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {formatUyDate(order.created_at)} ·{" "}
                    {formatPaymentMethod(order.payment_method)}
                    {order.external_reference
                      ? ` · ${order.external_reference}`
                      : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-semibold text-gray-900">
                    {formatUyMoney(order.total)}
                  </span>
                  <ChevronDownIcon
                    className={cn(
                      "h-4 w-4 text-gray-400 transition-transform",
                      open && "rotate-180"
                    )}
                  />
                </div>
              </button>

              {open && (
                <div className="border-t border-gray-100 px-5 py-4 bg-gray-50/60 space-y-4">
                  <div>
                    <p className="text-xs text-gray-400 uppercase font-semibold mb-3">
                      Seguimiento
                    </p>
                    <OrderTrackingStepper
                      status={order.status}
                      deliveryMethod={order.delivery_method || "delivery"}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-gray-400 uppercase font-semibold">
                        Entrega
                      </p>
                      <p className="text-gray-800">
                        {order.delivery_method === "delivery"
                          ? "Envío a domicilio"
                          : "Retiro en local"}
                      </p>
                      {order.delivery_date && (
                        <p className="text-gray-600">{order.delivery_date}</p>
                      )}
                      {order.delivery_address && (
                        <p className="text-gray-600">{order.delivery_address}</p>
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase font-semibold">
                        Pago
                      </p>
                      <p className="text-gray-800">
                        {formatPaymentMethod(order.payment_method)}
                      </p>
                      {order.payment_status && (
                        <p className="text-gray-600">
                          Estado: {order.payment_status}
                        </p>
                      )}
                      {order.payment_id && (
                        <p className="text-gray-500 text-xs break-all">
                          ID: {order.payment_id}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-gray-400 uppercase font-semibold mb-2">
                      Productos
                    </p>
                    <ul className="space-y-2">
                      {(order.items || []).map((item, idx) => (
                        <li
                          key={`${order.id}-${item.product_id}-${idx}`}
                          className="flex justify-between gap-3 text-sm bg-white rounded-lg border border-gray-100 px-3 py-2"
                        >
                          <span className="text-gray-800">
                            {item.product_name}{" "}
                            <span className="text-gray-500">×{item.quantity}</span>
                          </span>
                          <span className="font-medium text-gray-900 shrink-0">
                            {formatUyMoney(item.total_price)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex justify-end text-sm text-gray-700 gap-4 pt-1">
                    <span>Subtotal {formatUyMoney(order.subtotal)}</span>
                    <span>IVA {formatUyMoney(order.tax)}</span>
                    <span>Envío {formatUyMoney(order.shipping_cost || 0)}</span>
                    <span className="font-semibold text-gray-900">
                      Total {formatUyMoney(order.total)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
    </div>
  );
}
