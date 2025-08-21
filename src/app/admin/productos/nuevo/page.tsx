"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { productService } from "@/lib/services";
import { ArrowLeftIcon, SaveIcon } from "lucide-react";
import { ProductImage } from "@/types";

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [productCreated, setProductCreated] = useState(false);
  const [createdProductId, setCreatedProductId] = useState<string | null>(null);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [addingUrlImage, setAddingUrlImage] = useState(false);
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

      // Validar URL de imagen si se proporcionó
      if (formData.primary_image.trim()) {
        if (formData.primary_image.length > 1000) {
          alert(
            "La URL de la imagen es demasiado larga (máximo 1000 caracteres)"
          );
          setLoading(false);
          return;
        }

        try {
          new URL(formData.primary_image);
        } catch {
          alert("La URL de la imagen no es válida");
          setLoading(false);
          return;
        }
      }

      // Generar SKU si no se proporcionó uno
      const sku = formData.sku.trim() || generateSKU();

      // Determinar imagen principal desde las imágenes subidas o URL manual
      const primaryImageUrl =
        images.find((img) => img.is_primary)?.image_url ||
        formData.primary_image.trim() ||
        undefined;

      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        price: parseFloat(formData.price),
        category: formData.category,
        primary_image: primaryImageUrl,
        stock: parseInt(formData.stock),
        unit: formData.unit.trim(),
        brand: formData.brand.trim() || undefined,
        sku,
        featured: formData.featured,
      };

      const createdProduct = await productService.create(productData);
      setCreatedProductId(createdProduct.id);
      setProductCreated(true);

      // Si se proporcionó una imagen por URL, agregarla automáticamente a la lista
      if (primaryImageUrl) {
        try {
          const primaryImage = await productService.addImage(
            createdProduct.id,
            {
              image_url: primaryImageUrl,
              alt_text: `Imagen principal de ${formData.name}`,
              is_primary: true,
              display_order: 0,
            }
          );
          setImages([primaryImage]);
        } catch (error) {
          console.error("Error adding primary image:", error);
          // No bloqueamos el flujo si falla la imagen
        }
      }

      alert(
        "Producto creado exitosamente. Ahora puedes agregar más imágenes si lo deseas."
      );
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

  const handleFinish = () => {
    router.push("/admin/productos");
  };

  const handleAddUrlImage = async () => {
    if (!newImageUrl.trim() || !createdProductId) return;

    // Validar URL
    if (newImageUrl.length > 1000) {
      alert("La URL es demasiado larga (máximo 1000 caracteres)");
      return;
    }

    try {
      new URL(newImageUrl);
    } catch {
      alert("La URL no es válida");
      return;
    }

    setAddingUrlImage(true);
    try {
      const newImage = await productService.addImage(createdProductId, {
        image_url: newImageUrl.trim(),
        alt_text: `Imagen de ${formData.name}`,
        is_primary: images.length === 0,
        display_order: images.length,
      });

      setImages([...images, newImage]);
      setNewImageUrl("");
      setShowUrlInput(false);
    } catch (error) {
      console.error("Error adding URL image:", error);
      alert(
        "Error al agregar la imagen por URL: " +
          (error instanceof Error ? error.message : "Error desconocido")
      );
    } finally {
      setAddingUrlImage(false);
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
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    disabled={productCreated}
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 placeholder-gray-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                    disabled={productCreated}
                    value={formData.brand}
                    onChange={handleInputChange}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 placeholder-gray-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                  disabled={productCreated}
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 placeholder-gray-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                    disabled={productCreated}
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                    disabled={productCreated}
                    value={formData.sku}
                    onChange={handleInputChange}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 placeholder-gray-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                      disabled={productCreated}
                      value={formData.price}
                      onChange={handleInputChange}
                      className="pl-8 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 placeholder-gray-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                    disabled={productCreated}
                    value={formData.stock}
                    onChange={handleInputChange}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 placeholder-gray-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Imágenes del Producto
              </h2>
            </div>
            <div className="p-6 space-y-6">
              {productCreated && createdProductId ? (
                // Mostrar ImageUpload después de crear el producto
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        Gestión de Imágenes
                      </h3>
                      <p className="text-sm text-gray-600">
                        Sube archivos desde tu computadora o agrega URLs de
                        imágenes
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowUrlInput(!showUrlInput)}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      {showUrlInput ? "Cancelar URL" : "Agregar por URL"}
                    </button>
                  </div>

                  {showUrlInput && (
                    <div className="bg-gray-50 p-4 rounded-lg border">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        URL de la imagen
                      </label>
                      <div className="flex space-x-3">
                        <div className="flex-1">
                          <input
                            type="url"
                            value={newImageUrl}
                            onChange={(e) => setNewImageUrl(e.target.value)}
                            placeholder="https://ejemplo.com/imagen.jpg"
                            maxLength={1000}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          />
                          <div className="text-right text-xs text-gray-500 mt-1">
                            <span
                              className={
                                newImageUrl.length > 900
                                  ? "text-orange-600"
                                  : ""
                              }
                            >
                              {newImageUrl.length}/1000
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleAddUrlImage}
                          disabled={
                            !newImageUrl.trim() ||
                            addingUrlImage ||
                            newImageUrl.length > 1000
                          }
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                          {addingUrlImage ? "Agregando..." : "Agregar"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                // Mostrar campo manual antes de crear el producto
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="primary_image"
                      className="block text-sm font-medium text-gray-800 mb-2"
                    >
                      URL de la Imagen Principal (Opcional)
                    </label>
                    <input
                      type="url"
                      id="primary_image"
                      name="primary_image"
                      value={formData.primary_image}
                      onChange={handleInputChange}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                      placeholder="https://ejemplo.com/imagen.jpg"
                      maxLength={1000}
                    />
                    <div className="flex justify-between text-sm text-gray-500 mt-1">
                      <span>
                        Si ya tienes una imagen en línea, puedes agregar su URL
                        aquí. También podrás subir imágenes desde tu computadora
                        en el siguiente paso.
                      </span>
                      <span
                        className={
                          formData.primary_image.length > 900
                            ? "text-orange-600"
                            : ""
                        }
                      >
                        {formData.primary_image.length}/1000
                      </span>
                    </div>
                  </div>

                  {formData.primary_image && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-800 mb-2">
                        Vista previa:
                      </p>
                      <div className="w-32 h-32 border border-gray-300 rounded-lg overflow-hidden relative">
                        <Image
                          src={formData.primary_image}
                          alt="Vista previa"
                          fill
                          className="object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display =
                              "none";
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

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
                {loading ? "Creando..." : "Continuar a Imágenes"}
              </button>
            ) : (
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={handleFinish}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Omitir Imágenes
                </button>
                <button
                  type="button"
                  onClick={handleFinish}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <SaveIcon className="h-4 w-4 mr-2" />
                  Finalizar
                </button>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
