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
import { Product, ProductImage, CalculationDetail } from "@/types";
import { useCartStore } from "@/store/cartStore";
import ProductCard from "@/components/ProductCard";
import ProductImageGallery from "@/components/ProductImageGallery";
import ChapasCalculator from "@/components/ChapasCalculator";
import { useExchangeRate, formatUYU, convertUSDToUYU } from "@/lib/currency";
import { Input } from "@/components/ui/input";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [productImages, setProductImages] = useState<ProductImage[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState<string | number>(1);
  const [showCalculator, setShowCalculator] = useState(false);
  const [calculationDetails, setCalculationDetails] = useState<
    CalculationDetail[] | undefined
  >(undefined);
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

          // Establecer cantidad inicial basada en tipo de producto
          const productType =
            productData.product_type ||
            (() => {
              try {
                if (
                  productData.description?.startsWith("{") ||
                  productData.description?.startsWith("[")
                ) {
                  const parsed = JSON.parse(productData.description);
                  const metadata = parsed.meta || parsed;
                  return metadata.product_type || "standard";
                }
              } catch (error) {
                // Ignorar errores de parsing
              }
              return "standard";
            })();

          // La cantidad inicial siempre es 1, independientemente del tipo de producto
          setQuantity(1);

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

  // Función auxiliar para redondear a 2 decimales y evitar problemas de punto flotante
  const roundToTwoDecimals = (num: number): number => {
    return Math.round(num * 100) / 100;
  };

  // Función auxiliar para obtener quantity como número
  const getQuantityAsNumber = (): number => {
    if (typeof quantity === "string") {
      const parsed = parseFloat(quantity);
      return isNaN(parsed) ? 0 : roundToTwoDecimals(parsed);
    }
    return roundToTwoDecimals(quantity);
  };

  const handleAddToCart = () => {
    const quantityNum = getQuantityAsNumber();
    if (product && quantityNum > 0) {
      const isChapas = getProductType(product) === "chapas_conformadas";
      const minValue = isChapas ? 0.1 : 1;

      // Validar cantidad mínima antes de agregar
      if (quantityNum < minValue) {
        alert(`La cantidad mínima es ${minValue}`);
        setQuantity(minValue);
        return;
      }

      addItem(product, quantityNum, calculationDetails);
      // Siempre resetear a 1 después de agregar al carrito
      setQuantity(1);
      // Limpiar detalles de cálculo después de agregar
      setCalculationDetails(undefined);
    }
  };

  // Función para obtener el tipo de producto
  const getProductType = (product: Product) => {
    // Usar campo directo de la base de datos si está disponible
    if (product.product_type) {
      return product.product_type;
    }

    // Fallback: parsear JSON del description
    try {
      if (
        product.description?.startsWith("{") ||
        product.description?.startsWith("[")
      ) {
        const parsed = JSON.parse(product.description);
        const metadata = parsed.meta || parsed;
        return metadata.product_type || "standard";
      }
    } catch (error) {
      // Ignorar errores de parsing
    }

    return "standard";
  };

  const handleQuantityInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const inputValue = e.target.value;

    // Permitir campo vacío para que el usuario pueda escribir desde cero
    if (inputValue === "") {
      setQuantity("");
      return;
    }

    // Validar que solo contenga números y punto decimal
    if (!/^\d*\.?\d*$/.test(inputValue)) {
      return;
    }

    const value = parseFloat(inputValue);

    // Permitir cualquier número válido mientras se escribe, incluyendo valores parciales como "4."
    if (!isNaN(value) || inputValue.endsWith(".")) {
      setQuantity(inputValue);
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-24 w-24 sm:h-32 sm:w-32 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-sm sm:text-base">
            Cargando producto...
          </p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md mx-auto">
          <div className="text-4xl sm:text-6xl mb-4">❌</div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
            Producto no encontrado
          </h2>
          <p className="text-gray-600 mb-4 text-sm sm:text-base">
            El producto que buscas no existe o fue eliminado.
          </p>
          <button
            onClick={() => router.push("/productos")}
            className="bg-orange-600 text-white px-6 py-3 rounded-md hover:bg-orange-700 transition-colors text-sm sm:text-base"
          >
            Volver a Productos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Breadcrumbs */}
        <nav className="hidden md:flex items-center text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
          <div className="flex items-center space-x-2 overflow-x-auto scrollbar-hide min-w-0">
            <Link
              href="/"
              className="flex items-center hover:text-orange-600 transition-colors flex-shrink-0"
            >
              <HomeIcon className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Inicio</span>
            </Link>
            <span className="flex-shrink-0 text-gray-400">/</span>
            <Link
              href="/productos"
              className="hover:text-orange-600 transition-colors flex-shrink-0"
            >
              Productos
            </Link>
            {product.category && (
              <>
                <span className="flex-shrink-0 text-gray-400">/</span>
                <Link
                  href={`/productos/${product.category}`}
                  className="hover:text-orange-600 transition-colors capitalize flex-shrink-0 max-w-[120px] sm:max-w-none truncate"
                >
                  {product.category}
                </Link>
              </>
            )}
            <span className="flex-shrink-0 text-gray-400">/</span>
            <span className="text-gray-900 font-medium max-w-[150px] sm:max-w-[300px] truncate">
              {product.name}
            </span>
          </div>
        </nav>

        {/* Back Button */}
        <button
          onClick={goBack}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4 sm:mb-6 transition-colors text-sm sm:text-base"
        >
          <ArrowLeftIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
          Volver
        </button>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 p-4 sm:p-6">
            {/* Product Images */}
            <div className="w-full max-w-lg mx-auto lg:mx-0">
              <ProductImageGallery
                product={product}
                productImages={productImages}
              />
            </div>

            {/* Product Info */}
            <div className="space-y-4 sm:space-y-6">
              {/* Featured Badge */}
              {product.featured && (
                <div className="inline-block bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Producto Destacado
                </div>
              )}

              {/* Product Title */}
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  {product.name}
                </h1>
                <p className="text-lg sm:text-xl text-gray-600">
                  {getProductDescription(product)}
                </p>
              </div>

              {/* Price */}
              <div className="border-t border-b border-gray-200 py-4">
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <span className="text-xl sm:text-2xl font-bold text-orange-600">
                      {formatPriceWithIVA(product.price)}
                    </span>
                    <span className="text-base sm:text-lg text-gray-500">
                      {getPriceUnit(product)}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                    <span className="text-xs sm:text-sm text-gray-600">
                      Sin IVA: {formatPrice(product.price)}
                    </span>
                    <span className="text-xs sm:text-sm text-gray-500">
                      IVA incluido (22%)
                    </span>
                  </div>
                </div>
              </div>

              {/* Product Details */}
              <div className="space-y-3">
                {product.brand && (
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                    <span className="font-medium text-gray-700 text-sm sm:text-base">
                      Marca:
                    </span>
                    <span className="text-gray-900 text-sm sm:text-base">
                      {product.brand}
                    </span>
                  </div>
                )}

                <div className="flex sm:flex-row sm:justify-between gap-1">
                  <span className="font-medium text-gray-700 text-sm sm:text-base">
                    Estado:
                  </span>
                  <span
                    className={`font-medium text-sm sm:text-base ${getStockColor(
                      product
                    )}`}
                  >
                    {getStockDisplay(product)}
                  </span>
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="space-y-4">
                {/* Información contextual sobre opciones de cantidad */}
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                  <p className="text-xs sm:text-sm text-blue-800">
                    <span className="font-medium">
                      💡 Opciones para agregar cantidad:
                    </span>
                    <br />• Puedes escribir la cantidad directamente en el campo
                    {product &&
                      getProductType(product) === "chapas_conformadas" && (
                        <>
                          <br />• O usar nuestra calculadora de chapas para
                          cálculos automáticos
                        </>
                      )}
                    {product &&
                      getProductType(product) !== "chapas_conformadas" && (
                        <>
                          <br />• Cantidad mínima: 1 unidad
                        </>
                      )}
                  </p>
                </div>

                <div className="flex flex-col w-full sm:flex-row sm:items-center gap-3 sm:gap-4">
                  <span className="font-medium text-gray-700 text-sm sm:text-base">
                    Cantidad:
                  </span>
                  <div className="flex items-center justify-between border border-gray-300 rounded-md w-full md:w-fit">
                    <button
                      onClick={() => {
                        const quantityNum = getQuantityAsNumber();
                        const isChapas =
                          product &&
                          getProductType(product) === "chapas_conformadas";
                        const step = isChapas ? 0.1 : 1;
                        const minValue = isChapas ? 0.1 : 1;
                        const newValue = Math.max(minValue, quantityNum - step);
                        // Redondear a 2 decimales para evitar problemas de punto flotante
                        setQuantity(Math.round(newValue * 100) / 100);
                      }}
                      className="p-2 sm:p-3 hover:bg-gray-100 transition-colors flex-shrink-0"
                    >
                      <MinusIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                    <Input
                      type="number"
                      value={quantity}
                      onChange={handleQuantityInputChange}
                      min="0"
                      step={
                        product &&
                        getProductType(product) === "chapas_conformadas"
                          ? "0.1"
                          : "1"
                      }
                      className="w-20 sm:w-24 text-center font-medium text-sm sm:text-base [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button
                      onClick={() => {
                        const quantityNum = getQuantityAsNumber();
                        const isChapas =
                          product &&
                          getProductType(product) === "chapas_conformadas";
                        const step = isChapas ? 0.1 : 1;
                        const maxQuantity = getMaxQuantity(product);
                        const newValue = Math.min(
                          maxQuantity,
                          quantityNum + step
                        );
                        // Redondear a 2 decimales para evitar problemas de punto flotante
                        setQuantity(Math.round(newValue * 100) / 100);
                      }}
                      className="p-2 sm:p-3 hover:bg-gray-100 transition-colors flex-shrink-0"
                      disabled={
                        getQuantityAsNumber() >= getMaxQuantity(product)
                      }
                    >
                      <PlusIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                  </div>

                  {/* Calculadora para chapas conformadas */}
                  {product &&
                    getProductType(product) === "chapas_conformadas" && (
                      <button
                        onClick={() => setShowCalculator(!showCalculator)}
                        className="bg-blue-500 text-white px-3 py-2 rounded-md hover:bg-blue-600 transition-colors text-xs sm:text-sm whitespace-nowrap"
                      >
                        🧮 Calculadora
                      </button>
                    )}
                </div>

                {/* Calculadora para chapas conformadas */}
                {showCalculator &&
                  product &&
                  getProductType(product) === "chapas_conformadas" && (
                    <ChapasCalculator
                      onCalculateResult={(
                        result: number,
                        details?: CalculationDetail[]
                      ) => {
                        setQuantity(roundToTwoDecimals(result));
                        setCalculationDetails(details);
                        // No cerrar la calculadora automáticamente
                      }}
                      onClose={() => setShowCalculator(false)}
                    />
                  )}

                {/* Total Price */}
                <div className="bg-gray-50 p-3 sm:p-4 rounded-md">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700 text-sm sm:text-base">
                      Total:
                    </span>
                    <span className="text-xl sm:text-2xl font-bold text-orange-600">
                      {formatPriceWithIVA(
                        product.price * getQuantityAsNumber()
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Add to Cart Button */}
              <div className="space-y-3">
                <button
                  onClick={handleAddToCart}
                  disabled={!isProductAvailable(product)}
                  className="w-full bg-orange-600 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-md hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2 text-base sm:text-lg font-medium min-h-[48px]"
                >
                  <ShoppingCartIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                  <span>
                    {!isProductAvailable(product)
                      ? "No disponible"
                      : "Agregar al carrito"}
                  </span>
                </button>

                {currentQuantity > 0 && (
                  <p className="text-xs sm:text-sm text-green-600 text-center font-medium">
                    ✓ {currentQuantity}{" "}
                    {currentQuantity === 1 ? "unidad" : "unidades"} en el
                    carrito
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Additional Product Information */}
          <div className="border-t border-gray-200 p-4 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">
                  Descripción del Producto
                </h3>
                <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
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
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">
                  Información Adicional
                </h3>
                <ul className="space-y-2 text-gray-600 text-sm sm:text-base">
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
          <div className="mt-8 sm:mt-12">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
              Productos Relacionados
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
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
