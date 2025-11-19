"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SubcategoryCard from "@/components/SubcategoryCard";
import { Product, Category, PriceGroup, ProductGroup } from "@/types";

interface FeaturedSubcategoriesProps {
  products: Product[];
  categories: Category[];
}

export default function FeaturedSubcategories({
  products,
  categories,
}: FeaturedSubcategoriesProps) {
  const router = useRouter();
  const [allPriceGroups, setAllPriceGroups] = useState<PriceGroup[]>([]);
  const [productGroups, setProductGroups] = useState<ProductGroup[]>([]);
  const [loading, setLoading] = useState(true);

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

    // Limitar a los primeros 8 grupos para la landing
    setProductGroups(groups.slice(0, 8));
  };

  const handleSubcategoryClick = (priceGroup: PriceGroup) => {
    router.push(`/productos/${priceGroup.category}/${priceGroup.id}`);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse"
          >
            <div className="aspect-square bg-gray-200"></div>
            <div className="p-4">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {productGroups.map((group) => (
        <SubcategoryCard
          key={group.priceGroup.id}
          priceGroup={group.priceGroup}
          products={group.products}
          category={group.priceGroup.category || "sin-categoria"}
          onClick={() => handleSubcategoryClick(group.priceGroup)}
        />
      ))}
    </div>
  );
}
