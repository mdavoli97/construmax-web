"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { productService } from "@/lib/services";
import { Product } from "@/types";
import { PlusIcon, PencilIcon, TrashIcon, SearchIcon } from "lucide-react";
import { useNotifications } from "@/components/admin/NotificationProvider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export default function ProductsAdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>(
    undefined
  );
  const [stockFilter, setStockFilter] = useState<string | undefined>(undefined);
  const { success, error } = useNotifications();

  const categories = [
    "construccion",
    "metalurgica",
    "herramientas",
    "herreria",
  ];

  // Función para obtener metadata del producto
  const getProductMetadata = (product: Product) => {
    try {
      if (
        product.description?.startsWith("{") ||
        product.description?.startsWith("[")
      ) {
        const parsed = JSON.parse(product.description);
        return parsed.meta || parsed;
      }
      return null;
    } catch (error) {
      return null;
    }
  };

  // Función para obtener el estado del stock
  const getStockStatus = (product: Product) => {
    // Usar campos directos de la base de datos si están disponibles
    if (
      (product.product_type === "perfiles" ||
        product.product_type === "chapas_conformadas") &&
      product.stock_type === "availability"
    ) {
      return product.is_available
        ? { label: "Disponible", class: "bg-green-100 text-green-800" }
        : { label: "No disponible", class: "bg-red-100 text-red-800" };
    }

    // Fallback: parsear JSON del description para productos legacy
    const metadata = getProductMetadata(product);
    if (
      metadata &&
      (metadata.product_type === "perfiles" ||
        metadata.product_type === "chapas_conformadas")
    ) {
      if (metadata.stock_type === "availability") {
        return metadata.is_available
          ? { label: "Disponible", class: "bg-green-100 text-green-800" }
          : { label: "No disponible", class: "bg-red-100 text-red-800" };
      }
    }

    // Para productos estándar con stock numérico
    if (product.stock > 10) {
      return { label: "En Stock", class: "bg-green-100 text-green-800" };
    } else if (product.stock > 0) {
      return { label: "Poco Stock", class: "bg-yellow-100 text-yellow-800" };
    } else {
      return { label: "Sin Stock", class: "bg-red-100 text-red-800" };
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, categoryFilter, stockFilter]);

  const loadProducts = async () => {
    try {
      const data = await productService.getAll();
      setProducts(data);
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    // Filtro por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.brand?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por categoría
    if (categoryFilter) {
      filtered = filtered.filter(
        (product) => product.category === categoryFilter
      );
    }

    // Filtro por stock
    if (stockFilter) {
      switch (stockFilter) {
        case "in-stock":
          filtered = filtered.filter((product) => {
            // Usar campos directos de la base de datos si están disponibles
            if (
              (product.product_type === "perfiles" ||
                product.product_type === "chapas_conformadas") &&
              product.stock_type === "availability"
            ) {
              return product.is_available === true;
            }

            // Fallback: parsear JSON del description para productos legacy
            const metadata = getProductMetadata(product);
            if (
              metadata &&
              (metadata.product_type === "perfiles" ||
                metadata.product_type === "chapas_conformadas")
            ) {
              return metadata.is_available;
            }

            // Para productos estándar
            return product.stock > 10;
          });
          break;
        case "low-stock":
          filtered = filtered.filter((product) => {
            // Los perfiles y chapas conformadas no tienen "poco stock", solo disponible/no disponible
            if (
              (product.product_type === "perfiles" ||
                product.product_type === "chapas_conformadas") &&
              product.stock_type === "availability"
            ) {
              return false;
            }

            // Fallback: parsear JSON del description para productos legacy
            const metadata = getProductMetadata(product);
            if (
              metadata &&
              (metadata.product_type === "perfiles" ||
                metadata.product_type === "chapas_conformadas")
            ) {
              return false; // Los perfiles y chapas no tienen "poco stock"
            }

            // Para productos estándar
            return product.stock > 0 && product.stock <= 10;
          });
          break;
        case "out-of-stock":
          filtered = filtered.filter((product) => {
            // Usar campos directos de la base de datos si están disponibles
            if (
              (product.product_type === "perfiles" ||
                product.product_type === "chapas_conformadas") &&
              product.stock_type === "availability"
            ) {
              return product.is_available === false;
            }

            // Fallback: parsear JSON del description para productos legacy
            const metadata = getProductMetadata(product);
            if (
              metadata &&
              (metadata.product_type === "perfiles" ||
                metadata.product_type === "chapas_conformadas")
            ) {
              return !metadata.is_available;
            }

            // Para productos estándar
            return product.stock === 0;
          });
          break;
      }
    }

    setFilteredProducts(filtered);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este producto?")) {
      try {
        await productService.delete(productId);
        success(
          "Producto eliminado",
          "El producto se ha eliminado exitosamente"
        );
        loadProducts();
      } catch (err) {
        console.error("Error deleting product:", err);
        error("Error al eliminar", "No se pudo eliminar el producto");
      }
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-50 flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 sm:py-8">
        {/* Header */}
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Gestión de Productos
            </h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              Administra el inventario de productos
            </p>
          </div>
          <div className="w-full sm:w-auto">
            <Link
              href="/admin/productos/nuevo"
              className="inline-flex items-center justify-center w-full sm:w-auto px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Agregar Producto
            </Link>
          </div>
        </div>

        {/* Filtros y búsqueda */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {/* Búsqueda */}
              <div className="relative sm:col-span-2 lg:col-span-1">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filtro por categoría */}
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas las categorías" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Filtro por stock */}
              <Select value={stockFilter} onValueChange={setStockFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in-stock">En stock</SelectItem>
                  <SelectItem value="low-stock">Poco stock</SelectItem>
                  <SelectItem value="out-of-stock">Sin stock</SelectItem>
                </SelectContent>
              </Select>

              {/* Botón de limpiar filtros - solo visible cuando hay filtros activos */}
              {(searchTerm || categoryFilter || stockFilter) && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setCategoryFilter(undefined);
                    setStockFilter(undefined);
                  }}
                  className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors sm:col-span-2 lg:col-span-1"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Vista de productos responsive */}
        <div className="bg-white rounded-lg shadow">
          {/* Vista de tabla para desktop */}
          <div className="hidden lg:block overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precio (USD)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12">
                          {product.primary_image ? (
                            <img
                              src={product.primary_image}
                              alt={product.name}
                              className="h-12 w-12 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                              <span className="text-xs font-medium text-gray-500">
                                {product.name.substring(0, 2).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {product.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {product.brand}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.sku}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${product.price.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          getStockStatus(product).class
                        }`}
                      >
                        {getStockStatus(product).label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Link
                          href={`/admin/productos/editar/${product.id}`}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded-md hover:bg-blue-50 transition-colors"
                          title="Editar producto"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50 transition-colors"
                          title="Eliminar producto"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Vista de tarjetas para móviles y tablets */}
          <div className="lg:hidden divide-y divide-gray-200">
            {filteredProducts.map((product) => (
              <div key={product.id} className="p-4 sm:p-6">
                <div className="flex items-start space-x-4">
                  {/* Imagen del producto */}
                  <div className="flex-shrink-0">
                    {product.primary_image ? (
                      <img
                        src={product.primary_image}
                        alt={product.name}
                        className="h-16 w-16 sm:h-20 sm:w-20 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-lg bg-gray-200 flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-500">
                          {product.name.substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Información del producto */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm sm:text-base font-medium text-gray-900 truncate">
                          {product.name}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500 mt-1">
                          {product.brand}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500">
                          SKU: {product.sku}
                        </p>
                      </div>

                      {/* Acciones */}
                      <div className="flex space-x-2 ml-4">
                        <Link
                          href={`/admin/productos/editar/${product.id}`}
                          className="text-blue-600 hover:text-blue-900 p-2 rounded-md hover:bg-blue-50 transition-colors"
                          title="Editar producto"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </Link>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="text-red-600 hover:text-red-900 p-2 rounded-md hover:bg-red-50 transition-colors"
                          title="Eliminar producto"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>

                    {/* Metadatos del producto */}
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {product.category}
                      </span>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          getStockStatus(product).class
                        }`}
                      >
                        {getStockStatus(product).label}
                      </span>
                      <span className="text-sm sm:text-base font-semibold text-gray-900">
                        ${product.price.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">
              No se encontraron productos que coincidan con los filtros.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
