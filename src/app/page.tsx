import Link from "next/link";
import Image from "next/image";
import { categoryService, productService } from "@/lib/services";
import FeaturedSubcategories from "@/components/FeaturedSubcategories";
import StructuredData from "@/components/StructuredData";
import TypingText from "@/components/ui/shadcn-io/typing-text";
import {
  organizationSchema,
  localBusinessSchema,
  websiteSchema,
  siteNavigationSchema,
} from "@/lib/schemas";
import {
  TruckIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

// Forzar revalidación en cada request para productos destacados
export const revalidate = 0;

export default async function HomePage() {
  const [categories, products] = await Promise.all([
    categoryService.getAll(),
    productService.getAll(),
  ]);

  return (
    <div className="min-h-screen">
      {/* Structured Data */}
      <StructuredData
        data={[
          organizationSchema,
          localBusinessSchema,
          websiteSchema,
          siteNavigationSchema,
        ]}
      />

      {/* Hero Section */}
      <section className="bg-white text-gray-900 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Content Column */}
            <div className="text-center lg:text-left md:min-h-[7rem]">
              <TypingText
                text={[
                  "ConstruMax",
                  "Materiales de Construcción",
                  "Barraca de Hierros",
                ]}
                as="h1"
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 text-orange-600"
                typingSpeed={100}
                pauseDuration={2000}
                deletingSpeed={50}
                loop={true}
                showCursor={true}
                cursorCharacter="|"
                cursorClassName="text-orange-600"
              />
              <p className="text-lg sm:text-xl md:text-2xl mb-6 sm:mb-8 text-gray-600 max-w-3xl lg:max-w-none mx-auto lg:mx-0 px-4 lg:px-0">
                Encontrá los mejores precios del mercado.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start items-center px-4 lg:px-0 mt-6">
                <Link
                  href="/productos"
                  className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-orange-600 bg-white border border-orange-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  Nuestros Productos
                </Link>

                <Link
                  href="/productos/construccion"
                  className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-orange-600 bg-white border border-orange-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  Construcción
                </Link>

                <Link
                  href="/productos/metalurgica"
                  className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-orange-600 bg-white border border-orange-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  Metalúrgica
                </Link>
              </div>
            </div>

            {/* Image Column */}
            <div className="relative order-first lg:order-last hidden lg:flex">
              <div className="relative z-10">
                <Image
                  src="/hero-section.png"
                  alt="ConstruMax - Materiales de construcción y metalúrgica"
                  className="w-full h-auto scale-110 lg:scale-125 mx-auto object-contain"
                  width={800}
                  height={600}
                  priority
                />
              </div>
              {/* Optional decorative background */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-400/20 to-orange-800/20 rounded-2xl -z-10 transform rotate-6"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Subcategories Section */}
      <section className="py-16 px-2 sm:px-0 sm:py-20 bg-gradient-to-br from-gray-50 via-white to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-4">
              Especialidades en Construcción y Metalúrgica
            </h2>
            <p className="sm:text-lg text-gray-600 max-w-2xl mx-auto">
              Descubre nuestra amplia gama de productos especializados para
              todos tus proyectos
            </p>
          </div>
          <FeaturedSubcategories products={products} categories={categories} />
          <div className="text-center mt-12 sm:mt-16">
            <Link
              href="/productos"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-orange-600 bg-white border border-orange-200 rounded-xl hover:border-orange-300 hover:bg-orange-50 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Ver Todos los Productos
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-white via-orange-50/30 to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              ¿Por qué elegir ConstruMax?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Ofrecemos la mejor experiencia en materiales de construcción
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="text-center bg-white rounded-xl shadow-md border-2 border-gray-200 p-6 hover:shadow-xl hover:border-orange-300 transition-all duration-300 group">
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <TruckIcon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-gray-900 group-hover:text-orange-600 transition-colors duration-300">
                Envío Gratis
              </h3>
              <p className="text-gray-600 text-sm sm:text-base">
                En compras superiores a $50.000
              </p>
            </div>
            <div className="text-center bg-white rounded-xl shadow-md border-2 border-gray-200 p-6 hover:shadow-xl hover:border-orange-300 transition-all duration-300 group">
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <ShieldCheckIcon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-gray-900 group-hover:text-orange-600 transition-colors duration-300">
                Garantía
              </h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Todos nuestros productos con garantía
              </p>
            </div>
            <div className="text-center bg-white rounded-xl shadow-md border-2 border-gray-200 p-6 hover:shadow-xl hover:border-orange-300 transition-all duration-300 group">
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <CurrencyDollarIcon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-gray-900 group-hover:text-orange-600 transition-colors duration-300">
                Mejor Precio
              </h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Precios competitivos en el mercado
              </p>
            </div>
            <div className="text-center bg-white rounded-xl shadow-md border-2 border-gray-200 p-6 hover:shadow-xl hover:border-orange-300 transition-all duration-300 group">
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <ClockIcon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-gray-900 group-hover:text-orange-600 transition-colors duration-300">
                Entrega Rápida
              </h3>
              <p className="text-gray-600 text-sm sm:text-base">
                En 24-48 horas en Montevideo
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-gray-50 via-white to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Categorías de Productos
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Explora nuestra amplia variedad de productos organizados por
              categorías
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/productos/${category.slug}`}
                className="group block"
              >
                <div className="bg-white rounded-lg shadow-md border-2 border-gray-200 p-4 hover:shadow-xl hover:border-orange-300 transition-all duration-300 group-hover:scale-105">
                  <div className="text-2xl sm:text-3xl mb-3 transform group-hover:scale-110 transition-transform duration-300">
                    {category.icon}
                  </div>
                  <h3 className="text-base sm:text-lg font-bold mb-2 group-hover:text-orange-600 transition-colors duration-300 text-gray-900">
                    {category.name}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {category.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section
        id="contacto"
        className="py-16 sm:py-20 bg-gradient-to-br from-white via-orange-50/30 to-gray-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Contáctanos
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Estamos aquí para ayudarte con tu proyecto de construcción
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center bg-white rounded-lg shadow-md border-2 border-gray-200 p-5 hover:shadow-xl hover:border-orange-300 transition-all duration-300 group">
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <span className="text-white text-lg">📞</span>
              </div>
              <h3 className="text-base font-bold mb-2 text-gray-900 group-hover:text-orange-600 transition-colors duration-300">
                Teléfono
              </h3>
              <p className="text-gray-600 font-medium">+598 97971111</p>
            </div>
            <div className="text-center bg-white rounded-lg shadow-md border-2 border-gray-200 p-5 hover:shadow-xl hover:border-orange-300 transition-all duration-300 group">
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <span className="text-white text-lg">📍</span>
              </div>
              <h3 className="text-base font-bold mb-2 text-gray-900 group-hover:text-orange-600 transition-colors duration-300">
                Ubicación
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                José Mármol 615
                <br />
                Montevideo, Uruguay
              </p>
            </div>
            <div className="text-center bg-white rounded-lg shadow-md border-2 border-gray-200 p-5 hover:shadow-xl hover:border-orange-300 transition-all duration-300 group">
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <span className="text-white text-lg">🕐</span>
              </div>
              <h3 className="text-base font-bold mb-2 text-gray-900 group-hover:text-orange-600 transition-colors duration-300">
                Horarios
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Lun-Vie: 8:00-18:00
                <br />
                Sáb: 8:00-13:00
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-gray-50 via-white to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div className="order-2 lg:order-1">
              <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-gray-900">
                Sobre ConstruMax
              </h2>
              <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                Somos tu aliado de confianza en materiales de construcción,
                barraca de hierros y portland.
              </p>
              <p className="text-gray-600 mb-8 text-base leading-relaxed">
                Desde herramientas especializadas hasta materiales a granel,
                tenemos todo lo que necesitas para hacer realidad tu proyecto.
              </p>
              <Link
                href="/productos"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-orange-600 bg-white border border-orange-200 rounded-xl hover:border-orange-300 hover:bg-orange-50 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Conoce Nuestros Productos
              </Link>
            </div>
            <div className="order-1 lg:order-2">
              <div className="bg-gradient-to-br from-orange-500/10 via-white to-orange-600/10 rounded-xl h-48 sm:h-56 flex items-center justify-center border-2 border-orange-200/50 shadow-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-400/20 to-orange-600/20 rounded-xl transform rotate-6"></div>
                <span className="text-4xl sm:text-6xl relative z-10 transform hover:scale-110 transition-transform duration-300">
                  🏗️
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
