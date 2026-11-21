import Link from "next/link";
import { ClockIcon } from "@heroicons/react/24/outline";

export default async function PendingPage({
  searchParams,
}: {
  searchParams: Promise<{ payment?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md mx-auto text-center">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
            <ClockIcon className="h-6 w-6 text-yellow-600" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Pago pendiente
          </h1>

          <p className="text-gray-600 mb-6">
            Mercado Pago todavía está procesando el pago. Cuando se acredite,
            el pedido pasa a confirmado en tu cuenta.
            {params.payment ? ` Referencia ${params.payment}.` : ""}
          </p>

          <div className="space-y-3">
            <Link
              href="/cuenta/pedidos"
              className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-orange-700 transition-colors block"
            >
              Ver mis pedidos
            </Link>
            <Link
              href="/"
              className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors block"
            >
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
