import Link from "next/link";
import {
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Company Info */}
          <div className="col-span-1 sm:col-span-2">
            <div className="flex items-center mb-4">
              <div className="text-2xl sm:text-3xl font-bold text-orange-500">
                🏗️
              </div>
              <span className="ml-2 text-lg sm:text-xl font-bold">
                ConstruMax
              </span>
            </div>
            <p className="text-gray-300 mb-4 text-sm sm:text-base">
              Materiales de construcción, barraca de hierros, portland. Encontrá
              los mejores precios del mercado en ConstruMax.
            </p>
            <div className="space-y-2">
              <div className="flex items-center text-gray-300 text-sm sm:text-base">
                <PhoneIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-orange-500 flex-shrink-0" />
                <span>+598 97 971 111</span>
              </div>
              <div className="flex items-center text-gray-300 text-sm sm:text-base">
                <EnvelopeIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-orange-500 flex-shrink-0" />
                <span>curlamsas@gmail.com.uy</span>
              </div>
              <div className="flex items-start text-gray-300 text-sm sm:text-base">
                <MapPinIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-orange-500 mt-0.5 flex-shrink-0" />
                <span>José Mármol 615, Montevideo, Uruguay</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">
              Enlaces Rápidos
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-gray-300 hover:text-orange-500 transition-colors text-sm sm:text-base"
                >
                  Inicio
                </Link>
              </li>
              <li>
                <Link
                  href="/productos"
                  className="text-gray-300 hover:text-orange-500 transition-colors text-sm sm:text-base"
                >
                  Productos
                </Link>
              </li>
              <li>
                <Link
                  href="/productos/construccion"
                  className="text-gray-300 hover:text-orange-500 transition-colors text-sm sm:text-base"
                >
                  Construcción
                </Link>
              </li>
              <li>
                <Link
                  href="/productos/metalurgica"
                  className="text-gray-300 hover:text-orange-500 transition-colors text-sm sm:text-base"
                >
                  Metalúrgica
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">
              Categorías
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/productos/construccion"
                  className="text-gray-300 hover:text-orange-500 transition-colors text-sm sm:text-base"
                >
                  Construcción
                </Link>
              </li>
              <li>
                <Link
                  href="/productos/metalurgica"
                  className="text-gray-300 hover:text-orange-500 transition-colors text-sm sm:text-base"
                >
                  Metalúrgica
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-6 sm:mt-8 pt-6 sm:pt-8">
          <div className="text-center">
            <p className="text-gray-400 text-xs sm:text-sm">
              CONSTRUMAX 2024 © - Desarrollado y gestionado por{" "}
              <Link
                href="/about"
                target="_blank"
                className="text-gray-300 hover:text-orange-400 transition-colors"
              >
                MDEV
              </Link>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
