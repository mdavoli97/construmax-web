import { productService, categoryService } from '@/lib/services';
import ProductSearch from '@/components/ProductSearch';

// Forzar revalidación en cada request
export const revalidate = 0;

export default async function ProductosPage() {
  const [products, categories] = await Promise.all([
    productService.getAll(),
    categoryService.getAll()
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Nuestros Productos</h1>
          <p className="text-gray-600">
            Encuentra todo lo que necesitas para tu proyecto de construcción
          </p>
        </div>

        <ProductSearch products={products} categories={categories} />

                 {/* Categories Quick Links */}
         <div className="mt-16">
           <h2 className="text-2xl font-bold text-gray-900 mb-6">Explorar por Categoría</h2>
           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
             {categories.map((category) => (
               <a
                 key={category.id}
                 href={`/productos/${category.slug}`}
                 className="p-4 rounded-lg border-2 border-gray-200 hover:border-orange-300 transition-colors text-center"
               >
                 <div className="text-2xl mb-2">{category.icon}</div>
                 <div className="text-sm font-medium text-gray-900">{category.name}</div>
               </a>
             ))}
           </div>
         </div>
      </div>
    </div>
  );
}
