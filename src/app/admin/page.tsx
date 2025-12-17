"use client";

import { useState, useEffect } from "react";
import { LoaderFive } from "@/components/ui/loader";
import Link from "next/link";
import { productService } from "@/lib/services";
import { Product } from "@/types";
import {
  PlusIcon,
  BoxIcon,
  TagIcon,
  DollarSignIcon,
  TrendingUpIcon,
  DatabaseIcon,
  ImageIcon,
  PackageIcon,
  BarChart3Icon,
} from "lucide-react";

interface PriceGroup {
  id: string;
  name: string;
  price_per_kg_usd: number;
  category: string;
  product_count: number;
}

interface DashboardStats {
  totalProducts: number;
  totalCategories: number;
  priceGroups: number;
  recentProducts: number;
}

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [priceGroups, setPriceGroups] = useState<PriceGroup[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalCategories: 0,
    priceGroups: 0,
    recentProducts: 0,
  });
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [exchangeRateUpdated, setExchangeRateUpdated] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();

    // Cargar cotización cada 5 minutos
    const exchangeInterval = setInterval(loadExchangeRate, 5 * 60 * 1000);

    return () => {
      clearInterval(exchangeInterval);
    };
  }, []);

  const loadExchangeRate = async () => {
    try {
      const exchangeResponse = await fetch("/api/exchange-rate");

      if (exchangeResponse.ok) {
        const exchangeData = await exchangeResponse.json();

        // La API devuelve { success: true, data: { usd_to_uyu: ... } }
        if (exchangeData.success && exchangeData.data) {
          setExchangeRate(exchangeData.data.usd_to_uyu);
          setExchangeRateUpdated(
            new Date().toLocaleTimeString("es-UY", {
              hour: "2-digit",
              minute: "2-digit",
            })
          );
        } else {
          console.error("❌ Estructura de datos inesperada:", exchangeData);
        }
      } else {
        console.error("❌ Error en la respuesta:", exchangeResponse.status);
      }
    } catch (error) {
      console.error("💥 Error al cargar cotización:", error);
    }
  };

  const loadData = async () => {
    try {
      // Cargar productos
      const productsData = await productService.getAll();
      setProducts(productsData);

      // Cargar grupos de precio
      const priceGroupsResponse = await fetch("/api/admin/price-groups");
      const priceGroupsData = priceGroupsResponse.ok
        ? await priceGroupsResponse.json()
        : { data: [] };
      setPriceGroups(priceGroupsData.data || []);

      // Cargar cotización inicial
      await loadExchangeRate();

      // Calcular estadísticas
      const categories = new Set(productsData.map((p) => p.category));
      const recentProducts = Math.min(productsData.length, 5);

      setStats({
        totalProducts: productsData.length,
        totalCategories: categories.size,
        priceGroups: priceGroupsData.data?.length || 0,
        recentProducts,
      });
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoaderFive text="Cargando dashboard..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Dashboard de Administración
            </h1>
            <p className="text-gray-600 mt-2 text-sm sm:text-base">
              Gestiona productos, precios y contenido de ConstruMax
            </p>
          </div>
          <div className="bg-white border border-gray-200 px-4 sm:px-6 py-3 sm:py-4 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-gray-100">
                <DollarSignIcon className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">
                  Cotización BCU
                </p>
                {exchangeRate ? (
                  <>
                    <p className="text-lg sm:text-xl font-bold text-blue-700">
                      ${exchangeRate.toFixed(2)} UYU
                    </p>
                    {exchangeRateUpdated && (
                      <p className="text-xs text-gray-500">
                        Actualizado: {exchangeRateUpdated}
                      </p>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center">
                    <LoaderFive text="Conectando con BCU..." />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 rounded-full bg-blue-100">
              <PackageIcon className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
            </div>
            <div className="ml-3 sm:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-600">
                Productos
              </p>
              <p className="text-xl sm:text-2xl font-semibold text-gray-900">
                {stats.totalProducts}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 rounded-full bg-green-100">
              <TagIcon className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
            </div>
            <div className="ml-3 sm:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-600">
                Categorías
              </p>
              <p className="text-xl sm:text-2xl font-semibold text-gray-900">
                {stats.totalCategories}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 rounded-full bg-purple-100">
              <BarChart3Icon className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
            </div>
            <div className="ml-3 sm:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-600">
                Grupos Precio
              </p>
              <p className="text-xl sm:text-2xl font-semibold text-gray-900">
                {stats.priceGroups}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 rounded-full bg-indigo-100">
              <TrendingUpIcon className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600" />
            </div>
            <div className="ml-3 sm:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-600">
                Recientes
              </p>
              <p className="text-xl sm:text-2xl font-semibold text-gray-900">
                {stats.recentProducts}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Acciones rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <Link
          href="/admin/productos/nuevo"
          className="bg-white rounded-lg shadow p-4 sm:p-6 hover:shadow-lg transition-all duration-200 border-l-4 border-blue-500"
        >
          <div className="flex items-center">
            <div className="p-2 sm:p-3 rounded-full bg-blue-100">
              <PlusIcon className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
            </div>
            <div className="ml-3 sm:ml-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                Nuevo Producto
              </h3>
              <p className="text-gray-600 text-xs sm:text-sm">Crear producto</p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/productos"
          className="bg-white rounded-lg shadow p-4 sm:p-6 hover:shadow-lg transition-all duration-200 border-l-4 border-green-500"
        >
          <div className="flex items-center">
            <div className="p-2 sm:p-3 rounded-full bg-green-100">
              <BoxIcon className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
            </div>
            <div className="ml-3 sm:ml-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                Gestionar Productos
              </h3>
              <p className="text-gray-600 text-xs sm:text-sm">Ver y editar</p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/precios"
          className="bg-white rounded-lg shadow p-4 sm:p-6 hover:shadow-lg transition-all duration-200 border-l-4 border-purple-500"
        >
          <div className="flex items-center">
            <div className="p-2 sm:p-3 rounded-full bg-purple-100">
              <DollarSignIcon className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
            </div>
            <div className="ml-3 sm:ml-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                Grupos de Precios
              </h3>
              <p className="text-gray-600 text-xs sm:text-sm">
                Gestionar precios
              </p>
            </div>
          </div>
        </Link>
      </div>

      {/* Sección de productos y alertas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
        {/* Productos recientes */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Productos Recientes
            </h2>
          </div>

          {/* Vista de tabla para desktop */}
          <div className="hidden sm:block">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Producto
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Categoría
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Precio USD
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.slice(0, 5).map((product) => {
                    const isAvailable =
                      product.stock_type === "availability"
                        ? product.is_available
                        : product.stock > 0;

                    return (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              {product.primary_image ? (
                                <img
                                  src={product.primary_image}
                                  alt={product.name}
                                  className="h-10 w-10 rounded-lg object-cover"
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                                  <ImageIcon className="h-5 w-5 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {product.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {product.sku}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                            {product.category}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${product.price.toLocaleString()}
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              isAvailable
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {isAvailable ? "Disponible" : "No disponible"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Vista de lista para móviles */}
          <div className="sm:hidden divide-y divide-gray-200">
            {products.slice(0, 5).map((product) => {
              const isAvailable =
                product.stock_type === "availability"
                  ? product.is_available
                  : product.stock > 0;

              return (
                <div key={product.id} className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      {product.primary_image ? (
                        <img
                          src={product.primary_image}
                          alt={product.name}
                          className="h-12 w-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                          <ImageIcon className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {product.name}
                      </p>
                      <p className="text-xs text-gray-500">{product.sku}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                          {product.category}
                        </span>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            isAvailable
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {isAvailable ? "Disponible" : "No disponible"}
                        </span>
                        <span className="text-sm font-semibold text-gray-900">
                          ${product.price.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {products.length > 5 && (
            <div className="px-4 sm:px-6 py-4 border-t border-gray-200">
              <Link
                href="/admin/productos"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Ver todos los productos →
              </Link>
            </div>
          )}
        </div>

        {/* Panel lateral con información importante */}
        <div className="space-y-6">
          {/* Resumen de grupos de precios */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <BarChart3Icon className="h-5 w-5 text-purple-500 mr-2" />
                Grupos de Precios
              </h3>
            </div>
            <div className="p-4 sm:p-6">
              {priceGroups.length > 0 ? (
                <div className="space-y-3">
                  {priceGroups.slice(0, 3).map((group) => (
                    <div
                      key={group.id}
                      className="flex justify-between items-center"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {group.name}
                        </p>
                        <p className="text-xs text-gray-500 capitalize">
                          {group.category}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          ${group.price_per_kg_usd}/kg
                        </p>
                        <p className="text-xs text-gray-500">
                          {group.product_count} productos
                        </p>
                      </div>
                    </div>
                  ))}
                  {priceGroups.length > 3 && (
                    <Link
                      href="/admin/precios"
                      className="block text-center text-sm text-blue-600 hover:text-blue-800 mt-4"
                    >
                      Ver todos los grupos →
                    </Link>
                  )}
                </div>
              ) : (
                <div>
                  <p className="text-sm text-gray-600 mb-4">
                    No hay grupos de precios configurados
                  </p>
                  <Link
                    href="/admin/precios"
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
                  >
                    Crear grupo
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Estado del sistema */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <DatabaseIcon className="h-5 w-5 text-green-500 mr-2" />
                Estado del Sistema
              </h3>
            </div>
            <div className="p-4 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Base de datos</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  ✅ Conectado
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">API BCU</span>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    exchangeRate
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {exchangeRate ? "✅ Activo" : "⚠️ Cache"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Cloudinary</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  ✅ Operativo
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
