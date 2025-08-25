"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { productService } from "@/lib/services";
import { ArrowLeftIcon, SaveIcon, RefreshCw } from "lucide-react";
import { ProductImage } from "@/types";
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

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [productCreated, setProductCreated] = useState(false);
  const [createdProductId, setCreatedProductId] = useState<string | null>(null);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [priceGroups, setPriceGroups] = useState<
    Array<{
      id: string;
      name: string;
      price_per_kg_usd: number;
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

  // Cargar grupos de precios al montar el componente
  useEffect(() => {
    const loadPriceGroups = async () => {
      try {
        const response = await fetch("/api/price-groups");
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setPriceGroups(result.data);
          } else {
            console.error("Error loading price groups:", result.error);
          }
        }
      } catch (error) {
        console.error("Error loading price groups:", error);
      }
    };

    loadPriceGroups();
  }, []);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
    unit: "kg", // Por defecto kg para perfiles
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
      label: "Chapas conformadas (precio por kg)",
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

      // Si es un perfil o chapa conformada y cambian peso/kg por metro o precio por kg, recalcular precio total
      if (updated.product_type === "perfiles") {
        if (name === "weight_per_unit" || name === "price_per_kg") {
          const weight = parseFloat(updated.weight_per_unit) || 0;
          const pricePerKg = parseFloat(updated.price_per_kg) || 0;
          if (weight > 0 && pricePerKg > 0) {
            updated.price = (weight * pricePerKg).toFixed(2);
          }
        }
      } else if (updated.product_type === "chapas_conformadas") {
        if (name === "kg_per_meter" || name === "price_per_kg") {
          const kgPerMeter = parseFloat(updated.kg_per_meter) || 0;
          const pricePerKg = parseFloat(updated.price_per_kg) || 0;
          if (kgPerMeter > 0 && pricePerKg > 0) {
            // Para chapas, el precio base es por metro (kg/m * $/kg)
            updated.price = (kgPerMeter * pricePerKg).toFixed(2);
          }
        }
      }

      // Si selecciona un grupo de precios, cargar el precio por kg
      if (
        (updated.product_type === "perfiles" ||
          updated.product_type === "chapas_conformadas") &&
        name === "price_group_id" &&
        value
      ) {
        const selectedGroup = priceGroups.find((group) => group.id === value);
        if (selectedGroup) {
          updated.price_per_kg = selectedGroup.price_per_kg_usd.toString();
          updated.category = selectedGroup.category;

          // Recalcular precio total
          if (updated.product_type === "perfiles") {
            const weight = parseFloat(updated.weight_per_unit) || 0;
            if (weight > 0) {
              updated.price = (weight * selectedGroup.price_per_kg_usd).toFixed(
                2
              );
            }
          } else if (updated.product_type === "chapas_conformadas") {
            const kgPerMeter = parseFloat(updated.kg_per_meter) || 0;
            if (kgPerMeter > 0) {
              updated.price = (
                kgPerMeter * selectedGroup.price_per_kg_usd
              ).toFixed(2);
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
    setLoading(true);

    try {
      // Validación básica en frontend
      if (!formData.name.trim()) {
        error("Campo requerido", "El nombre del producto es requerido");
        setLoading(false);
        return;
      }

      // Validaciones específicas por tipo de producto
      if (formData.product_type === "perfiles") {
        if (
          !formData.price_per_kg ||
          isNaN(parseFloat(formData.price_per_kg)) ||
          parseFloat(formData.price_per_kg) <= 0
        ) {
          error(
            "Precio inválido",
            "El precio por kg es requerido y debe ser mayor a 0"
          );
          setLoading(false);
          return;
        }

        if (
          !formData.weight_per_unit ||
          isNaN(parseFloat(formData.weight_per_unit)) ||
          parseFloat(formData.weight_per_unit) <= 0
        ) {
          error(
            "Peso inválido",
            "El peso por unidad es requerido y debe ser mayor a 0"
          );
          setLoading(false);
          return;
        }

        // Para perfiles, el stock se maneja como disponibilidad
        // No validamos número de stock
      } else if (formData.product_type === "chapas_conformadas") {
        if (
          !formData.price_per_kg ||
          isNaN(parseFloat(formData.price_per_kg)) ||
          parseFloat(formData.price_per_kg) <= 0
        ) {
          error(
            "Precio inválido",
            "El precio por kg es requerido y debe ser mayor a 0"
          );
          setLoading(false);
          return;
        }

        if (
          !formData.kg_per_meter ||
          isNaN(parseFloat(formData.kg_per_meter)) ||
          parseFloat(formData.kg_per_meter) <= 0
        ) {
          error(
            "Kg por metro inválido",
            "Los kg por metro son requeridos y deben ser mayor a 0"
          );
          setLoading(false);
          return;
        }

        // Para chapas conformadas, el stock se maneja como disponibilidad
        // No validamos número de stock
      } else {
        // Validación estándar de precio y stock
        if (
          !formData.price ||
          isNaN(parseFloat(formData.price)) ||
          parseFloat(formData.price) <= 0
        ) {
          error("Precio inválido", "El precio debe ser un número mayor a 0");
          setLoading(false);
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
          setLoading(false);
          return;
        }
      }

      if (!formData.category) {
        error("Campo requerido", "La categoría es requerida");
        setLoading(false);
        return;
      }

      // Para perfiles, asegurar que la unidad sea kg. Para chapas conformadas, asegurar que sea m
      let finalUnit = formData.unit.trim();
      if (formData.product_type === "perfiles") {
        finalUnit = "kg";
      } else if (formData.product_type === "chapas_conformadas") {
        finalUnit = "m";
      }

      if (!finalUnit) {
        error("Campo requerido", "La unidad es requerida");
        setLoading(false);
        return;
      }

      // Generar SKU si no se proporcionó uno
      const sku = formData.sku.trim() || generateSKU();

      // Preparar datos según el tipo de producto
      const baseProductData = {
        name: formData.name.trim(),
        category: formData.category,
        primary_image: undefined, // Se establecerá después al subir imágenes
        unit: finalUnit,
        brand: formData.brand.trim() || undefined,
        sku,
        featured: formData.featured,
      };

      let productData;

      if (formData.product_type === "perfiles") {
        // Para perfiles: guardar info extra en description como JSON
        const extraData = {
          product_type: "perfiles",
          weight_per_unit: parseFloat(formData.weight_per_unit),
          price_per_kg: parseFloat(formData.price_per_kg),
          stock_type: "availability",
          is_available: formData.is_available,
        };

        const descriptionWithMeta = {
          description: formData.description.trim() || "",
          meta: extraData,
        };

        productData = {
          ...baseProductData,
          description: JSON.stringify(descriptionWithMeta),
          price: parseFloat(formData.price), // Precio calculado automáticamente
          stock: formData.is_available ? 1 : 0, // 1 = disponible, 0 = no disponible
          price_group_id: formData.price_group_id || null,
        };
      } else if (formData.product_type === "chapas_conformadas") {
        // Para chapas conformadas: guardar info extra en description como JSON
        const extraData = {
          product_type: "chapas_conformadas",
          kg_per_meter: parseFloat(formData.kg_per_meter),
          price_per_kg: parseFloat(formData.price_per_kg),
          stock_type: "availability",
          is_available: formData.is_available,
        };

        const descriptionWithMeta = {
          description: formData.description.trim() || "",
          meta: extraData,
        };

        productData = {
          ...baseProductData,
          description: JSON.stringify(descriptionWithMeta),
          price: parseFloat(formData.price), // Precio calculado automáticamente por metro
          stock: formData.is_available ? 1 : 0, // 1 = disponible, 0 = no disponible
          price_group_id: formData.price_group_id || null,
        };
      } else {
        // Para productos estándar
        const extraData = {
          product_type: "standard",
          stock_type: "quantity",
        };

        const descriptionWithMeta = {
          description: formData.description.trim() || "",
          meta: extraData,
        };

        productData = {
          ...baseProductData,
          description: JSON.stringify(descriptionWithMeta),
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock),
        };
      }

      const createdProduct = await productService.create(productData);
      setCreatedProductId(createdProduct.id);
      setProductCreated(true);

      success(
        "Producto creado",
        "Producto creado exitosamente. Ahora puedes agregar imágenes si lo deseas."
      );
    } catch (err) {
      console.error("Error creating product:", err);
      error(
        "Error al crear producto",
        `${err instanceof Error ? err.message : "Error desconocido"}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <Link
              href="/admin/productos"
              className="inline-flex items-center text-gray-800 hover:text-gray-900"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Volver a productos
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            {!productCreated
              ? "Agregar Nuevo Producto"
              : "Agregar Imágenes del Producto"}
          </h1>
          <p className="text-gray-800 mt-2">
            {!productCreated
              ? "Paso 1: Complete la información básica del producto"
              : "Paso 2: Agregue imágenes adicionales (opcional)"}
          </p>

          {/* Indicador de progreso */}
          <div className="mt-6">
            <div className="flex items-center">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                  !productCreated
                    ? "bg-blue-600 text-white"
                    : "bg-green-600 text-white"
                }`}
              >
                1
              </div>
              <div
                className={`flex-1 h-1 mx-4 ${
                  productCreated ? "bg-green-600" : "bg-gray-300"
                }`}
              ></div>
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                  productCreated
                    ? "bg-blue-600 text-white"
                    : "bg-gray-300 text-gray-500"
                }`}
              >
                2
              </div>
            </div>
            <div className="flex justify-between mt-2 text-sm">
              <span
                className={
                  productCreated
                    ? "text-green-600 font-medium"
                    : "text-blue-600 font-medium"
                }
              >
                Información básica
              </span>
              <span
                className={
                  productCreated ? "text-blue-600 font-medium" : "text-gray-500"
                }
              >
                Imágenes (opcional)
              </span>
            </div>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div
            className={`bg-white rounded-lg shadow ${
              productCreated ? "opacity-60" : ""
            }`}
          >
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Información Básica
                {productCreated && (
                  <span className="ml-2 text-sm text-green-600 font-medium">
                    ✓ Completado
                  </span>
                )}
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
                    disabled={productCreated}
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
                    disabled={productCreated}
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
                  disabled={productCreated}
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Descripción del producto..."
                />
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
                    disabled={productCreated}
                    value={formData.sku}
                    onChange={handleInputChange}
                    placeholder="Se generará automáticamente si se deja vacío"
                  />
                </div>
              </div>
            </div>
          </div>

          <div
            className={`bg-white rounded-lg shadow ${
              productCreated ? "opacity-60" : ""
            }`}
          >
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Precio e Inventario
                {productCreated && (
                  <span className="ml-2 text-sm text-green-600 font-medium">
                    ✓ Completado
                  </span>
                )}
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
              {/* Selector de tipo de producto */}
              <div>
                <label
                  htmlFor="product_type"
                  className="block text-sm font-medium text-gray-800 mb-2"
                >
                  Tipo de Producto *
                </label>
                <Select
                  disabled={productCreated}
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

              {/* Selector de grupo de precios para perfiles y chapas conformadas */}
              {(formData.product_type === "perfiles" ||
                formData.product_type === "chapas_conformadas") && (
                <div>
                  <label
                    htmlFor="price_group_id"
                    className="block text-sm font-medium text-gray-800 mb-2"
                  >
                    Grupo de Precios *
                  </label>
                  <Select
                    disabled={productCreated}
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
                          ? selectedGroup.price_per_kg_usd.toString()
                          : prev.price_per_kg,
                      }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar grupo de precios" />
                    </SelectTrigger>
                    <SelectContent>
                      {priceGroups.map((group) => (
                        <SelectItem key={group.id} value={group.id}>
                          {group.name} - ${group.price_per_kg_usd}/kg USD
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
                            disabled={
                              productCreated || formData.price_group_id !== ""
                            }
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
                              $
                              {(
                                parseFloat(formData.price_per_kg) *
                                (exchangeRate.venta || exchangeRate.usd_to_uyu)
                              ).toFixed(2)}{" "}
                              UYU por kg
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
                        disabled={productCreated}
                        value={formData.weight_per_unit}
                        onChange={handleInputChange}
                        placeholder="0.000"
                      />
                    </div>
                  </div>

                  {/* Precio calculado automáticamente */}
                  <div className="mt-4 p-3 bg-green-50 rounded-md border border-green-200">
                    <div className="space-y-2">
                      <p className="text-sm text-green-800">
                        <strong>
                          Precio Total Calculado (USD):{" "}
                          {formatUSD(parseFloat(formData.price) || 0)}
                        </strong>
                        {formData.price_per_kg && formData.weight_per_unit && (
                          <span className="text-xs text-green-600 block">
                            ({formData.weight_per_unit} kg ×{" "}
                            {formatUSD(parseFloat(formData.price_per_kg))}/kg)
                          </span>
                        )}
                      </p>
                      {formData.price && exchangeRate && (
                        <p className="text-sm text-blue-800 font-medium">
                          <strong>
                            Equivalente en Pesos:{" "}
                            {formatUYU(
                              convertUSDToUYU(
                                parseFloat(formData.price),
                                exchangeRate.usd_to_uyu
                              )
                            )}
                          </strong>
                          <span className="text-xs text-blue-600 block">
                            (Cotización: ${exchangeRate.usd_to_uyu.toFixed(2)}{" "}
                            UYU)
                          </span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Stock como disponibilidad */}
                  <div className="mt-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="is_available"
                        checked={formData.is_available}
                        onChange={handleInputChange}
                        disabled={productCreated}
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
                            disabled={
                              productCreated || formData.price_group_id !== ""
                            }
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
                              $
                              {(
                                parseFloat(formData.price_per_kg) *
                                (exchangeRate.venta || exchangeRate.usd_to_uyu)
                              ).toFixed(2)}{" "}
                              UYU por kg
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
                        disabled={productCreated}
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
                        ${formData.price || "0.00"} USD
                      </span>
                    </div>
                    {formData.kg_per_meter && formData.price_per_kg && (
                      <p className="text-xs text-gray-600 mt-1">
                        {formData.kg_per_meter} kg/m × ${formData.price_per_kg}{" "}
                        USD/kg = ${formData.price} USD/m
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
                        checked={formData.is_available}
                        onChange={handleInputChange}
                        disabled={productCreated}
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
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-700">
                            $
                          </span>
                          <input
                            type="number"
                            id="price"
                            name="price"
                            required
                            step="0.01"
                            disabled={productCreated}
                            value={formData.price}
                            onChange={handleInputChange}
                            className="pl-8 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 placeholder-gray-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                            placeholder="0.00"
                          />
                        </div>
                        {formData.price && exchangeRate && (
                          <div className="text-xs bg-gray-50 border border-gray-200 p-2 rounded">
                            <span className="text-gray-600">Equivalente: </span>
                            <span className="font-semibold text-gray-900">
                              $
                              {(
                                parseFloat(formData.price) *
                                (exchangeRate.venta || exchangeRate.usd_to_uyu)
                              ).toFixed(2)}{" "}
                              UYU
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
                        disabled={productCreated}
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
                      <select
                        id="unit"
                        name="unit"
                        required
                        disabled={productCreated}
                        value={formData.unit}
                        onChange={handleInputChange}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      >
                        <option value="">Seleccionar unidad</option>
                        {units.map((unit) => (
                          <option key={unit} value={unit}>
                            {unit}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

              {/* Producto destacado */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="featured"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleInputChange}
                  disabled={productCreated}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:cursor-not-allowed"
                />
                <label
                  htmlFor="featured"
                  className="ml-2 block text-sm text-gray-900"
                >
                  Producto destacado
                </label>
              </div>
            </div>
          </div>

          {/* Sección de imágenes */}
          <div
            className={`bg-white rounded-lg shadow ${
              !productCreated ? "opacity-60" : ""
            }`}
          >
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Imágenes del Producto
              </h2>
            </div>
            <div className="p-6 space-y-6">
              {productCreated && createdProductId ? (
                // Mostrar ImageUpload después de crear el producto
                <ImageUpload
                  productId={createdProductId}
                  images={images}
                  onImagesChange={setImages}
                  maxImages={10}
                  maxFileSize={5}
                />
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>
                    Completa la información básica primero para agregar
                    imágenes.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-4">
            <Link
              href="/admin/productos"
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancelar
            </Link>

            {!productCreated ? (
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <SaveIcon className="h-4 w-4 mr-2" />
                )}
                {loading ? "Creando..." : "Crear Producto"}
              </button>
            ) : (
              <Link
                href="/admin/productos"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <SaveIcon className="h-4 w-4 mr-2" />
                Finalizar
              </Link>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
