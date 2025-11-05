"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import SubcategoryCard from "@/components/SubcategoryCard";
import { Product, Category, PriceGroup, ProductGroup } from "@/types";

interface CategoryClientProps {
  category: string;
  categoryInfo: Category;
  categories: Category[];
  initialProducts: Product[];
}

export default function CategoryClient({
  category,
  categoryInfo,
  categories,
  initialProducts,
}: CategoryClientProps) {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [priceGroups, setPriceGroups] = useState<PriceGroup[]>([]);
  const [productGroups, setProductGroups] = useState<ProductGroup[]>([]);
  const [loading, setLoading] = useState(true); // Iniciar como true
  const [priceGroupsLoaded, setPriceGroupsLoaded] = useState(false); // Nueva bandera

  useEffect(() => {
    loadPriceGroups();
  }, [category]);

  useEffect(() => {
    organizeProducts();
  }, [products, priceGroups]);

  const loadPriceGroups = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/price-groups?category=${category}`);
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setPriceGroups(result.data);
        }
      }
    } catch (error) {
      console.error("Error loading price groups:", error);
    } finally {
      setLoading(false);
      setPriceGroupsLoaded(true); // Marcar como cargado
    }
  };

  const organizeProducts = () => {
    // Crear grupos para las subcategorías
    const groups: ProductGroup[] = [];

    priceGroups.forEach((priceGroup) => {
      const groupProducts = products.filter(
        (product) => product.price_group_id === priceGroup.id
      );

      if (groupProducts.length > 0) {
        groups.push({
          priceGroup,
          products: groupProducts,
        });
      }
    });

    // Agregar productos sin grupo de precio si existe alguno
    const productsWithoutGroup = products.filter(
      (product) => !product.price_group_id
    );

    if (productsWithoutGroup.length > 0) {
      groups.push({
        priceGroup: {
          id: "ungrouped",
          name: "Otros productos",
          description: "Productos sin grupo de precio específico",
          price_per_kg: 0,
          currency: "USD",
          category: categoryInfo.slug as any,
          is_active: true,
          created_at: "",
          updated_at: "",
        },
        products: productsWithoutGroup,
      });
    }

    setProductGroups(groups);
  };

  const handleSubcategoryClick = (subcategoryId: string) => {
    router.push(`/productos/${category}/${subcategoryId}`);
  };

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

        {/* Show subcategories as cards */}
        {productGroups.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
            {productGroups.map((group) => (
              <SubcategoryCard
                key={group.priceGroup.id}
                priceGroup={group.priceGroup}
                products={group.products}
                category={category}
                onClick={() => handleSubcategoryClick(group.priceGroup.id)}
              />
            ))}
          </div>
        )}

        {/* Show all products when no subcategories exist AND price groups have been loaded */}
        {priceGroupsLoaded &&
          productGroups.length === 0 &&
          products.length > 0 && (
            <div>
              <div className="mb-6">
                <p className="text-gray-600">
                  {products.length} producto{products.length !== 1 ? "s" : ""}{" "}
                  en esta categoría
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          )}

        {/* No products message */}
        {priceGroupsLoaded && products.length === 0 && (
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

        {/* Loading message */}
        {loading && (
          <div className="text-center py-12">
            <div className="text-2xl mb-4">⏳</div>
            <p className="text-gray-600">Cargando subcategorías...</p>
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
