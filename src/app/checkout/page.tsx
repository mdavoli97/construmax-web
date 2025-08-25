"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useExchangeRate, formatUYU, convertUSDToUYU } from "@/lib/currency";
import { Product } from "@/types";

interface CustomerData {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  zipCode: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, clearCart } = useCartStore();
  const [customerData, setCustomerData] = useState<CustomerData>({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    zipCode: "",
  });
  const [isProcessing, setIsProcessing] = useState(false);

  // Hook para cotización de dólar
  const { exchangeRate } = useExchangeRate();

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

  const shippingCost = isShippingFree() ? 0 : getShippingCostUSD();
  const total = cart.total + shippingCost;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCustomerData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Aquí iría la integración real con MercadoPago
      // Por ahora simulamos el proceso
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Simular éxito de pago
      alert("¡Pago procesado exitosamente! Redirigiendo a MercadoPago...");
      clearCart();
      router.push("/");
    } catch (error) {
      alert("Error al procesar el pago. Intenta nuevamente.");
    } finally {
      setIsProcessing(false);
    }
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
            Agrega algunos productos para proceder al checkout
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <Link
            href="/carrito"
            className="inline-flex items-center text-orange-600 hover:text-orange-700 mb-4 text-sm sm:text-base"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Volver al carrito
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Checkout
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Customer Form */}
          <div>
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">
                Información de Contacto
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Nombre completo *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={customerData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={customerData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Teléfono *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    required
                    value={customerData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label
                    htmlFor="address"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Dirección *
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    required
                    value={customerData.address}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="city"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Ciudad *
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      required
                      value={customerData.city}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="zipCode"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Código Postal *
                    </label>
                    <input
                      type="text"
                      id="zipCode"
                      name="zipCode"
                      required
                      value={customerData.zipCode}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isProcessing
                    ? "Procesando..."
                    : "Proceder al Pago con MercadoPago"}
                </button>
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Resumen del Pedido
              </h2>

              {/* Order Items */}
              <div className="space-y-4 mb-6">
                {cart.items.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex justify-between items-center"
                  >
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-900">
                        {item.product.name}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {getProductDescription(item.product)}
                      </p>
                      <p className="text-sm text-gray-500">
                        Cantidad: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium text-gray-900">
                        {formatPriceWithIVA(item.product.price * item.quantity)}
                      </span>
                      <p className="text-xs text-gray-500">IVA incluido</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t border-gray-200 pt-4 space-y-2">
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
                  <span
                    className={
                      shippingCost === 0 ? "text-green-600" : "text-gray-900"
                    }
                  >
                    {shippingCost === 0 ? "Gratis" : formatUYU(700 * 1.22)}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-2">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total:</span>
                    <span className="text-orange-600">
                      {formatPriceWithIVA(total)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 text-right mt-1">
                    IVA incluido (22%)
                  </p>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="text-sm font-medium text-blue-900 mb-2">
                  Métodos de Pago Disponibles
                </h3>
                <div className="space-y-2 text-sm text-blue-800">
                  <div>💳 Tarjetas de crédito y débito</div>
                  <div>🏦 Transferencias bancarias</div>
                  <div>💰 Efectivo en puntos de pago</div>
                  <div>📱 Billeteras digitales</div>
                </div>
              </div>

              {/* Security Info */}
              <div className="mt-4 p-4 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <div className="text-green-600 mr-2">🔒</div>
                  <div className="text-sm">
                    <p className="font-medium text-green-800">Pago Seguro</p>
                    <p className="text-green-600">Protegido por MercadoPago</p>
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
