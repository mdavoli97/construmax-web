"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PackageIcon, UserIcon, ShoppingBagIcon } from "lucide-react";
import { useCustomerAuth } from "@/contexts/CustomerAuthContext";
import {
  CustomerOrder,
  fetchCustomerOrders,
  formatOrderStatus,
  formatUyDate,
  formatUyMoney,
} from "@/lib/customer-orders";
import { Button } from "@/components/ui/button";

export default function CuentaHomePage() {
  const { session, user } = useCustomerAuth();
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  const latest = orders[0];
  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "";

  return (
    <div className="space-y-6">
      <section className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Bienvenido a tu cuenta
        </h2>
        <p className="text-sm text-gray-600">
          Desde acá podés ver tu historial de compras y actualizar tus datos.
          {displayName ? ` Sesión de ${displayName}.` : ""}
        </p>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">
            Pedidos
          </p>
          {loading ? (
            <div className="h-8 w-16 bg-gray-100 animate-pulse rounded" />
          ) : (
            <p className="text-3xl font-bold text-gray-900">{orders.length}</p>
          )}
          <p className="text-sm text-gray-500 mt-1">en tu historial</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">
            Último pedido
          </p>
          {loading ? (
            <div className="h-8 w-28 bg-gray-100 animate-pulse rounded" />
          ) : latest ? (
            <>
              <p className="text-lg font-semibold text-gray-900">
                #{latest.id} ·{" "}
                {formatOrderStatus(
                  latest.status,
                  latest.delivery_method || "delivery"
                )}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {formatUyDate(latest.created_at)} · {formatUyMoney(latest.total)}
              </p>
            </>
          ) : (
            <p className="text-sm text-gray-600 mt-1">Todavía no tenés pedidos</p>
          )}
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <section className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Accesos rápidos</h3>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button asChild variant="outline" className="justify-start">
            <Link href="/cuenta/pedidos">
              <PackageIcon className="h-4 w-4 mr-2" />
              Ver mis pedidos
            </Link>
          </Button>
          <Button asChild variant="outline" className="justify-start">
            <Link href="/cuenta/datos">
              <UserIcon className="h-4 w-4 mr-2" />
              Mis datos
            </Link>
          </Button>
          <Button
            asChild
            className="justify-start bg-orange-600 hover:bg-orange-700 text-white"
          >
            <Link href="/productos">
              <ShoppingBagIcon className="h-4 w-4 mr-2" />
              Seguir comprando
            </Link>
          </Button>
        </div>
      </section>

      {!loading && latest && (
        <section className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">Pedido reciente</h3>
            <Link
              href="/cuenta/pedidos"
              className="text-sm font-medium text-orange-600 hover:text-orange-700"
            >
              Ver todos
            </Link>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-700">
            <span className="font-medium">#{latest.id}</span>
            <span>{formatUyDate(latest.created_at)}</span>
            <span>
              {formatOrderStatus(
                latest.status,
                latest.delivery_method || "delivery"
              )}
            </span>
            <span className="font-semibold text-gray-900">
              {formatUyMoney(latest.total)}
            </span>
          </div>
        </section>
      )}
    </div>
  );
}
