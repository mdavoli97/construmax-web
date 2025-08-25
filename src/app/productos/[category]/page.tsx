import { notFound } from "next/navigation";
import { productService, categoryService } from "@/lib/services";
import ProductCard from "@/components/ProductCard";

// Forzar revalidación en cada request
export const revalidate = 0;

interface CategoryPageProps {
  params: Promise<{
    category: string;
  }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;

  // Obtener datos de la base de datos
  const [categories, products] = await Promise.all([
    categoryService.getAll(),
    productService.getByCategory(category),
  ]);

  // Verificar si la categoría existe
  const categoryExists = categories.find((cat) => cat.slug === category);
  if (!categoryExists) {
    notFound();
  }

  const categoryInfo = categories.find((cat) => cat.slug === category);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <span className="text-4xl mr-4">{categoryInfo?.icon}</span>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {categoryInfo?.name}
              </h1>
              <p className="text-gray-600">{categoryInfo?.description}</p>
            </div>
          </div>
        </div>

        {/* Products Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            {products.length} producto{products.length !== 1 ? "s" : ""} en esta
            categoría
          </p>
        </div>

        {/* Products Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No hay productos en esta categoría
            </h3>
            <p className="text-gray-600">
              Pronto agregaremos productos a esta categoría
            </p>
          </div>
        )}

        {/* Other Categories */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Otras Categorías
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories
              .filter((cat) => cat.slug !== category)
              .map((cat) => (
                <a
                  key={cat.id}
                  href={`/productos/${cat.slug}`}
                  className="p-4 rounded-lg border-2 border-gray-200 hover:border-orange-300 transition-colors text-center"
                >
                  <div className="text-2xl mb-2">{cat.icon}</div>
                  <div className="text-sm font-medium text-gray-900">
                    {cat.name}
                  </div>
                </a>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
