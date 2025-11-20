import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

export const metadata: Metadata = {
  title: "Acerca del Desarrollador | ConstruMax",
  description: "Información sobre el desarrollo de ConstruMax",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center text-orange-600 hover:text-orange-700 transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Volver al inicio
          </Link>
        </div>

        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="p-6 sm:p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              Acerca del Desarrollo
            </h1>

            <div className="space-y-6">
              <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-3">
                  Sobre el Proyecto
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  ConstruMax es una plataforma de e-commerce especializada en
                  materiales de construcción, desarrollada con tecnologías
                  modernas para brindar la mejor experiencia de usuario tanto a
                  clientes como administradores.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-3">
                  Tecnologías Utilizadas
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    Next.js 14
                  </span>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    TypeScript
                  </span>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                    Supabase
                  </span>
                  <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                    Tailwind CSS
                  </span>
                  <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
                    MercadoPago API
                  </span>
                  <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">
                    Cloudinary
                  </span>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-3">
                  Características Destacadas
                </h2>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Sistema completo de gestión de productos</li>
                  <li>Integración con metodo de pago para pagos seguros</li>
                  <li>Panel de administración intuitivo</li>
                  <li>Carrito de compras</li>
                  <li>Búsqueda avanzada de productos</li>
                  <li>Diseño responsive y optimizado para móviles</li>
                  <li>Integración con WhatsApp / Mail para consultas</li>
                </ul>
              </section>

              <section className="bg-orange-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-gray-800 mb-3">
                  Desarrollador
                </h2>
                <div className="space-y-3">
                  <p className="text-gray-700">
                    <strong>Nombre:</strong> Mauro Davoli
                  </p>
                  <p className="text-gray-700">
                    <strong>Especialidad:</strong> Desarrollo Full-Stack |
                    React/Next.js
                  </p>
                  <div className="flex flex-wrap gap-3 mt-4">
                    <a
                      href="mailto:mdavoli97@gmail.com"
                      className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
                    >
                      Contactar por Email
                    </a>
                    <a
                      href="https://linkedin.com/in/mauro-davoli/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      LinkedIn
                    </a>
                    <a
                      href="tel:+598 98 583 191"
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Llamar por Teléfono +598 98 583 191
                    </a>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-3">
                  ¿Necesitas un desarrollo similar?
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  Si estás interesado en desarrollar una plataforma de
                  e-commerce personalizada o necesitas servicios de desarrollo
                  web, no dudes en contactarme. Especializado en crear
                  soluciones escalables y eficientes.
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
