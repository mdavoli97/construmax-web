"use client";

import { useEffect, useMemo, useState } from "react";
import { adminFetch } from "@/lib/admin-fetch";
import { Product } from "@/types";
import { toast } from "sonner";
import { LoaderFive } from "@/components/ui/loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function productLabel(product: Product) {
  const variant = [
    product.thickness,
    product.size,
    product.presentation,
    product.length,
  ]
    .filter((value) => value && value.trim())
    .join(" · ");
  return variant ? `${product.name} · ${variant}` : product.name;
}

export default function FeaturedProductsAdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      adminFetch("/api/admin/products").then((response) =>
        response.ok ? response.json() : []
      ),
      adminFetch("/api/admin/featured-products").then((response) =>
        response.ok ? response.json() : null
      ),
    ])
      .then(([productList, featured]) => {
        setProducts(Array.isArray(productList) ? productList : []);
        if (featured?.productIds) setSelectedIds(featured.productIds);
      })
      .finally(() => setLoading(false));
  }, []);

  const byId = useMemo(
    () => new Map(products.map((product) => [product.id, product])),
    [products]
  );

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (term.length < 2) return [];
    return products
      .filter((product) => {
        const haystack = [
          product.name,
          product.sku,
          product.thickness,
          product.size,
          product.presentation,
          product.length,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(term);
      })
      .slice(0, 12);
  }, [products, query]);

  const addProduct = (product: Product) => {
    if (selectedIds.includes(product.id)) return;
    if (selectedIds.length >= 8) {
      toast.error("Podés elegir hasta 8 productos");
      return;
    }
    setSelectedIds((current) => [...current, product.id]);
  };

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= selectedIds.length) return;
    const next = [...selectedIds];
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);
    setSelectedIds(next);
  };

  const save = async () => {
    setSaving(true);
    try {
      const response = await adminFetch("/api/admin/featured-products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productIds: selectedIds }),
      });
      const body = await response.json();
      if (!response.ok || !body.success) {
        throw new Error(body.error || "No se pudieron guardar");
      }
      setSelectedIds(body.productIds);
      toast.success("Productos de la portada guardados");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "No se pudieron guardar"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoaderFive text="Cargando productos..." />
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Productos de la portada
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Elegí hasta 8 productos puntuales. En el inicio se muestra cada
          artículo, con su medida, y no la familia completa.
        </p>
      </div>

      <div className="space-y-3">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar por nombre, medida o SKU"
        />
        {query.trim().length >= 2 && (
          <div className="rounded-lg border bg-white divide-y">
            {results.length === 0 ? (
              <p className="px-4 py-3 text-sm text-gray-500">
                No hay productos con esa búsqueda.
              </p>
            ) : (
              results.map((product) => {
                const selected = selectedIds.includes(product.id);
                return (
                  <div
                    key={product.id}
                    className="flex items-center justify-between gap-3 px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {productLabel(product)}
                      </p>
                      <p className="text-xs text-gray-500">{product.sku}</p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant={selected ? "outline" : "default"}
                      disabled={selected}
                      onClick={() => addProduct(product)}
                    >
                      {selected ? "Elegido" : "Agregar"}
                    </Button>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {selectedIds.length === 0 ? (
        <p className="text-sm text-gray-500">
          Todavía no elegiste productos para la portada.
        </p>
      ) : (
        <div className="space-y-3">
          {selectedIds.map((id, index) => {
            const product = byId.get(id);
            return (
              <div
                key={id}
                className="flex items-center gap-3 rounded-lg border bg-white p-3"
              >
                <span className="w-6 text-sm font-semibold text-gray-400">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {product ? productLabel(product) : "Producto eliminado"}
                  </p>
                  {product && (
                    <p className="text-xs text-gray-500">{product.sku}</p>
                  )}
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={index === 0}
                    onClick={() => move(index, -1)}
                  >
                    Subir
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={index === selectedIds.length - 1}
                    onClick={() => move(index, 1)}
                  >
                    Bajar
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() =>
                      setSelectedIds((current) =>
                        current.filter((item) => item !== id)
                      )
                    }
                  >
                    Quitar
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Button type="button" onClick={save} disabled={saving}>
        {saving ? "Guardando..." : "Guardar portada"}
      </Button>
    </div>
  );
}
