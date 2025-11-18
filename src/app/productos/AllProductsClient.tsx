"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SubcategoryCard from "@/components/SubcategoryCard";
import { Product, Category, PriceGroup, ProductGroup } from "@/types";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

interface AllProductsClientProps {
  products: Product[];
  categories: Category[];
}

export default function AllProductsClient({
  products,
  categories,
}: AllProductsClientProps) {
  const router = useRouter();
  const [allPriceGroups, setAllPriceGroups] = useState<PriceGroup[]>([]);
  const [productGroups, setProductGroups] = useState<ProductGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadAllPriceGroups();
  }, []);

  useEffect(() => {
    organizeProducts();
  }, [products, allPriceGroups]);

  const loadAllPriceGroups = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/price-groups");
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setAllPriceGroups(result.data);
        }
      }
    } catch (error) {
      console.error("Error loading price groups:", error);
    } finally {
      setLoading(false);
    }
  };

  const organizeProducts = () => {
    // Crear grupos para todas las subcategorías
    const groups: ProductGroup[] = [];

    allPriceGroups.forEach((priceGroup) => {
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

    // Organizar productos sin grupo por categoría
    categories.forEach((category) => {
      const productsWithoutGroup = products.filter(
        (product) =>
          !product.price_group_id && product.category === category.slug
      );

      if (productsWithoutGroup.length > 0) {
        groups.push({
          priceGroup: {
            id: `ungrouped-${category.slug}`,
            name: `Otros productos - ${category.name}`,
            description: `Productos sin grupo de precio específico en ${category.name}`,
            price_per_kg: 0,
            currency: "USD",
            category: category.slug as
              | "construccion"
              | "metalurgica"
              | "herramientas"
              | "herreria",
            is_active: true,
            created_at: "",
            updated_at: "",
          },
          products: productsWithoutGroup,
        });
      }
    });

    setProductGroups(groups);
  };

  const handleSubcategoryClick = (priceGroup: PriceGroup) => {
    router.push(`/productos/${priceGroup.category}/${priceGroup.id}`);
  };

  const groupProductsByCategory = () => {
    const grouped: { [key: string]: ProductGroup[] } = {};

    // Filtrar grupos por término de búsqueda
    const filteredGroups = productGroups.filter((group) => {
      if (!searchTerm.trim()) return true;

      const searchLower = searchTerm.toLowerCase().trim();
      return (
        group.priceGroup.name.toLowerCase().includes(searchLower) ||
        (group.priceGroup.description &&
          group.priceGroup.description.toLowerCase().includes(searchLower))
      );
    });

    filteredGroups.forEach((group) => {
      const categoryName =
        categories.find((c) => c.slug === group.priceGroup.category)?.name ||
        group.priceGroup.category ||
        "Sin categoría";
      if (!grouped[categoryName]) {
        grouped[categoryName] = [];
      }
      grouped[categoryName].push(group);
    });

    return grouped;
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner className="size-8 text-orange-600" />
      </div>
    );
  }

  const groupedByCategory = groupProductsByCategory();

  return (
    <div className="mt-12 sm:mt-16">
      <div className="mb-6 sm:mb-8">
        {/* Buscador de subcategorías */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full"
            />
          </div>
          {searchTerm.trim() && (
            <div className="mt-3">
              <p className="text-sm text-gray-600">
                {Object.values(groupedByCategory).flat().length} subcategoría
                {Object.values(groupedByCategory).flat().length !== 1
                  ? "s"
                  : ""}{" "}
                encontrada
                {Object.values(groupedByCategory).flat().length !== 1
                  ? "s"
                  : ""}
              </p>
            </div>
          )}
        </div>
      </div>

      {Object.keys(groupedByCategory).length === 0 ? (
        <div className="text-center py-8">
          {searchTerm.trim() ? (
            <>
              <div className="text-4xl sm:text-6xl mb-4">🔍</div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                No se encontraron subcategorías
              </h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Intenta con otros términos de búsqueda
              </p>
            </>
          ) : (
            <p className="text-gray-500">No hay subcategorías disponibles.</p>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedByCategory).map(([categoryName, groups]) => (
            <div key={categoryName} className="space-y-4">
              {/* Título de la categoría */}
              <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                {categoryName}
              </h3>

              {/* Grid de subcategorías */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {groups.map((group) => (
                  <SubcategoryCard
                    key={group.priceGroup.id}
                    priceGroup={group.priceGroup}
                    products={group.products}
                    category={group.priceGroup.category || "sin-categoria"}
                    onClick={() => handleSubcategoryClick(group.priceGroup)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
