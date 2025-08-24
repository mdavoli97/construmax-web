"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeftIcon,
  ShoppingCartIcon,
  PlusIcon,
  MinusIcon,
  HomeIcon,
} from "@heroicons/react/24/outline";
import { Product, ProductImage } from "@/types";
import { useCartStore } from "@/store/cartStore";
import ProductCard from "@/components/ProductCard";
import ProductImageGallery from "@/components/ProductImageGallery";
import { useExchangeRate, formatUYU, convertUSDToUYU } from "@/lib/currency";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [productImages, setProductImages] = useState<ProductImage[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addItem, getItemQuantity } = useCartStore();

  // Hook para cotización de dólar
  const { exchangeRate } = useExchangeRate();

  const currentQuantity = product ? getItemQuantity(product.id) : 0;

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${params.id}`);
        if (response.ok) {
          const productData = await response.json();
          setProduct(productData);

          // Fetch product images
          try {
            const imagesResponse = await fetch(
              `/api/products/${params.id}/images`
            );
            if (imagesResponse.ok) {
              const imagesData = await imagesResponse.json();
              setProductImages(imagesData);
            }
          } catch (error) {
            console.error("Error fetching product images:", error);
          }

          // Fetch related products from the same category
          if (productData.category) {
            const relatedResponse = await fetch(
              `/api/products?category=${productData.category}&limit=4&exclude=${productData.id}`
            );
            if (relatedResponse.ok) {
              const relatedData = await relatedResponse.json();
              setRelatedProducts(relatedData);
            }
          }
        } else {
          router.push("/productos");
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        router.push("/productos");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchProduct();
    }
  }, [params.id, router]);

  const handleAddToCart = () => {
    if (product) {
      addItem(product, quantity);
      setQuantity(1);
    }
  };

  // Función para verificar si el producto está disponible
  const isProductAvailable = (product: Product) => {
    // Usar campos directos de la base de datos si están disponibles
    if (
      (product.product_type === "perfiles" ||
        product.product_type === "chapas_conformadas") &&
      product.stock_type === "availability"
    ) {
      return product.is_available;
    }

    // Fallback: usar metadata del JSON
    const metadata = getProductMetadata(product);
    if (
      metadata &&
      (metadata.product_type === "perfiles" ||
        metadata.product_type === "chapas_conformadas") &&
      metadata.stock_type === "availability"
    ) {
      return metadata.is_available;
    }

    return product.stock > 0;
  };

  // Función para obtener el límite máximo de cantidad
  const getMaxQuantity = (product: Product) => {
    // Usar campos directos de la base de datos si están disponibles
    if (
      (product.product_type === "perfiles" ||
        product.product_type === "chapas_conformadas") &&
      product.stock_type === "availability"
    ) {
      return 10; // Límite arbitrario para productos por disponibilidad
    }

    // Fallback: usar metadata del JSON
    const metadata = getProductMetadata(product);
    if (
      metadata &&
      (metadata.product_type === "perfiles" ||
        metadata.product_type === "chapas_conformadas") &&
      metadata.stock_type === "availability"
    ) {
      return 10; // Límite arbitrario para productos por disponibilidad
    }

    return product.stock;
  };

  const formatPrice = (priceInUSD: number) => {
    if (!exchangeRate) {
      // Fallback: mostrar en USD si no hay cotización
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(priceInUSD);
    }

    const priceInUYU = convertUSDToUYU(priceInUSD, exchangeRate.usd_to_uyu);
    return formatUYU(priceInUYU);
  };

  const formatPriceWithIVA = (priceInUSD: number) => {
    if (!exchangeRate) {
      // Fallback: mostrar en USD si no hay cotización
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(priceInUSD * 1.22);
    }

    const priceInUYU = convertUSDToUYU(priceInUSD, exchangeRate.usd_to_uyu);
    const priceWithIVA = priceInUYU * 1.22; // 22% IVA
    return formatUYU(priceWithIVA);
  };

  // Función para extraer la descripción real del producto
  const getProductDescription = (product: Product) => {
    try {
      // Si la descripción parece ser JSON, intentar parsearlo
      if (
        product.description?.startsWith("{") ||
        product.description?.startsWith("[")
      ) {
        const parsed = JSON.parse(product.description);
        // Si es un objeto con descripción, usar esa
        if (parsed.description) {
          return parsed.description;
        }
        // Si es solo metadata, retornar descripción genérica
        return `${product.name} - Producto de alta calidad para construcción`;
      }
      // Si no es JSON, usar la descripción tal como está
      return (
        product.description ||
        `${product.name} - Producto de alta calidad para construcción`
      );
    } catch (error) {
      // Si hay error al parsear JSON, usar descripción tal como está
      return (
        product.description ||
        `${product.name} - Producto de alta calidad para construcción`
      );
    }
  };

  // Función para obtener información adicional del producto
  const getProductMetadata = (product: Product) => {
    try {
      if (
        product.description?.startsWith("{") ||
        product.description?.startsWith("[")
      ) {
        const parsed = JSON.parse(product.description);
        // Devolver la metadata que está en la propiedad 'meta'
        return parsed.meta || parsed;
      }
      return null;
    } catch (error) {
      return null;
    }
  };

  // Función para mostrar el stock según el tipo de producto
  const getStockDisplay = (product: Product) => {
    // Usar campos directos de la base de datos si están disponibles
    if (
      (product.product_type === "perfiles" ||
        product.product_type === "chapas_conformadas") &&
      product.stock_type === "availability"
    ) {
      return product.is_available ? "Disponible" : "No disponible";
    }

    // Fallback: usar metadata del JSON
    const metadata = getProductMetadata(product);
    if (
      metadata &&
      (metadata.product_type === "perfiles" ||
        metadata.product_type === "chapas_conformadas")
    ) {
      if (metadata.stock_type === "availability") {
        return metadata.is_available ? "Disponible" : "No disponible";
      }
    }

    // Para productos estándar o sin metadata
    if (product.stock === 0) {
      return "No disponible";
    } else if (product.stock === 999999 || product.stock > 1000) {
      return "Disponible";
    } else {
      return `${product.stock} ${product.unit} disponibles`;
    }
  };

  // Función para obtener el color del stock
  const getStockColor = (product: Product) => {
    // Usar campos directos de la base de datos si están disponibles
    if (
      (product.product_type === "perfiles" ||
        product.product_type === "chapas_conformadas") &&
      product.stock_type === "availability"
    ) {
      return product.is_available ? "text-green-600" : "text-red-600";
    }

    // Fallback: usar metadata del JSON
    const metadata = getProductMetadata(product);
    if (
      metadata &&
      (metadata.product_type === "perfiles" ||
        metadata.product_type === "chapas_conformadas")
    ) {
      return metadata.is_available ? "text-green-600" : "text-red-600";
    }

    return product.stock > 0 ? "text-green-600" : "text-red-600";
  };

  // Función para obtener la unidad de precio correcta
  const getPriceUnit = (product: Product) => {
    // Usar campos directos de la base de datos si están disponibles
    if (product.product_type === "perfiles") {
      return "por unidad"; // Para perfiles, el precio ya está calculado por unidad completa
    }

    if (product.product_type === "chapas_conformadas") {
      return "por metro"; // Para chapas conformadas, mostrar "por metro" en lugar de "por m"
    }

    // Fallback: usar metadata del JSON
    const metadata = getProductMetadata(product);
    if (metadata && metadata.product_type === "perfiles") {
      return "por unidad";
    }
    if (metadata && metadata.product_type === "chapas_conformadas") {
      return "por metro";
    }

    // Para otros productos, mostrar la unidad con formato mejorado
    if (product.unit === "m") {
      return "por metro";
    }
    if (product.unit === "kg") {
      return "por kilogramo";
    }

    return `por ${product.unit}`;
  };

  const goBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando producto...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Producto no encontrado
          </h2>
          <p className="text-gray-600 mb-4">
            El producto que buscas no existe o fue eliminado.
          </p>
          <button
            onClick={() => router.push("/productos")}
            className="bg-orange-600 text-white px-6 py-3 rounded-md hover:bg-orange-700 transition-colors"
          >
            Volver a Productos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <Link
            href="/"
            className="flex items-center hover:text-orange-600 transition-colors"
          >
            <HomeIcon className="h-4 w-4 mr-1" />
            Inicio
          </Link>
          <span>/</span>
          <Link
            href="/productos"
            className="hover:text-orange-600 transition-colors"
          >
            Productos
          </Link>
          {product.category && (
            <>
              <span>/</span>
              <Link
                href={`/productos/${product.category}`}
                className="hover:text-orange-600 transition-colors capitalize"
              >
                {product.category}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-gray-900 font-medium">{product.name}</span>
        </nav>

        {/* Back Button */}
        <button
          onClick={goBack}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Volver
        </button>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
            {/* Product Images */}
            <div className="w-full max-w-lg mx-auto lg:mx-0">
              <ProductImageGallery
                product={product}
                productImages={productImages}
              />
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              {/* Featured Badge */}
              {product.featured && (
                <div className="inline-block bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Producto Destacado
                </div>
              )}

              {/* Product Title */}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {product.name}
                </h1>
                <p className="text-xl text-gray-600">
                  {getProductDescription(product)}
                </p>
              </div>

              {/* Price */}
              <div className="border-t border-b border-gray-200 py-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-orange-600">
                      {formatPriceWithIVA(product.price)}
                    </span>
                    <span className="text-lg text-gray-500">
                      {getPriceUnit(product)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Sin IVA: {formatPrice(product.price)}
                    </span>
                    <span className="text-sm text-gray-500">
                      IVA incluido (22%)
                    </span>
                  </div>
                </div>
              </div>

              {/* Product Details */}
              <div className="space-y-3">
                {product.brand && (
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Marca:</span>
                    <span className="text-gray-900">{product.brand}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Estado:</span>
                  <span className={`font-medium ${getStockColor(product)}`}>
                    {getStockDisplay(product)}
                  </span>
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <span className="font-medium text-gray-700">Cantidad:</span>
                  <div className="flex items-center border border-gray-300 rounded-md">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 hover:bg-gray-100 transition-colors"
                    >
                      <MinusIcon className="h-5 w-5" />
                    </button>
                    <span className="px-4 py-2 text-center min-w-[80px] font-medium">
                      {quantity}
                    </span>
                    <button
                      onClick={() =>
                        setQuantity(
                          Math.min(getMaxQuantity(product), quantity + 1)
                        )
                      }
                      className="p-2 hover:bg-gray-100 transition-colors"
                      disabled={quantity >= getMaxQuantity(product)}
                    >
                      <PlusIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Total Price */}
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">Total:</span>
                    <span className="text-2xl font-bold text-orange-600">
                      {formatPriceWithIVA(product.price * quantity)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Add to Cart Button */}
              <div className="space-y-3">
                <button
                  onClick={handleAddToCart}
                  disabled={!isProductAvailable(product)}
                  className="w-full bg-orange-600 text-white py-3 px-6 rounded-md hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2 text-lg font-medium"
                >
                  <ShoppingCartIcon className="h-6 w-6" />
                  <span>
                    {!isProductAvailable(product)
                      ? "No disponible"
                      : "Agregar al carrito"}
                  </span>
                </button>

                {currentQuantity > 0 && (
                  <p className="text-sm text-green-600 text-center font-medium">
                    ✓ {currentQuantity}{" "}
                    {currentQuantity === 1 ? "unidad" : "unidades"} en el
                    carrito
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Additional Product Information */}
          <div className="border-t border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Descripción del Producto
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {getProductDescription(product)}
                </p>

                {/* Mostrar información adicional de perfiles si existe */}
                {(() => {
                  const metadata = getProductMetadata(product);
                  if (metadata && metadata.product_type === "perfiles") {
                    return (
                      <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <h4 className="font-semibold text-blue-900 mb-2">
                          Información del Perfil
                        </h4>
                        <div className="space-y-2 text-sm text-blue-800">
                          {metadata.weight_per_unit && (
                            <p>
                              <strong>Peso por unidad:</strong>{" "}
                              {metadata.weight_per_unit} kg
                            </p>
                          )}
                          {metadata.price_per_kg && (
                            <p>
                              <strong>Precio por kg:</strong> $
                              {metadata.price_per_kg} USD
                            </p>
                          )}
                          {metadata.stock_type === "availability" && (
                            <p>
                              <strong>Disponibilidad:</strong>{" "}
                              {metadata.is_available
                                ? "En stock"
                                : "Consultar disponibilidad"}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Información Adicional
                </h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• Producto de alta calidad para construcción</li>
                  <li>• Entrega rápida en Montevideo y interior</li>
                  <li>• Garantía de satisfacción</li>
                  <li>• Asesoramiento técnico incluido</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Productos Relacionados
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
