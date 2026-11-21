import Link from "next/link";
import { CheckCircleIcon } from "@heroicons/react/24/outline";

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ pedido?: string; metodo?: string; payment?: string }>;
}) {
  const params = await searchParams;
  const pedido = params.pedido;
  const isOffline = params.metodo === "cash" || params.metodo === "transfer";

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md mx-auto text-center">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <CheckCircleIcon className="h-6 w-6 text-green-600" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {isOffline ? "Pedido registrado" : "Pago recibido"}
          </h1>

          {pedido && (
            <p className="text-lg font-semibold text-gray-900 mb-2">
              Pedido #{pedido}
            </p>
          )}

          <p className="text-gray-600 mb-6">
            {isOffline
              ? "Quedó anotado. Coordinamos el pago por WhatsApp. Si tenés cuenta, el seguimiento aparece en Mis pedidos."
              : "El pago quedó registrado. Si tenés cuenta con el mismo email, vas a ver el pedido en Mis pedidos."}
          </p>

          <div className="space-y-3">
            <Link
              href="/cuenta/pedidos"
              className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-orange-700 transition-colors block"
            >
              Ver mis pedidos
            </Link>
            <Link
              href="/productos"
              className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors block"
            >
              Seguir comprando
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
