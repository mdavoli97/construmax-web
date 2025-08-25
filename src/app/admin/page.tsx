"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { productService } from "@/lib/services";
import { Product } from "@/types";
import {
  PlusIcon,
  BoxIcon,
  TagIcon,
  ShoppingCartIcon,
  DollarSignIcon,
  AlertTriangleIcon,
  TrendingUpIcon,
  DatabaseIcon,
  SettingsIcon,
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
      console.log("🔄 Intentando cargar cotización...");
      const exchangeResponse = await fetch("/api/exchange-rate");
      console.log("📊 Status:", exchangeResponse.status);

      if (exchangeResponse.ok) {
        const exchangeData = await exchangeResponse.json();
        console.log("💰 Datos recibidos:", exchangeData);

        // La API devuelve { success: true, data: { usd_to_uyu: ... } }
        if (exchangeData.success && exchangeData.data) {
          setExchangeRate(exchangeData.data.usd_to_uyu);
          setExchangeRateUpdated(
            new Date().toLocaleTimeString("es-UY", {
              hour: "2-digit",
              minute: "2-digit",
            })
          );
          console.log(
            "✅ Estado actualizado con rate:",
            exchangeData.data.usd_to_uyu
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Dashboard de Administración
              </h1>
              <p className="text-gray-600 mt-2">
                Gestiona productos, precios y contenido de ConstruMax
              </p>
            </div>
            <div className="bg-white border border-gray-200 px-6 py-4 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-gray-100">
                  <DollarSignIcon className="h-6 w-6 text-gray-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Cotización BCU
                  </p>
                  {exchangeRate ? (
                    <>
                      <p className="text-xl font-bold text-blue-700">
                        ${exchangeRate.toFixed(2)} UYU
                      </p>
                      {exchangeRateUpdated && (
                        <p className="text-xs text-gray-500">
                          Actualizado: {exchangeRateUpdated}
                        </p>
                      )}
                    </>
                  ) : (
                    <>
                      <p className="text-lg font-bold text-gray-700">
                        Cargando...
                      </p>
                      <p className="text-xs text-gray-500">
                        Conectando con BCU
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Estadísticas principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <PackageIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Productos</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.totalProducts}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <TagIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Categorías</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.totalCategories}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100">
                <BarChart3Icon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Grupos Precio
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.priceGroups}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-indigo-100">
                <TrendingUpIcon className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Recientes</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.recentProducts}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Acciones rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Link
            href="/admin/productos/nuevo"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-all duration-200 border-l-4 border-blue-500"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <PlusIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Nuevo Producto
                </h3>
                <p className="text-gray-600 text-sm">Crear producto</p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/productos"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-all duration-200 border-l-4 border-green-500"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <BoxIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Gestionar Productos
                </h3>
                <p className="text-gray-600 text-sm">Ver y editar</p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/precios"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-all duration-200 border-l-4 border-purple-500"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100">
                <DollarSignIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Grupos de Precios
                </h3>
                <p className="text-gray-600 text-sm">Gestionar precios</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Sección de productos y alertas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Productos recientes */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Productos Recientes
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Producto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Categoría
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Precio USD
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                        <td className="px-6 py-4 whitespace-nowrap">
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
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                            {product.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${product.price.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
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
            {products.length > 5 && (
              <div className="px-6 py-4 border-t border-gray-200">
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
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <BarChart3Icon className="h-5 w-5 text-purple-500 mr-2" />
                  Grupos de Precios
                </h3>
              </div>
              <div className="p-6">
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
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <DatabaseIcon className="h-5 w-5 text-green-500 mr-2" />
                  Estado del Sistema
                </h3>
              </div>
              <div className="p-6 space-y-4">
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
    </div>
  );
}
