import Link from 'next/link';
import { PhoneIcon, EnvelopeIcon, MapPinIcon } from '@heroicons/react/24/outline';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <div className="text-3xl font-bold text-orange-500">🏗️</div>
              <span className="ml-2 text-xl font-bold">Barraca Construcción</span>
            </div>
            <p className="text-gray-300 mb-4">
              Tu proveedor confiable de materiales de construcción y metalúrgica en Uruguay. 
              Calidad, precio y servicio desde 1995.
            </p>
            <div className="space-y-2">
              <div className="flex items-center text-gray-300">
                <PhoneIcon className="h-5 w-5 mr-2 text-orange-500" />
                <span>+598 2 123 4567</span>
              </div>
              <div className="flex items-center text-gray-300">
                <EnvelopeIcon className="h-5 w-5 mr-2 text-orange-500" />
                <span>info@barraca.com.uy</span>
              </div>
              <div className="flex items-start text-gray-300">
                <MapPinIcon className="h-5 w-5 mr-2 text-orange-500 mt-0.5" />
                <span>Av. 18 de Julio 1234, Montevideo, Uruguay</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-300 hover:text-orange-500 transition-colors">
                  Inicio
                </Link>
              </li>
              <li>
                <Link href="/productos" className="text-gray-300 hover:text-orange-500 transition-colors">
                  Productos
                </Link>
              </li>
              <li>
                <Link href="/productos/construccion" className="text-gray-300 hover:text-orange-500 transition-colors">
                  Construcción
                </Link>
              </li>
              <li>
                <Link href="/productos/metalurgica" className="text-gray-300 hover:text-orange-500 transition-colors">
                  Metalúrgica
                </Link>
              </li>
              <li>
                <Link href="/productos/herramientas" className="text-gray-300 hover:text-orange-500 transition-colors">
                  Herramientas
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Categorías</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/productos/electricidad" className="text-gray-300 hover:text-orange-500 transition-colors">
                  Electricidad
                </Link>
              </li>
              <li>
                <Link href="/productos/plomeria" className="text-gray-300 hover:text-orange-500 transition-colors">
                  Plomería
                </Link>
              </li>
              <li>
                <Link href="/carrito" className="text-gray-300 hover:text-orange-500 transition-colors">
                  Carrito
                </Link>
              </li>
              <li>
                <Link href="/checkout" className="text-gray-300 hover:text-orange-500 transition-colors">
                  Checkout
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 Barraca Construcción. Todos los derechos reservados.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/terminos" className="text-gray-400 hover:text-orange-500 text-sm transition-colors">
                Términos y Condiciones
              </Link>
              <Link href="/privacidad" className="text-gray-400 hover:text-orange-500 text-sm transition-colors">
                Política de Privacidad
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
