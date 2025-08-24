"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { productService } from "@/lib/services";
import { Product } from "@/types";
import { PlusIcon, PencilIcon, TrashIcon, SearchIcon } from "lucide-react";
import { useNotifications } from "@/components/admin/NotificationProvider";

export default function ProductsAdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [stockFilter, setStockFilter] = useState("");
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
      product.product_type === "perfiles" &&
      product.stock_type === "availability"
    ) {
      return product.is_available
        ? { label: "Disponible", class: "bg-green-100 text-green-800" }
        : { label: "No disponible", class: "bg-red-100 text-red-800" };
    }

    // Fallback: parsear JSON del description para productos legacy
    const metadata = getProductMetadata(product);
    if (metadata && metadata.product_type === "perfiles") {
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
              product.product_type === "perfiles" &&
              product.stock_type === "availability"
            ) {
              return product.is_available === true;
            }

            // Fallback: parsear JSON del description para productos legacy
            const metadata = getProductMetadata(product);
            if (metadata && metadata.product_type === "perfiles") {
              return metadata.is_available;
            }

            // Para productos estándar
            return product.stock > 10;
          });
          break;
        case "low-stock":
          filtered = filtered.filter((product) => {
            // Los perfiles no tienen "poco stock", solo disponible/no disponible
            if (
              product.product_type === "perfiles" &&
              product.stock_type === "availability"
            ) {
              return false;
            }

            // Fallback: parsear JSON del description para productos legacy
            const metadata = getProductMetadata(product);
            if (metadata && metadata.product_type === "perfiles") {
              return false; // Los perfiles no tienen "poco stock"
            }

            // Para productos estándar
            return product.stock > 0 && product.stock <= 10;
          });
          break;
        case "out-of-stock":
          filtered = filtered.filter((product) => {
            // Usar campos directos de la base de datos si están disponibles
            if (
              product.product_type === "perfiles" &&
              product.stock_type === "availability"
            ) {
              return product.is_available === false;
            }

            // Fallback: parsear JSON del description para productos legacy
            const metadata = getProductMetadata(product);
            if (metadata && metadata.product_type === "perfiles") {
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Gestión de Productos
            </h1>
            <p className="text-gray-800 mt-2">
              Administra el inventario de productos
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Link
              href="/admin/productos/nuevo"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Agregar Producto
            </Link>
          </div>
        </div>

        {/* Filtros y búsqueda */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Búsqueda */}
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-600" />
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:ring-1 text-gray-900 placeholder-gray-500 bg-white"
                />
              </div>

              {/* Filtro por categoría */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:ring-1 text-gray-900 bg-white"
              >
                <option value="">Todas las categorías</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>

              {/* Filtro por stock */}
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
                className="px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:ring-1 text-gray-900 bg-white"
              >
                <option value="">Todos los stocks</option>
                <option value="in-stock">En Stock</option>
                <option value="low-stock">Poco Stock</option>
                <option value="out-of-stock">Sin Stock</option>
              </select>

              {/* Botón limpiar filtros */}
              <button
                onClick={() => {
                  setSearchTerm("");
                  setCategoryFilter("");
                  setStockFilter("");
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Limpiar Filtros
              </button>
            </div>
          </div>
        </div>

        {/* Tabla de productos */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                    Precio (USD)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
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
                              <span className="text-xs font-medium text-gray-800">
                                {product.name.substring(0, 2).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {product.name}
                          </div>
                          <div className="text-sm text-gray-700">
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
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="text-red-600 hover:text-red-900"
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
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-800">
              No se encontraron productos que coincidan con los filtros.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
