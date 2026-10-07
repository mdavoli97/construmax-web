"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { LoaderFive } from "@/components/ui/loader";
import { Product, PriceGroup } from "@/types";
import ProductImage from "@/components/ProductImage";
import { cn } from "@/lib/utils";

interface SearchDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  inputRef?: React.RefObject<HTMLInputElement | null>;
}

export default function SearchDialog({
  open,
  setOpen,
  inputRef,
}: SearchDialogProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const localInputRef = useRef<HTMLInputElement>(null);
  const resolvedInputRef = inputRef ?? localInputRef;

  const [products, setProducts] = useState<Product[]>([]);
  const [priceGroups, setPriceGroups] = useState<PriceGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [categoriesRes, priceGroupsRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/price-groups"),
        ]);

        const [categoriesData, priceGroupsData] = await Promise.all([
          categoriesRes.json(),
          priceGroupsRes.json(),
        ]);

        const { productService } = await import("@/lib/services");

        const categorySlugs: string[] = categoriesData.success
          ? (categoriesData.data || [])
              .map(
                (c: { slug?: string; name?: string }) =>
                  c.slug || c.name?.toLowerCase()
              )
              .filter(Boolean)
          : ["construccion", "metalurgica", "herramientas", "herreria"];

        const allProducts: Product[] = [];
        for (const category of categorySlugs) {
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
      requestAnimationFrame(() => resolvedInputRef.current?.focus());
    }
  }, [open, resolvedInputRef]);

  useEffect(() => {
    if (!open) {
      setSearchTerm("");
      return;
    }

    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, setOpen]);

  const runCommand = useCallback(
    (command: () => unknown) => {
      setOpen(false);
      setSearchTerm("");
      command();
    },
    [setOpen]
  );

  const term = searchTerm.toLowerCase().trim();

  const filteredPriceGroups = term
    ? priceGroups.filter(
        (pg) =>
          pg.name.toLowerCase().includes(term) ||
          pg.description?.toLowerCase().includes(term)
      )
    : priceGroups;

  const filteredProducts =
    term.length > 0
      ? products
          .filter((product) => {
            if (!(product.stock > 0 || product.is_available)) return false;
            return (
              product.name.toLowerCase().includes(term) ||
              product.description?.toLowerCase().includes(term) ||
              product.sku.toLowerCase().includes(term)
            );
          })
          .slice(0, 10)
      : [];

  return (
    <div ref={containerRef} className="relative flex-1 min-w-0">
      <div
        className={cn(
          "flex items-center gap-3 h-10 px-3 lg:px-4",
          "text-sm bg-white rounded-full border transition-all",
          open
            ? "border-orange-300 shadow-sm ring-2 ring-orange-100"
            : "border-gray-200 hover:border-orange-300"
        )}
      >
        <MagnifyingGlassIcon className="h-5 w-5 shrink-0 text-gray-400" />
        <input
          ref={resolvedInputRef}
          type="search"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            if (!open) setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Buscar productos"
          className="flex-1 min-w-0 bg-transparent text-sm font-medium text-gray-800 placeholder:text-gray-500 outline-none"
          autoComplete="off"
        />
        <kbd className="hidden xl:inline-flex items-center rounded-md border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10px] font-medium text-gray-400">
          Ctrl K
        </kbd>
      </div>

      {open && (
        <div
          className={cn(
            "absolute left-0 right-0 top-[calc(100%+6px)] z-[80]",
            "overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl"
          )}
        >
          <Command
            shouldFilter={false}
            className="rounded-xl"
          >
            <CommandList className="max-h-[min(420px,60vh)]">
              <CommandEmpty>
                {loading ? (
                  <div className="flex items-center justify-center py-6">
                    <LoaderFive text="Buscando..." />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6">
                    <MagnifyingGlassIcon className="h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">
                      {term
                        ? "No se encontraron resultados"
                        : "Escribí para buscar productos"}
                    </p>
                  </div>
                )}
              </CommandEmpty>

              {!loading && filteredPriceGroups.length > 0 && (
                <CommandGroup heading="Subcategorías">
                  {filteredPriceGroups.slice(0, 8).map((priceGroup) => {
                    const groupProducts = products.filter(
                      (product) => product.price_group_id === priceGroup.id
                    );
                    const firstProduct = groupProducts[0];

                    return (
                      <CommandItem
                        key={`pricegroup-${priceGroup.id}`}
                        value={`subcategoria ${priceGroup.name} ${priceGroup.description || ""}`}
                        onSelect={() => {
                          runCommand(() =>
                            router.push(
                              `/productos/${priceGroup.category}/${priceGroup.id}`
                            )
                          );
                        }}
                        className="flex items-center gap-3 cursor-pointer"
                      >
                        <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                          {firstProduct?.primary_image ? (
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
                        <div className="flex flex-col flex-1 min-w-0">
                          <span className="font-medium truncate">
                            {priceGroup.name}
                          </span>
                          <span className="text-sm text-gray-500 truncate">
                            {priceGroup.description}
                          </span>
                        </div>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              )}

              {!loading && filteredProducts.length > 0 && (
                <CommandGroup heading="Productos">
                  {filteredProducts.map((product) => (
                    <CommandItem
                      key={`product-${product.id}`}
                      value={`producto ${product.name} ${product.description} ${product.sku}`}
                      onSelect={() => {
                        runCommand(() => {
                          const searchParams = new URLSearchParams();
                          searchParams.set("productId", product.id);
                          searchParams.set("productName", product.name);
                          if (product.thickness)
                            searchParams.set("thickness", product.thickness);
                          if (product.size)
                            searchParams.set("size", product.size);

                          const targetUrl = product.price_group_id
                            ? `/productos/${product.category}/${
                                product.price_group_id
                              }?${searchParams.toString()}`
                            : `/productos/${product.category}/${product.id}`;
                          router.push(targetUrl);
                        });
                      }}
                      className="flex items-center gap-3 cursor-pointer"
                    >
                      <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden shrink-0">
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
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="font-medium line-clamp-1">
                          {product.name}
                        </span>
                        <span className="text-sm text-gray-500">
                          SKU: {product.sku}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </div>
      )}
    </div>
  );
}
