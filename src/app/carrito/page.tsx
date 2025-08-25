"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useCartStore } from "@/store/cartStore";
import {
  TrashIcon,
  PlusIcon,
  MinusIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import { useExchangeRate, formatUYU, convertUSDToUYU } from "@/lib/currency";
import {
  Product,
  ProductImage as ProductImageType,
  CalculationDetail,
} from "@/types";
import ProductImage from "@/components/ProductImage";

export default function CarritoPage() {
  const { cart, removeItem, updateQuantity, clearCart } = useCartStore();
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [productImages, setProductImages] = useState<{
    [key: string]: ProductImageType[];
  }>({});

  // Hook para cotización de dólar
  const { exchangeRate } = useExchangeRate();

  // Cargar imágenes de los productos del carrito
  useEffect(() => {
    const loadProductImages = async () => {
      const imagesPromises = cart.items.map(async (item) => {
        try {
          const response = await fetch(
            `/api/products/${item.product.id}/images`
          );
          if (response.ok) {
            const images = await response.json();
            return { productId: item.product.id, images };
          }
        } catch (error) {
          console.error(
            `Error loading images for product ${item.product.id}:`,
            error
          );
        }
        return { productId: item.product.id, images: [] };
      });

      const imagesResults = await Promise.all(imagesPromises);
      const imagesMap: { [key: string]: ProductImageType[] } = {};

      imagesResults.forEach(({ productId, images }) => {
        imagesMap[productId] = images;
      });

      setProductImages(imagesMap);
    };

    if (cart.items.length > 0) {
      loadProductImages();
    }
  }, [cart.items]);

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
        // Si es un array o tiene metadata, intentar extraer la descripción
        if (Array.isArray(parsed)) {
          return product.name;
        }
        if (parsed.meta && parsed.meta.description) {
          return parsed.meta.description;
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

  // Función para extraer el resumen de cálculos de la calculadora
  const getCalculatorSummary = (
    product: Product,
    quantity: number,
    calculationDetails?: CalculationDetail[]
  ) => {
    try {
      // Si hay detalles de cálculo guardados, mostrarlos
      if (calculationDetails && calculationDetails.length > 0) {
        if (calculationDetails.length === 1) {
          // Solo un cálculo
          const calc = calculationDetails[0];
          return {
            hasCalculation: true,
            summary: `Calculadora: ${calc.largo}m × ${calc.cantidad} = ${quantity} metros`,
          };
        } else {
          // Múltiples cálculos
          return {
            hasCalculation: true,
            summary: `Calculadora: ${quantity} metros totales`,
            calculationList: calculationDetails,
          };
        }
      }

      // Solo mostrar para chapas conformadas
      if (product.product_type === "chapas_conformadas") {
        // Si la cantidad tiene decimales precisos que sugieren uso de calculadora
        if (quantity % 1 !== 0) {
          const decimalPart = quantity.toString().split(".")[1];
          // Si tiene decimales con más de 1 dígito o terminaciones que sugieren cálculo
          if (decimalPart && (decimalPart.length > 1 || quantity % 0.1 !== 0)) {
            return {
              hasCalculation: true,
              summary: `Resultado de calculadora: ${quantity} metros totales`,
            };
          } else {
            return {
              hasCalculation: true,
              summary: `Cantidad: ${quantity} metros`,
            };
          }
        }
      }

      // También verificar si hay metadata de cálculo en la descripción
      if (
        product.description?.startsWith("{") ||
        product.description?.startsWith("[")
      ) {
        const parsed = JSON.parse(product.description);
        if (parsed.calculation_summary) {
          return {
            hasCalculation: true,
            summary: parsed.calculation_summary,
          };
        }
      }
    } catch (error) {
      // Ignorar errores de parsing
    }

    return { hasCalculation: false, summary: null, calculationList: undefined };
  };

  // Función para verificar si el envío es gratuito (total con IVA >= $50.000 UYU)
  const isShippingFree = () => {
    if (!exchangeRate) return false;

    const totalWithIVAInUYU =
      convertUSDToUYU(cart.total, exchangeRate.usd_to_uyu) * 1.22;
    return totalWithIVAInUYU >= 50000;
  };

  // Función para calcular el costo de envío ($700 UYU + IVA = $854 UYU)
  const getShippingCostUSD = () => {
    if (!exchangeRate) return 0.7; // Fallback aproximado

    const shippingCostUYU = 700 * 1.22; // $700 + 22% IVA = $854
    return shippingCostUYU / exchangeRate.usd_to_uyu;
  };

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    setIsUpdating(productId);
    setTimeout(() => {
      updateQuantity(productId, newQuantity);
      setIsUpdating(null);
    }, 100);
  };

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md mx-auto">
          <div className="text-4xl sm:text-6xl mb-4">🛒</div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
            Tu carrito está vacío
          </h1>
          <p className="text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base">
            Agrega algunos productos para comenzar tu compra
          </p>
          <Link
            href="/productos"
            className="inline-block bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors text-sm sm:text-base"
          >
            Ver Productos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <Link
            href="/productos"
            className="inline-flex items-center text-orange-600 hover:text-orange-700 mb-4 text-sm sm:text-base"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Continuar comprando
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Carrito de Compras
          </h1>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8">
          {/* Cart Items */}
          <div className="xl:col-span-2">
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-4 sm:p-6 border-b border-gray-200">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                  Productos ({cart.items.length})
                </h2>
              </div>

              <div className="divide-y divide-gray-200">
                {cart.items.map((item) => (
                  <div key={item.product.id} className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      {/* Product Image */}
                      <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20">
                        {productImages[item.product.id] &&
                        productImages[item.product.id].length > 0 ? (
                          <ProductImage
                            src={productImages[item.product.id][0].image_url}
                            alt={item.product.name}
                            className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg"
                            width={80}
                            height={80}
                          />
                        ) : (
                          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                            <span className="text-xl sm:text-2xl">🏗️</span>
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg font-medium text-gray-900">
                          {item.product.name}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-500 mb-2">
                          {getProductDescription(item.product)}
                        </p>

                        {/* Resumen de cálculos de la calculadora */}
                        {(() => {
                          const calculatorSummary = getCalculatorSummary(
                            item.product,
                            item.quantity,
                            item.calculationDetails
                          );
                          if (calculatorSummary.hasCalculation) {
                            return (
                              <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded mb-2 border border-blue-200">
                                <div>🧮 {calculatorSummary.summary}</div>
                                {calculatorSummary.calculationList &&
                                  calculatorSummary.calculationList.length >
                                    0 && (
                                    <div className="text-xs text-blue-500 mt-2 space-y-1">
                                      {calculatorSummary.calculationList.map(
                                        (calc, index) => (
                                          <div
                                            key={calc.id || index}
                                            className="font-mono bg-white px-2 py-1 rounded border"
                                          >
                                            {calc.largo}m × {calc.cantidad} ={" "}
                                            {calc.total}m
                                          </div>
                                        )
                                      )}
                                    </div>
                                  )}
                              </div>
                            );
                          }
                          return null;
                        })()}

                        {item.product.brand && (
                          <div className="text-xs text-gray-400">
                            Marca: {item.product.brand}
                          </div>
                        )}
                      </div>

                      {/* Mobile Actions Row */}
                      <div className="flex items-center justify-between sm:hidden mt-3">
                        {/* Quantity Controls */}
                        <div className="flex items-center border border-gray-300 rounded">
                          <button
                            onClick={() =>
                              handleQuantityChange(
                                item.product.id,
                                item.quantity - 1
                              )
                            }
                            disabled={isUpdating === item.product.id}
                            className="p-2 hover:bg-gray-100 disabled:opacity-50"
                          >
                            <MinusIcon className="h-4 w-4" />
                          </button>
                          <span className="px-3 py-2 text-center min-w-[50px] text-sm">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              handleQuantityChange(
                                item.product.id,
                                item.quantity + 1
                              )
                            }
                            disabled={isUpdating === item.product.id}
                            className="p-2 hover:bg-gray-100 disabled:opacity-50"
                          >
                            <PlusIcon className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => removeItem(item.product.id)}
                          className="text-red-600 hover:text-red-800 p-2"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>

                      {/* Desktop Actions */}
                      <div className="hidden sm:flex items-center space-x-4">
                        <div className="flex items-center border border-gray-300 rounded">
                          <button
                            onClick={() =>
                              handleQuantityChange(
                                item.product.id,
                                item.quantity - 1
                              )
                            }
                            disabled={isUpdating === item.product.id}
                            className="p-2 hover:bg-gray-100 disabled:opacity-50"
                          >
                            <MinusIcon className="h-4 w-4" />
                          </button>
                          <span className="px-4 py-2 text-center min-w-[60px]">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              handleQuantityChange(
                                item.product.id,
                                item.quantity + 1
                              )
                            }
                            disabled={isUpdating === item.product.id}
                            className="p-2 hover:bg-gray-100 disabled:opacity-50"
                          >
                            <PlusIcon className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => removeItem(item.product.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>

                    {/* Item Total */}
                    <div className="mt-3 sm:mt-4 flex justify-between items-center">
                      <div className="text-right">
                        <div className="text-base sm:text-lg font-semibold text-gray-900">
                          {formatPriceWithIVA(
                            item.product.price * item.quantity
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          IVA incluido (22%)
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Clear Cart Button */}
              <div className="p-6 border-t border-gray-200">
                <button
                  onClick={clearCart}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Vaciar carrito
                </button>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Resumen del Pedido
              </h2>

              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal (sin IVA):</span>
                  <span className="text-gray-900">
                    {formatPrice(cart.total)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">IVA (22%):</span>
                  <span className="text-gray-900">
                    {formatPrice(cart.total * 0.22)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal con IVA:</span>
                  <span className="text-gray-900">
                    {formatPriceWithIVA(cart.total)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Envío:</span>
                  <span className="text-green-600">
                    {isShippingFree() ? "Gratis" : formatUYU(700 * 1.22)}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total:</span>
                    <span className="text-orange-600">
                      {isShippingFree()
                        ? formatPriceWithIVA(cart.total)
                        : formatPriceWithIVA(cart.total + getShippingCostUSD())}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 text-right mt-1">
                    IVA incluido (22%)
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <Link
                  href="/checkout"
                  className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-orange-700 transition-colors text-center block"
                >
                  Proceder al Pago
                </Link>

                <Link
                  href="/productos"
                  className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-center block"
                >
                  Continuar Comprando
                </Link>
              </div>

              {/* Shipping Info */}
              <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <div className="text-green-600 mr-2">🚚</div>
                  <div className="text-sm">
                    <p className="font-medium text-green-800">Envío gratis</p>
                    <p className="text-green-600">
                      En compras superiores a $50.000 UYU (con IVA)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
