"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { productService } from "@/lib/services";
import { Product, ProductImage } from "@/types";
import { ArrowLeftIcon, SaveIcon } from "lucide-react";

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [productImages, setProductImages] = useState<ProductImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    primary_image: "",
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

  useEffect(() => {
    loadProduct();
  }, [productId]);

  const loadProduct = async () => {
    try {
      const productData = await productService.getById(productId);
      if (productData) {
        setProduct(productData);
        setFormData({
          name: productData.name,
          description: productData.description || "",
          price: productData.price.toString(),
          category: productData.category,
          primary_image: productData.primary_image || "",
          stock: productData.stock.toString(),
          unit: productData.unit,
          brand: productData.brand || "",
          sku: productData.sku,
          featured: productData.featured || false,
        });

        // Cargar imágenes del producto
        loadProductImages();
      }
    } catch (error) {
      console.error("Error loading product:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadProductImages = async () => {
    try {
      const images = await productService.getImages(productId);
      setProductImages(images);
    } catch (error) {
      console.error("Error loading product images:", error);
    }
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const updatedData = {
        name: formData.name,
        description: formData.description || undefined,
        price: parseFloat(formData.price),
        category: formData.category,
        primary_image: formData.primary_image || undefined,
        stock: parseInt(formData.stock),
        unit: formData.unit,
        brand: formData.brand || undefined,
        sku: formData.sku,
        featured: formData.featured,
      };

      await productService.update(productId, updatedData);
      alert("Producto actualizado exitosamente");
      router.push("/admin/productos");
    } catch (error) {
      console.error("Error updating product:", error);
      alert("Error al actualizar el producto");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Producto no encontrado
          </h2>
          <Link
            href="/admin/productos"
            className="text-blue-600 hover:text-blue-800"
          >
            Volver a productos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
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
          <h1 className="text-3xl font-bold text-gray-900">Editar Producto</h1>
          <p className="text-gray-800 mt-2">
            Modifica la información del producto
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
                    SKU *
                  </label>
                  <input
                    type="text"
                    id="sku"
                    name="sku"
                    required
                    value={formData.sku}
                    onChange={handleInputChange}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
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
                  htmlFor="primary_image"
                  className="block text-sm font-medium text-gray-800 mb-2"
                >
                  URL de la Imagen Principal (opcional)
                </label>
                <input
                  type="url"
                  id="primary_image"
                  name="primary_image"
                  value={formData.primary_image}
                  onChange={handleInputChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                  placeholder="Se establecerá automáticamente desde las imágenes subidas"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Puedes usar el gestor de imágenes arriba o ingresar una URL
                  directamente
                </p>
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
              disabled={saving}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {saving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <SaveIcon className="h-4 w-4 mr-2" />
              )}
              {saving ? "Guardando..." : "Actualizar Producto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
