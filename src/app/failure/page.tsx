import Link from 'next/link';
import { XCircleIcon } from '@heroicons/react/24/outline';

export default function FailurePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <XCircleIcon className="h-6 w-6 text-red-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Pago Fallido
          </h1>
          
          <p className="text-gray-600 mb-6">
            Hubo un problema al procesar tu pago. Por favor, intenta nuevamente 
            o contacta con nuestro servicio al cliente.
          </p>
          
          <div className="space-y-3">
            <Link
              href="/carrito"
              className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-orange-700 transition-colors block"
            >
              Intentar Nuevamente
            </Link>
            
            <Link
              href="/"
              className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors block"
            >
              Volver al Inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
