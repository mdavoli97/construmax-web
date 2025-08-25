import Link from "next/link";
import { categoryService, productService } from "@/lib/services";
import ProductCard from "@/components/ProductCard";
import {
  TruckIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

// Forzar revalidación en cada request para productos destacados
export const revalidate = 0;

export default async function HomePage() {
  const [categories, featuredProducts] = await Promise.all([
    categoryService.getAll(),
    productService.getFeatured(),
  ]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-orange-600 to-orange-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6">
              Materiales de Construcción
              <span className="block text-orange-200">y Metalúrgica</span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl mb-6 sm:mb-8 text-orange-100 max-w-3xl mx-auto px-4">
              Tu proveedor confiable en Uruguay. Calidad, precio y servicio
              desde 1995.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4">
              <Link
                href="/productos"
                className="w-full sm:w-auto bg-white text-orange-600 px-6 sm:px-8 py-3 rounded-lg font-semibold hover:bg-orange-50 transition-colors text-center"
              >
                Ver Productos
              </Link>
              <Link
                href="/productos/construccion"
                className="w-full sm:w-auto border-2 border-white text-white px-6 sm:px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-orange-600 transition-colors text-center"
              >
                Construcción
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">
            Productos Destacados
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="text-center mt-8 sm:mt-12">
            <Link
              href="/productos"
              className="inline-block bg-orange-600 text-white px-6 sm:px-8 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
            >
              Ver Todos los Productos
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <TruckIcon className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Envío Gratis</h3>
              <p className="text-gray-600 text-sm sm:text-base">
                En compras superiores a $50.000
              </p>
            </div>
            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheckIcon className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Garantía</h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Todos nuestros productos con garantía
              </p>
            </div>
            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <CurrencyDollarIcon className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Mejor Precio</h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Precios competitivos en el mercado
              </p>
            </div>
            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <ClockIcon className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Entrega Rápida</h3>
              <p className="text-gray-600 text-sm sm:text-base">
                En 24-48 horas en Montevideo
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">
            Nuestras Categorías
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/productos/${category.slug}`}
                className="group block"
              >
                <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 hover:shadow-lg transition-shadow border border-gray-200">
                  <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">
                    {category.icon}
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-2 group-hover:text-orange-600 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-gray-600 text-sm sm:text-base">
                    {category.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-12 sm:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div className="order-2 lg:order-1">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">
                Sobre Nosotros
              </h2>
              <p className="text-gray-600 mb-4 text-sm sm:text-base">
                Con más de 25 años de experiencia en el mercado uruguayo, somos
                tu proveedor confiable de materiales de construcción y
                metalúrgica.
              </p>
              <p className="text-gray-600 mb-6 text-sm sm:text-base">
                Ofrecemos una amplia gama de productos de calidad, desde cemento
                y hierros hasta herramientas y materiales eléctricos, siempre
                con los mejores precios y un servicio excepcional.
              </p>
              <Link
                href="/productos"
                className="inline-block bg-orange-600 text-white px-4 sm:px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors text-sm sm:text-base"
              >
                Conoce Nuestros Productos
              </Link>
            </div>
            <div className="order-1 lg:order-2 bg-gray-200 rounded-lg h-48 sm:h-64 flex items-center justify-center">
              <span className="text-4xl sm:text-6xl">🏗️</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
