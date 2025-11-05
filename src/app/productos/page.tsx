import { productService, categoryService } from "@/lib/services";
import ProductSearch from "@/components/ProductSearch";
import AllProductsClient from "./AllProductsClient";

// Forzar revalidación en cada request
export const revalidate = 0;

export default async function ProductosPage() {
  const [products, categories] = await Promise.all([
    productService.getAll(),
    categoryService.getAll(),
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Nuestros Productos
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Encuentra todo lo que necesitas para tu proyecto de construcción
          </p>
        </div>

        {/* All Subcategories */}
        <AllProductsClient products={products} categories={categories} />
      </div>
    </div>
  );
}
