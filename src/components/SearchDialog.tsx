"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Product, PriceGroup } from "@/types";
import ProductImage from "@/components/ProductImage";

interface SearchDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function SearchDialog({ open, setOpen }: SearchDialogProps) {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [priceGroups, setPriceGroups] = useState<PriceGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const [priceGroupsRes] = await Promise.all([
          fetch("/api/price-groups"),
        ]);

        const [priceGroupsData] = await Promise.all([priceGroupsRes.json()]);

        // Cargar productos con dimensiones usando el servicio
        const { productService } = await import("@/lib/services");

        // Cargar productos de todas las categorías con dimensiones
        const allProducts = [];
        const categories = [
          "construccion",
          "metalurgica",
          "herramientas",
          "herreria",
        ];

        for (const category of categories) {
          try {
            const categoryProducts =
              await productService.getByCategoryWithDimensions(category);
            allProducts.push(...categoryProducts);
          } catch (error) {
            console.error(
              `Error loading products for category ${category}:`,
              error
            );
          }
        }

        setProducts(allProducts);
        setPriceGroups(priceGroupsData.success ? priceGroupsData.data : []);
      } catch (error) {
        console.error("Error loading search data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      loadData();
    }
  }, [open]);

  const runCommand = useCallback(
    (command: () => unknown) => {
      setOpen(false);
      setSearchTerm(""); // Limpiar búsqueda al cerrar
      command();
    },
    [setOpen]
  );

  // Limpiar búsqueda cuando se cierra el dialog
  useEffect(() => {
    if (!open) {
      setSearchTerm("");
    }
  }, [open]);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        placeholder="Buscar productos o subcategorías..."
        className="h-12"
        value={searchTerm}
        onValueChange={setSearchTerm}
      />
      <CommandList className="max-h-[400px]">
        <CommandEmpty>
          {loading ? (
            <div className="flex items-center justify-center py-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6">
              <MagnifyingGlassIcon className="h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">
                No se encontraron resultados
              </p>
            </div>
          )}
        </CommandEmpty>

        {!loading && priceGroups.length > 0 && (
          <CommandGroup heading="Subcategorías">
            {priceGroups.length > 0 &&
              priceGroups.map((priceGroup) => {
                // Obtener productos de este grupo de precios
                const groupProducts = products.filter(
                  (product) => product.price_group_id === priceGroup.id
                );
                const firstProduct = groupProducts[0];

                return (
                  <CommandItem
                    key={`pricegroup-${priceGroup.id}`}
                    value={`subcategoria ${priceGroup.name} ${priceGroup.description}`}
                    onSelect={() => {
                      runCommand(() =>
                        router.push(
                          `/productos/${priceGroup.category}/${priceGroup.id}`
                        )
                      );
                    }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                      {firstProduct && firstProduct.primary_image ? (
                        <ProductImage
                          src={firstProduct.primary_image}
                          alt={firstProduct.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <span className="text-orange-600 text-sm font-semibold">
                            {priceGroup.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col flex-1">
                      <span className="font-medium">{priceGroup.name}</span>
                      <span className="text-sm text-gray-500">
                        {priceGroup.description}
                      </span>
                    </div>
                  </CommandItem>
                );
              })}
          </CommandGroup>
        )}

        {!loading && products.length > 0 && searchTerm.trim().length > 0 && (
          <CommandGroup heading="Productos">
            {products
              .filter((product) => {
                // Filtrar por disponibilidad
                if (!(product.stock > 0 || product.is_available)) return false;

                // Filtrar por término de búsqueda
                const searchLower = searchTerm.toLowerCase().trim();
                return (
                  product.name.toLowerCase().includes(searchLower) ||
                  product.description?.toLowerCase().includes(searchLower) ||
                  product.sku.toLowerCase().includes(searchLower)
                );
              })
              .slice(0, 10) // Limitar a 10 productos para no saturar
              .map((product) => {
                return (
                  <CommandItem
                    key={`product-${product.id}`}
                    value={`producto ${product.name} ${product.description} ${product.sku}`}
                    onSelect={() => {
                      runCommand(() => {
                        // Crear search params con los detalles del producto
                        const searchParams = new URLSearchParams();
                        searchParams.set("productId", product.id);
                        searchParams.set("productName", product.name);
                        if (product.thickness)
                          searchParams.set("thickness", product.thickness);
                        if (product.size)
                          searchParams.set("size", product.size);

                        // Navegar al grupo de precios con los search params
                        const targetUrl = product.price_group_id
                          ? `/productos/${product.category}/${
                              product.price_group_id
                            }?${searchParams.toString()}`
                          : `/productos/${product.category}/${product.id}`;
                        router.push(targetUrl);
                      });
                    }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden">
                      {product.primary_image ? (
                        <img
                          src={product.primary_image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-400 text-xs">📦</span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col flex-1">
                      <span className="font-medium line-clamp-1">
                        {product.name}
                      </span>
                      <span className="text-sm text-gray-500">
                        SKU: {product.sku}
                      </span>
                    </div>
                  </CommandItem>
                );
              })}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
