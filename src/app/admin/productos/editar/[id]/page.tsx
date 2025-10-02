"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { productService } from "@/lib/services";
import { ArrowLeftIcon, SaveIcon, RefreshCw } from "lucide-react";
import { Product, ProductImage } from "@/types";
import ImageUpload from "@/components/admin/ImageUpload";
import { useNotifications } from "@/components/admin/NotificationProvider";
import {
  useExchangeRate,
  formatUSD,
  formatUYU,
  convertUSDToUYU,
} from "@/lib/currency";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [priceGroups, setPriceGroups] = useState<
    Array<{
      id: string;
      name: string;
      price_per_kg: number;
      currency: "USD" | "UYU";
      category: string;
    }>
  >([]);
  const { success, error } = useNotifications();

  // Hook para cotización de dólar
  const {
    exchangeRate,
    loading: exchangeLoading,
    error: exchangeError,
    refresh: refreshExchangeRate,
  } = useExchangeRate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
    unit: "kg",
    brand: "",
    sku: "",
    featured: false,
    // Nuevos campos
    product_type: "perfiles",
    weight_per_unit: "",
    kg_per_meter: "",
    price_per_kg: "",
    stock_type: "availability",
    is_available: true,
    price_group_id: "",
  });

  const categories = [
    { value: "construccion", label: "Construcción" },
    { value: "metalurgica", label: "Metalúrgica" },
    { value: "herramientas", label: "Herramientas" },
    { value: "herreria", label: "Herrería" },
  ];

  const productTypes = [
    { value: "perfiles", label: "Perfiles (precio por kg)" },
    {
      value: "chapas_conformadas",
      label: "Chapas conformadas (precio por kg y kg por metro)",
    },
  ];

  const units = [
    "unidad",
    "kg",
    "m",
    "m²",
    "m³",
    "litro",
    "bolsa",
    "rollo",
    "caja",
    "paquete",
  ];

  // Cargar producto y grupos de precios
  useEffect(() => {
    const loadData = async () => {
      try {
        // Cargar producto
        const productData = await productService.getById(productId);
        if (productData) {
          setProduct(productData);

          // Parsear metadata del JSON en description si existe
          let metadata = null;
          let cleanDescription = productData.description || "";

          try {
            if (
              productData.description?.startsWith("{") ||
              productData.description?.startsWith("[")
            ) {
              const parsed = JSON.parse(productData.description);
              metadata = parsed.meta || parsed;
              cleanDescription = parsed.description || "";
            }
          } catch (error) {
            console.log("No hay metadata JSON, usando descripción normal");
          }

          // Establecer datos del formulario usando campos directos de DB cuando estén disponibles
          setFormData({
            name: productData.name,
            description: cleanDescription,
            price: productData.price.toString(),
            category: productData.category,
            stock: productData.stock.toString(),
            unit: productData.unit,
            brand: productData.brand || "",
            sku: productData.sku,
            featured: productData.featured || false,
            // Usar campos directos de la base de datos si están disponibles, sino usar metadata
            product_type:
              productData.product_type || metadata?.product_type || "perfiles",
            weight_per_unit:
              productData.weight_per_unit?.toString() ||
              metadata?.weight_per_unit?.toString() ||
              "",
            kg_per_meter:
              productData.kg_per_meter?.toString() ||
              metadata?.kg_per_meter?.toString() ||
              "",
            price_per_kg:
              productData.price_per_kg?.toString() ||
              metadata?.price_per_kg?.toString() ||
              "",
            stock_type:
              productData.stock_type || metadata?.stock_type || "availability",
            is_available:
              productData.is_available !== undefined
                ? productData.is_available
                : metadata?.is_available !== undefined
                ? metadata.is_available
                : true,
            price_group_id:
              productData.price_group_id || metadata?.price_group_id || "",
          });

          // Cargar imágenes del producto
          try {
            const imagesResponse = await fetch(
              `/api/products/${productId}/images`
            );
            if (imagesResponse.ok) {
              const imagesData = await imagesResponse.json();
              setImages(imagesData);
            }
          } catch (error) {
            console.error("Error loading product images:", error);
          }
        }

        // Cargar grupos de precios
        const response = await fetch("/api/price-groups");
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setPriceGroups(result.data || []);
          }
        }
      } catch (err) {
        console.error("Error loading data:", err);
        error("Error", "No se pudo cargar el producto");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [productId, error]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    const newValue =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : value;

    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: newValue,
      };

      // Lógica para perfiles
      if (updated.product_type === "perfiles") {
        // Recalcular precio cuando cambian peso por unidad o precio por kg
        if (name === "weight_per_unit" || name === "price_per_kg") {
          const weight = parseFloat(updated.weight_per_unit) || 0;
          const pricePerKg = parseFloat(updated.price_per_kg) || 0;
          if (weight > 0 && pricePerKg > 0) {
            updated.price = (weight * pricePerKg).toFixed(2);
          }
        }

        // Si selecciona un grupo de precios, cargar el precio por kg
        if (name === "price_group_id" && value && Array.isArray(priceGroups)) {
          const selectedGroup = priceGroups.find((group) => group.id === value);
          if (selectedGroup) {
            updated.price_per_kg = selectedGroup.price_per_kg.toString();
            updated.category = selectedGroup.category;

            // Recalcular precio total
            const weight = parseFloat(updated.weight_per_unit) || 0;
            if (weight > 0) {
              updated.price = (weight * selectedGroup.price_per_kg).toFixed(2);
            }
          }
        }
      }

      // Lógica para chapas conformadas
      if (updated.product_type === "chapas_conformadas") {
        // Recalcular precio cuando cambian kg por metro o precio por kg
        if (name === "kg_per_meter" || name === "price_per_kg") {
          const kgPerMeter = parseFloat(updated.kg_per_meter) || 0;
          const pricePerKg = parseFloat(updated.price_per_kg) || 0;
          if (kgPerMeter > 0 && pricePerKg > 0) {
            updated.price = (kgPerMeter * pricePerKg).toFixed(2);
          }
        }

        // Si selecciona un grupo de precios, cargar el precio por kg
        if (name === "price_group_id" && value && Array.isArray(priceGroups)) {
          const selectedGroup = priceGroups.find((group) => group.id === value);
          if (selectedGroup) {
            updated.price_per_kg = selectedGroup.price_per_kg.toString();
            updated.category = selectedGroup.category;

            // Recalcular precio total
            const kgPerMeter = parseFloat(updated.kg_per_meter) || 0;
            if (kgPerMeter > 0) {
              updated.price = (kgPerMeter * selectedGroup.price_per_kg).toFixed(
                2
              );
            }
          }
        }
      }

      // Si cambia el tipo de producto, resetear campos específicos
      if (name === "product_type") {
        if (value === "perfiles") {
          updated.unit = "kg";
          updated.stock_type = "availability";
          updated.kg_per_meter = "";
        } else if (value === "chapas_conformadas") {
          updated.unit = "m";
          updated.stock_type = "availability";
          updated.weight_per_unit = "";
        } else {
          updated.weight_per_unit = "";
          updated.kg_per_meter = "";
          updated.price_per_kg = "";
          updated.stock_type = "quantity";
        }
      }

      return updated;
    });
  };

  const generateSKU = () => {
    const categoryCode = formData.category
      ? formData.category.substring(0, 3).toUpperCase()
      : "CAT";
    const nameCode = formData.name
      ? formData.name.substring(0, 3).toUpperCase()
      : "PRD";
    const randomNum = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    return `${categoryCode}-${nameCode}-${randomNum}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Validación básica
      if (!formData.name.trim()) {
        error("Campo requerido", "El nombre del producto es requerido");
        setSaving(false);
        return;
      }

      if (formData.product_type === "perfiles") {
        if (
          !formData.weight_per_unit ||
          isNaN(parseFloat(formData.weight_per_unit)) ||
          parseFloat(formData.weight_per_unit) <= 0
        ) {
          error(
            "Peso inválido",
            "El peso por unidad es requerido y debe ser mayor a 0"
          );
          setSaving(false);
          return;
        }
      } else if (formData.product_type === "chapas_conformadas") {
        if (
          !formData.kg_per_meter ||
          isNaN(parseFloat(formData.kg_per_meter)) ||
          parseFloat(formData.kg_per_meter) <= 0
        ) {
          error(
            "Kg por metro inválido",
            "Los kg por metro son requeridos y deben ser mayor a 0"
          );
          setSaving(false);
          return;
        }
      } else {
        // Validación estándar de precio y stock
        if (
          !formData.price ||
          isNaN(parseFloat(formData.price)) ||
          parseFloat(formData.price) <= 0
        ) {
          error("Precio inválido", "El precio debe ser un número mayor a 0");
          setSaving(false);
          return;
        }

        if (
          !formData.stock ||
          isNaN(parseInt(formData.stock)) ||
          parseInt(formData.stock) < 0
        ) {
          error(
            "Stock inválido",
            "El stock debe ser un número mayor o igual a 0"
          );
          setSaving(false);
          return;
        }
      }

      if (!formData.category) {
        error("Campo requerido", "La categoría es requerida");
        setSaving(false);
        return;
      }

      // Asegurar unidad correcta según tipo de producto
      let finalUnit = formData.unit.trim();
      if (formData.product_type === "perfiles") {
        finalUnit = "kg";
      } else if (formData.product_type === "chapas_conformadas") {
        finalUnit = "m";
      }

      if (!finalUnit) {
        error("Campo requerido", "La unidad es requerida");
        setSaving(false);
        return;
      }

      // Generar SKU si no se proporcionó uno
      const sku = formData.sku.trim() || generateSKU();

      // Preparar datos según el tipo de producto
      const baseProductData = {
        name: formData.name.trim(),
        category: formData.category,
        unit: finalUnit,
        brand: formData.brand.trim() || undefined,
        sku,
        featured: formData.featured,
      };

      let productData;

      if (formData.product_type === "perfiles") {
        productData = {
          ...baseProductData,
          description: formData.description.trim() || "",
          price: parseFloat(formData.price),
          stock: formData.is_available ? 1 : 0,
          // Campos directos en la base de datos
          product_type: "perfiles",
          weight_per_unit: parseFloat(formData.weight_per_unit),
          price_per_kg: parseFloat(formData.price_per_kg),
          stock_type: "availability",
          is_available: formData.is_available,
          price_group_id: formData.price_group_id || null,
        };
      } else if (formData.product_type === "chapas_conformadas") {
        productData = {
          ...baseProductData,
          description: formData.description.trim() || "",
          price: parseFloat(formData.price),
          stock: formData.is_available ? 1 : 0,
          // Campos directos en la base de datos
          product_type: "chapas_conformadas",
          kg_per_meter: parseFloat(formData.kg_per_meter),
          price_per_kg: parseFloat(formData.price_per_kg),
          stock_type: "availability",
          is_available: formData.is_available,
          price_group_id: formData.price_group_id || null,
        };
      } else {
        // Para productos estándar
        productData = {
          ...baseProductData,
          description: formData.description.trim() || "",
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock),
          product_type: "standard",
          stock_type: "quantity",
          price_group_id: null,
        };
      }

      const updatedProduct = await productService.update(
        productId,
        productData
      );

      success(
        "Producto actualizado",
        "El producto se ha actualizado exitosamente"
      );
      router.push("/admin/productos");
    } catch (err) {
      console.error("Error updating product:", err);
      error(
        "Error al actualizar producto",
        `${err instanceof Error ? err.message : "Error desconocido"}`
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-50 flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando producto...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="bg-gray-50 flex items-center justify-center py-20">
        <div className="text-center">
          <p className="text-gray-600">Producto no encontrado</p>
          <Link
            href="/admin/productos"
            className="mt-4 inline-flex items-center text-orange-600 hover:text-orange-700"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Volver a productos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/admin/productos"
                className="inline-flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                Volver a productos
              </Link>
              <div className="h-6 border-l border-gray-300"></div>
              <h1 className="text-2xl font-bold text-gray-900">
                Editar Producto
              </h1>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Información Básica */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Información Básica
              </h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-800 mb-2"
                  >
                    Nombre del Producto *
                  </label>
                  <Input
                    type="text"
                    id="name"
                    name="name"
                    required
                    disabled={saving}
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Ej: Perfil Tubular 40x40"
                  />
                </div>

                <div>
                  <label
                    htmlFor="category"
                    className="block text-sm font-medium text-gray-800 mb-2"
                  >
                    Categoría *
                  </label>
                  <Select
                    disabled={saving}
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, category: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-800 mb-2"
                >
                  Descripción
                </label>
                <Textarea
                  id="description"
                  name="description"
                  rows={3}
                  disabled={saving}
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Descripción del producto..."
                />
              </div>

              {/* Selector de tipo de producto */}
              <div>
                <label
                  htmlFor="product_type"
                  className="block text-sm font-medium text-gray-800 mb-2"
                >
                  Tipo de Producto *
                </label>
                <Select
                  disabled={saving}
                  value={formData.product_type}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, product_type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {productTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500 mt-1">
                  Selecciona el tipo para mostrar campos específicos
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="sku"
                    className="block text-sm font-medium text-gray-800 mb-2"
                  >
                    SKU
                  </label>
                  <Input
                    type="text"
                    id="sku"
                    name="sku"
                    disabled={saving}
                    value={formData.sku}
                    onChange={handleInputChange}
                    placeholder="Código único del producto"
                  />
                </div>

                <div>
                  <label
                    htmlFor="brand"
                    className="block text-sm font-medium text-gray-800 mb-2"
                  >
                    Marca
                  </label>
                  <Input
                    type="text"
                    id="brand"
                    name="brand"
                    disabled={saving}
                    value={formData.brand}
                    onChange={handleInputChange}
                    placeholder="Marca del producto"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="featured"
                    disabled={saving}
                    checked={formData.featured}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:cursor-not-allowed"
                  />
                  <span className="ml-2 text-sm text-gray-900">
                    Producto destacado
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Precio e Inventario */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Precio e Inventario
              </h2>

              {/* Información de cotización */}
              <div className="mt-3">
                {exchangeLoading ? (
                  <div className="flex items-center text-sm text-gray-600">
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Obteniendo cotización del dólar...
                  </div>
                ) : exchangeError ? (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-red-600">
                      Error al obtener cotización: {exchangeError}
                    </span>
                    <button
                      type="button"
                      onClick={refreshExchangeRate}
                      className="flex items-center text-blue-600 hover:text-blue-700"
                    >
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Reintentar
                    </button>
                  </div>
                ) : exchangeRate ? (
                  <div className="bg-blue-50 border border-blue-200 rounded p-3">
                    <div className="flex items-center justify-between">
                      <div className="text-sm">
                        <span className="font-medium text-blue-900">USD:</span>
                        <span className="ml-2 font-semibold text-blue-700">
                          $
                          {(
                            exchangeRate.venta || exchangeRate.usd_to_uyu
                          ).toFixed(2)}{" "}
                          UYU
                        </span>
                        <span className="ml-2 text-xs text-gray-600">
                          (
                          {exchangeRate.source === "dolarapi"
                            ? "En vivo"
                            : "Cache"}
                          )
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={refreshExchangeRate}
                        className="text-blue-600 hover:text-blue-700"
                        title="Actualizar cotización"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
            <div className="p-6 space-y-6">
              {/* Selector de grupo de precios para perfiles y chapas conformadas */}
              {(formData.product_type === "perfiles" ||
                formData.product_type === "chapas_conformadas") && (
                <div>
                  <label
                    htmlFor="price_group_id"
                    className="block text-sm font-medium text-gray-800 mb-2"
                  >
                    Grupo de Precios
                  </label>
                  <Select
                    disabled={saving}
                    value={formData.price_group_id}
                    onValueChange={(value) => {
                      // Encontrar el grupo seleccionado para obtener su precio
                      const selectedGroup = priceGroups.find(
                        (group) => group.id === value
                      );
                      setFormData((prev) => ({
                        ...prev,
                        price_group_id: value,
                        price_per_kg: selectedGroup
                          ? selectedGroup.price_per_kg.toString()
                          : prev.price_per_kg,
                      }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar grupo de precios" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.isArray(priceGroups) &&
                        priceGroups.map((group) => (
                          <SelectItem key={group.id} value={group.id}>
                            {group.name} -{" "}
                            {group.currency === "USD" ? "$" : "$U"}
                            {group.price_per_kg}/kg {group.currency}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-500 mt-1">
                    El precio por kg se cargará automáticamente desde el grupo
                    seleccionado
                  </p>
                </div>
              )}

              {/* Campos específicos para Perfiles */}
              {formData.product_type === "perfiles" && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h3 className="text-sm font-medium text-blue-900 mb-3">
                    Configuración para Perfiles
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="price_per_kg"
                        className="block text-sm font-medium text-gray-800 mb-2"
                      >
                        Precio por Kg (USD) *
                      </label>
                      <div className="space-y-2">
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-700 z-10">
                            $
                          </span>
                          <Input
                            type="number"
                            id="price_per_kg"
                            name="price_per_kg"
                            required
                            step="0.01"
                            disabled={saving || formData.price_group_id !== ""}
                            value={formData.price_per_kg}
                            onChange={handleInputChange}
                            className="pl-8"
                            placeholder="0.00"
                          />
                        </div>
                        {formData.price_per_kg && exchangeRate && (
                          <div className="text-xs bg-gray-50 border border-gray-200 p-2 rounded">
                            <span className="text-gray-600">Equivalente: </span>
                            <span className="font-semibold text-gray-900">
                              {formatUYU(
                                convertUSDToUYU(
                                  parseFloat(formData.price_per_kg),
                                  exchangeRate.usd_to_uyu
                                )
                              )}{" "}
                              por kg
                            </span>
                          </div>
                        )}
                        {formData.price_group_id && (
                          <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                            💡 Precio cargado automáticamente desde el grupo de
                            precios seleccionado
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="weight_per_unit"
                        className="block text-sm font-medium text-gray-800 mb-2"
                      >
                        Peso por Unidad (kg) *
                      </label>
                      <Input
                        type="number"
                        id="weight_per_unit"
                        name="weight_per_unit"
                        required
                        step="0.001"
                        disabled={saving}
                        value={formData.weight_per_unit}
                        onChange={handleInputChange}
                        placeholder="Ej: 0.5"
                      />
                    </div>
                  </div>

                  {/* Precio automático */}
                  <div className="mt-4 bg-white p-3 rounded border border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">
                        Precio por unidad:
                      </span>
                      <span className="text-lg font-semibold text-blue-700">
                        {formatUSD(parseFloat(formData.price) || 0)}
                      </span>
                    </div>
                    {formData.weight_per_unit && formData.price_per_kg && (
                      <p className="text-xs text-gray-600 mt-1">
                        {formData.weight_per_unit} kg ×{" "}
                        {formatUSD(parseFloat(formData.price_per_kg))}/kg ={" "}
                        {formatUSD(parseFloat(formData.price))}
                        {exchangeRate && (
                          <span className="text-xs text-blue-600 block">
                            (Cotización: ${exchangeRate.usd_to_uyu.toFixed(2)}{" "}
                            UYU)
                          </span>
                        )}
                      </p>
                    )}
                  </div>

                  {/* Stock como disponibilidad */}
                  <div className="mt-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="is_available"
                        disabled={saving}
                        checked={formData.is_available}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:cursor-not-allowed"
                      />
                      <span className="ml-2 text-sm text-gray-900">
                        Producto disponible en stock
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {/* Campos específicos para Chapas Conformadas */}
              {formData.product_type === "chapas_conformadas" && (
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h3 className="text-sm font-medium text-green-900 mb-3">
                    Configuración para Chapas Conformadas
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="price_per_kg"
                        className="block text-sm font-medium text-gray-800 mb-2"
                      >
                        Precio por Kg (USD) *
                      </label>
                      <div className="space-y-2">
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-700 z-10">
                            $
                          </span>
                          <Input
                            type="number"
                            id="price_per_kg"
                            name="price_per_kg"
                            required
                            step="0.01"
                            disabled={saving || formData.price_group_id !== ""}
                            value={formData.price_per_kg}
                            onChange={handleInputChange}
                            className="pl-8"
                            placeholder="0.00"
                          />
                        </div>
                        {formData.price_per_kg && exchangeRate && (
                          <div className="text-xs bg-gray-50 border border-gray-200 p-2 rounded">
                            <span className="text-gray-600">Equivalente: </span>
                            <span className="font-semibold text-gray-900">
                              {formatUYU(
                                convertUSDToUYU(
                                  parseFloat(formData.price_per_kg),
                                  exchangeRate.usd_to_uyu
                                )
                              )}{" "}
                              por kg
                            </span>
                          </div>
                        )}
                        {formData.price_group_id && (
                          <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                            💡 Precio cargado automáticamente desde el grupo de
                            precios seleccionado
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="kg_per_meter"
                        className="block text-sm font-medium text-gray-800 mb-2"
                      >
                        Kg por Metro *
                      </label>
                      <Input
                        type="number"
                        id="kg_per_meter"
                        name="kg_per_meter"
                        required
                        step="0.001"
                        disabled={saving}
                        value={formData.kg_per_meter}
                        onChange={handleInputChange}
                        placeholder="Ej: 2.5"
                      />
                    </div>
                  </div>

                  {/* Precio automático */}
                  <div className="mt-4 bg-white p-3 rounded border border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">
                        Precio por metro:
                      </span>
                      <span className="text-lg font-semibold text-green-700">
                        {formatUSD(parseFloat(formData.price) || 0)}
                      </span>
                    </div>
                    {formData.kg_per_meter && formData.price_per_kg && (
                      <p className="text-xs text-gray-600 mt-1">
                        {formData.kg_per_meter} kg/m ×{" "}
                        {formatUSD(parseFloat(formData.price_per_kg))}/kg ={" "}
                        {formatUSD(parseFloat(formData.price))}/m
                        {exchangeRate && (
                          <span className="text-xs text-blue-600 block">
                            (Cotización: ${exchangeRate.usd_to_uyu.toFixed(2)}{" "}
                            UYU)
                          </span>
                        )}
                      </p>
                    )}
                  </div>

                  {/* Stock como disponibilidad */}
                  <div className="mt-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="is_available"
                        disabled={saving}
                        checked={formData.is_available}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:cursor-not-allowed"
                      />
                      <span className="ml-2 text-sm text-gray-900">
                        Producto disponible en stock
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {/* Campos estándar para productos normales */}
              {formData.product_type !== "perfiles" &&
                formData.product_type !== "chapas_conformadas" && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label
                        htmlFor="price"
                        className="block text-sm font-medium text-gray-800 mb-2"
                      >
                        Precio (USD) *
                      </label>
                      <div className="space-y-2">
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-700 z-10">
                            $
                          </span>
                          <Input
                            type="number"
                            id="price"
                            name="price"
                            required
                            step="0.01"
                            disabled={saving}
                            value={formData.price}
                            onChange={handleInputChange}
                            className="pl-8"
                            placeholder="0.00"
                          />
                        </div>
                        {formData.price && exchangeRate && (
                          <div className="text-xs bg-gray-50 border border-gray-200 p-2 rounded">
                            <span className="text-gray-600">Equivalente: </span>
                            <span className="font-semibold text-gray-900">
                              {formatUYU(
                                convertUSDToUYU(
                                  parseFloat(formData.price),
                                  exchangeRate.usd_to_uyu
                                )
                              )}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="stock"
                        className="block text-sm font-medium text-gray-800 mb-2"
                      >
                        Stock *
                      </label>
                      <Input
                        type="number"
                        id="stock"
                        name="stock"
                        required
                        min="0"
                        disabled={saving}
                        value={formData.stock}
                        onChange={handleInputChange}
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="unit"
                        className="block text-sm font-medium text-gray-800 mb-2"
                      >
                        Unidad *
                      </label>
                      <Select
                        disabled={saving}
                        value={formData.unit}
                        onValueChange={(value) =>
                          setFormData((prev) => ({ ...prev, unit: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar unidad" />
                        </SelectTrigger>
                        <SelectContent>
                          {units.map((unit) => (
                            <SelectItem key={unit} value={unit}>
                              {unit}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
            </div>
          </div>

          {/* Imágenes */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Imágenes</h2>
            </div>
            <div className="p-6">
              <ImageUpload
                productId={productId}
                images={images}
                onImagesChange={setImages}
              />
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex items-center justify-end space-x-4">
            <Link
              href="/admin/productos"
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {saving ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <SaveIcon className="h-4 w-4 mr-2" />
                  Actualizar Producto
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
