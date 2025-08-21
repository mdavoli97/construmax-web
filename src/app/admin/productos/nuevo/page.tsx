"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { productService } from "@/lib/services";
import { ArrowLeftIcon, SaveIcon } from "lucide-react";

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    image: "",
    stock: "",
    unit: "",
    brand: "",
    sku: "",
    featured: false,
  });

  const categories = [
    { value: "construccion", label: "Construcción" },
    { value: "metalurgica", label: "Metalúrgica" },
    { value: "herramientas", label: "Herramientas" },
    { value: "herreria", label: "Herrería" },
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
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
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
        alert("El nombre del producto es requerido");
        setLoading(false);
        return;
      }

      if (
        !formData.price ||
        isNaN(parseFloat(formData.price)) ||
        parseFloat(formData.price) <= 0
      ) {
        alert("El precio debe ser un número mayor a 0");
        setLoading(false);
        return;
      }

      if (!formData.category) {
        alert("La categoría es requerida");
        setLoading(false);
        return;
      }

      if (
        !formData.stock ||
        isNaN(parseInt(formData.stock)) ||
        parseInt(formData.stock) < 0
      ) {
        alert("El stock debe ser un número mayor o igual a 0");
        setLoading(false);
        return;
      }

      if (!formData.unit.trim()) {
        alert("La unidad es requerida");
        setLoading(false);
        return;
      }

      // Generar SKU si no se proporcionó uno
      const sku = formData.sku.trim() || generateSKU();

      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        price: parseFloat(formData.price),
        category: formData.category,
        image: formData.image.trim() || undefined,
        stock: parseInt(formData.stock),
        unit: formData.unit.trim(),
        brand: formData.brand.trim() || undefined,
        sku,
        featured: formData.featured,
      };

      console.log("Enviando datos del producto:", productData);
      await productService.create(productData);
      alert("Producto creado exitosamente");
      router.push("/admin/productos");
    } catch (error) {
      console.error("Error creating product:", error);
      alert(
        `Error al crear el producto: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
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
            Agregar Nuevo Producto
          </h1>
          <p className="text-gray-800 mt-2">
            Complete la información del producto
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-6">
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
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                    placeholder="Ej: Cemento Portland"
                  />
                </div>

                <div>
                  <label
                    htmlFor="brand"
                    className="block text-sm font-medium text-gray-800 mb-2"
                  >
                    Marca
                  </label>
                  <input
                    type="text"
                    id="brand"
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                    placeholder="Ej: ANCAP"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-800 mb-2"
                >
                  Descripción
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                  placeholder="Descripción detallada del producto"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="category"
                    className="block text-sm font-medium text-gray-800 mb-2"
                  >
                    Categoría *
                  </label>
                  <select
                    id="category"
                    name="category"
                    required
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
                  >
                    <option value="">Seleccionar categoría</option>
                    {categories.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="sku"
                    className="block text-sm font-medium text-gray-800 mb-2"
                  >
                    SKU
                  </label>
                  <input
                    type="text"
                    id="sku"
                    name="sku"
                    value={formData.sku}
                    onChange={handleInputChange}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                    placeholder="Se generará automáticamente si se deja vacío"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Precio e Inventario
              </h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label
                    htmlFor="price"
                    className="block text-sm font-medium text-gray-800 mb-2"
                  >
                    Precio *
                  </label>
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
                      value={formData.price}
                      onChange={handleInputChange}
                      className="pl-8 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="stock"
                    className="block text-sm font-medium text-gray-800 mb-2"
                  >
                    Stock *
                  </label>
                  <input
                    type="number"
                    id="stock"
                    name="stock"
                    required
                    min="0"
                    value={formData.stock}
                    onChange={handleInputChange}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
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
                    value={formData.unit}
                    onChange={handleInputChange}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
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
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Imagen y Configuración
              </h2>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label
                  htmlFor="image"
                  className="block text-sm font-medium text-gray-800 mb-2"
                >
                  URL de la Imagen
                </label>
                <input
                  type="url"
                  id="image"
                  name="image"
                  value={formData.image}
                  onChange={handleInputChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="featured"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
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

          {/* Botones */}
          <div className="flex justify-end space-x-4">
            <Link
              href="/admin/productos"
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancelar
            </Link>
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
              {loading ? "Guardando..." : "Guardar Producto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
