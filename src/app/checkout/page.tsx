"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import {
  ArrowLeftIcon,
  CreditCardIcon,
  BanknotesIcon,
  BuildingLibraryIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { useExchangeRate, formatUYU, convertUSDToUYU } from "@/lib/currency";
import { Product } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CustomerData {
  name: string;
  documentType: "cedula" | "dni" | "rut";
  documentNumber: string;
  email: string;
  phone: string;
  address: string;
  city: string;
}

interface ShippingData {
  deliveryDate: string;
  deliveryMethod: "pickup" | "delivery";
  deliveryAddress: string;
  contactPhone: string;
  preferredTime: "8-12" | "12-18" | "after-18";
  observations: string;
}

type PaymentMethod = "cash" | "transfer" | "card";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, clearCart } = useCartStore();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethod | null>(null);
  const [customerData, setCustomerData] = useState<CustomerData>({
    name: "",
    documentType: "cedula",
    documentNumber: "",
    email: "",
    phone: "",
    address: "",
    city: "",
  });
  const [shippingData, setShippingData] = useState<ShippingData>({
    deliveryDate: "",
    deliveryMethod: "pickup",
    deliveryAddress: "",
    contactPhone: "",
    preferredTime: "8-12",
    observations: "",
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

  // Función para verificar si el documento es requerido (total con IVA >= $30.000 UYU)
  const isDocumentRequired = () => {
    if (!exchangeRate) return false;

    const totalWithIVAInUYU =
      convertUSDToUYU(cart.total, exchangeRate.usd_to_uyu) * 1.22;
    return totalWithIVAInUYU >= 30000;
  };

  // Función para formatear la fecha
  const formatDate = (dateString: string) => {
    if (!dateString) return "";

    // Crear la fecha de manera local para evitar problemas de zona horaria
    const dateParts = dateString.split("-");
    const year = parseInt(dateParts[0]);
    const month = parseInt(dateParts[1]) - 1; // Los meses en JS van de 0-11
    const day = parseInt(dateParts[2]);
    const date = new Date(year, month, day);

    return date.toLocaleDateString("es-UY", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Función para generar las opciones de fecha de los próximos 7 días
  const getNextSevenDays = () => {
    const days = [];
    const now = new Date();
    const currentHour = now.getHours();

    // Si son las 12:00 o más tarde, empezar desde mañana
    const startDay = currentHour >= 12 ? 1 : 0;

    for (let i = startDay; i < startDay + 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const dateValue = date.toISOString().split("T")[0];
      const dateLabel = date.toLocaleDateString("es-UY", {
        weekday: "long",
        day: "numeric",
        month: "long",
      });
      days.push({ value: dateValue, label: dateLabel });
    }
    return days;
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

  const handleShippingInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setShippingData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDeliveryMethodChange = (value: string) => {
    setShippingData((prev) => ({
      ...prev,
      deliveryMethod: value as "pickup" | "delivery",
    }));
  };

  const handlePreferredTimeChange = (value: string) => {
    setShippingData((prev) => ({
      ...prev,
      preferredTime: value as "8-12" | "12-18" | "after-18",
    }));
  };

  const handleDeliveryDateChange = (value: string) => {
    setShippingData((prev) => ({
      ...prev,
      deliveryDate: value,
    }));
  };

  const handleDocumentTypeChange = (value: string) => {
    setCustomerData((prev) => ({
      ...prev,
      documentType: value as "cedula" | "dni" | "rut",
    }));
  };

  const handlePaymentMethodChange = (method: PaymentMethod) => {
    setSelectedPaymentMethod(method);
  };

  const handleContinueToContactInfo = () => {
    if (selectedPaymentMethod) {
      setCurrentStep(2);
    }
  };

  const handleContinueToShipping = () => {
    setCurrentStep(3);
  };

  const handleContinueToConfirmation = () => {
    setCurrentStep(4);
  };

  const handleGoBackToShipping = () => {
    setCurrentStep(3);
  };

  const handleGoBackToContactInfo = () => {
    setCurrentStep(2);
  };

  const handleGoBackToPayment = () => {
    setCurrentStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Preparar los datos de la orden
      const orderData = {
        customer_name: customerData.name,
        customer_email: customerData.email,
        customer_phone: customerData.phone,
        document_type: isDocumentRequired() ? customerData.documentType : null,
        document_number: isDocumentRequired()
          ? customerData.documentNumber
          : null,
        address:
          customerData.documentType === "rut" ? customerData.address : null,
        city: customerData.documentType === "rut" ? customerData.city : null,
        payment_method: selectedPaymentMethod,
        delivery_method: shippingData.deliveryMethod,
        delivery_date: shippingData.deliveryDate,
        delivery_address:
          shippingData.deliveryMethod === "delivery"
            ? shippingData.deliveryAddress
            : null,
        contact_phone:
          shippingData.deliveryMethod === "delivery"
            ? shippingData.contactPhone
            : null,
        preferred_time:
          shippingData.deliveryMethod === "delivery"
            ? shippingData.preferredTime
            : null,
        observations:
          shippingData.deliveryMethod === "delivery"
            ? shippingData.observations
            : null,
        subtotal: cart.total,
        tax: cart.total * 0.22,
        shipping_cost: shippingCost,
        total: total,
        items: cart.items.map((item) => ({
          product_id: item.product.id,
          product_name: item.product.name,
          quantity: item.quantity,
          unit_price: item.product.price,
          total_price: item.product.price * item.quantity,
        })),
      };

      // Crear la orden en la base de datos
      const response = await fetch("/api/admin/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error("Error al crear la orden");
      }

      const result = await response.json();

      // Simular éxito según método de pago
      if (selectedPaymentMethod === "cash") {
        alert(
          "¡Pedido confirmado! Te enviaremos las instrucciones para el pago en efectivo por email."
        );
      } else if (selectedPaymentMethod === "transfer") {
        alert(
          "¡Pedido confirmado! Te enviaremos los datos para la transferencia bancaria por email."
        );
      } else {
        alert("¡Pago procesado exitosamente!");
      }

      clearCart();
      router.push("/success");
    } catch (error) {
      console.error("Error al procesar el pedido:", error);
      alert("Error al procesar el pedido. Intenta nuevamente.");
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
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

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            <div className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= 1
                    ? "bg-orange-600 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                1
              </div>
              <span
                className={`ml-2 text-sm font-medium ${
                  currentStep >= 1 ? "text-orange-600" : "text-gray-500"
                }`}
              >
                Método de Pago
              </span>
            </div>
            <div
              className={`w-16 h-0.5 ${
                currentStep >= 2 ? "bg-orange-600" : "bg-gray-200"
              }`}
            ></div>
            <div className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= 2
                    ? "bg-orange-600 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                2
              </div>
              <span
                className={`ml-2 text-sm font-medium ${
                  currentStep >= 2 ? "text-orange-600" : "text-gray-500"
                }`}
              >
                Información de Contacto
              </span>
            </div>
            <div
              className={`w-16 h-0.5 ${
                currentStep >= 3 ? "bg-orange-600" : "bg-gray-200"
              }`}
            ></div>
            <div className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= 3
                    ? "bg-orange-600 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                3
              </div>
              <span
                className={`ml-2 text-sm font-medium ${
                  currentStep >= 3 ? "text-orange-600" : "text-gray-500"
                }`}
              >
                Datos de Envío
              </span>
            </div>
            <div
              className={`w-16 h-0.5 ${
                currentStep >= 4 ? "bg-orange-600" : "bg-gray-200"
              }`}
            ></div>
            <div className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= 4
                    ? "bg-orange-600 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                4
              </div>
              <span
                className={`ml-2 text-sm font-medium ${
                  currentStep >= 4 ? "text-orange-600" : "text-gray-500"
                }`}
              >
                Confirmación
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
          {/* Left Side - Steps */}
          <div className="h-full">
            {currentStep === 1 && (
              <div className="bg-white rounded-lg shadow-md p-6 h-full">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Selecciona tu método de pago
                </h2>

                <div className="space-y-4">
                  {/* Efectivo */}
                  <div
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedPaymentMethod === "cash"
                        ? "border-orange-500 bg-orange-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => handlePaymentMethodChange("cash")}
                  >
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cash"
                        checked={selectedPaymentMethod === "cash"}
                        onChange={() => handlePaymentMethodChange("cash")}
                        className="mr-3 text-orange-600 focus:ring-orange-500"
                      />
                      <BanknotesIcon className="h-6 w-6 mr-3 text-gray-600" />
                      <div>
                        <h3 className="font-medium text-gray-900">Efectivo</h3>
                        <p className="text-sm text-gray-500">
                          Paga en efectivo en puntos autorizados
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Transferencia Bancaria */}
                  <div
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedPaymentMethod === "transfer"
                        ? "border-orange-500 bg-orange-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => handlePaymentMethodChange("transfer")}
                  >
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="transfer"
                        checked={selectedPaymentMethod === "transfer"}
                        onChange={() => handlePaymentMethodChange("transfer")}
                        className="mr-3 text-orange-600 focus:ring-orange-500"
                      />
                      <BuildingLibraryIcon className="h-6 w-6 mr-3 text-gray-600" />
                      <div>
                        <h3 className="font-medium text-gray-900">
                          Transferencia Bancaria
                        </h3>
                        <p className="text-sm text-gray-500">
                          Transfiere desde tu banco online o app móvil
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Débito/Crédito - Deshabilitado */}
                  <div className="border-2 rounded-lg p-4 opacity-50 cursor-not-allowed border-gray-200 bg-gray-50">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="card"
                        disabled
                        className="mr-3 text-gray-400"
                      />
                      <CreditCardIcon className="h-6 w-6 mr-3 text-gray-400" />
                      <div>
                        <h3 className="font-medium text-gray-400">
                          Débito / Crédito
                        </h3>
                        <p className="text-sm text-gray-400">
                          Próximamente disponible
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Continue Button */}
                <div className="mt-8">
                  <button
                    onClick={handleContinueToContactInfo}
                    disabled={!selectedPaymentMethod}
                    className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    Continuar
                  </button>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="bg-white rounded-lg shadow-md p-6 h-full">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Información de Contacto
                  </h2>
                  <button
                    onClick={handleGoBackToPayment}
                    className="text-orange-600 hover:text-orange-700 text-sm font-medium"
                  >
                    ← Volver
                  </button>
                </div>

                {/* Selected Payment Method Display */}
                <div className="mb-6 p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="flex items-center">
                    {selectedPaymentMethod === "cash" && (
                      <BanknotesIcon className="h-5 w-5 mr-2 text-orange-600" />
                    )}
                    {selectedPaymentMethod === "transfer" && (
                      <BuildingLibraryIcon className="h-5 w-5 mr-2 text-orange-600" />
                    )}
                    <span className="text-sm font-medium text-orange-800">
                      Método seleccionado:{" "}
                      {selectedPaymentMethod === "cash"
                        ? "Efectivo"
                        : "Transferencia Bancaria"}
                    </span>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Nombre completo / Razón social *
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

                  {/* Documento */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Documento {isDocumentRequired() ? "*" : "(opcional)"}
                    </label>
                    {isDocumentRequired() && (
                      <p className="text-xs text-orange-600 mb-2">
                        Requerido para compras mayores a $30.000 UYU
                      </p>
                    )}
                    <div className="grid grid-cols-2 gap-3 items-center">
                      <div>
                        <Select
                          value={customerData.documentType}
                          onValueChange={handleDocumentTypeChange}
                        >
                          <SelectTrigger
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent flex items-center"
                            style={{ height: "40px", minHeight: "40px" }}
                          >
                            <SelectValue placeholder="Tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cedula">Cédula</SelectItem>
                            <SelectItem value="dni">DNI</SelectItem>
                            <SelectItem value="rut">RUT</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <input
                          type="text"
                          name="documentNumber"
                          placeholder="Número de documento"
                          required={isDocumentRequired()}
                          value={customerData.documentNumber}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent h-10"
                        />
                      </div>
                    </div>
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

                  {/* Dirección y Ciudad - Solo para RUT */}
                  {customerData.documentType === "rut" && (
                    <>
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
                    </>
                  )}

                  {/* Card Details Section - Only show if card is selected */}
                  {selectedPaymentMethod === "card" && (
                    <div className="mt-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Datos de la Tarjeta
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Número de Tarjeta *
                          </label>
                          <input
                            type="text"
                            placeholder="1234 5678 9012 3456"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Fecha de Vencimiento *
                            </label>
                            <input
                              type="text"
                              placeholder="MM/AA"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              CVV *
                            </label>
                            <input
                              type="text"
                              placeholder="123"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nombre en la Tarjeta *
                          </label>
                          <input
                            type="text"
                            placeholder="Juan Pérez"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleContinueToShipping}
                    className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-orange-700 transition-colors mt-6"
                  >
                    Continuar
                  </button>
                </form>
              </div>
            )}

            {currentStep === 3 && (
              <div className="bg-white rounded-lg shadow-md p-6 h-full">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Datos de Envío
                  </h2>
                  <button
                    onClick={handleGoBackToContactInfo}
                    className="text-orange-600 hover:text-orange-700 text-sm font-medium"
                  >
                    ← Volver
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Fecha de entrega */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha de entrega *
                    </label>
                    <Select
                      value={shippingData.deliveryDate}
                      onValueChange={handleDeliveryDateChange}
                    >
                      <SelectTrigger
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent flex items-center"
                        style={{ height: "40px", minHeight: "40px" }}
                      >
                        <SelectValue placeholder="Selecciona una fecha" />
                      </SelectTrigger>
                      <SelectContent>
                        {getNextSevenDays().map((day) => (
                          <SelectItem key={day.value} value={day.value}>
                            {day.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Forma de retiro */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Forma de retiro *
                    </label>
                    <div className="space-y-3">
                      <div
                        className={`border-2 rounded-lg p-3 cursor-pointer transition-colors ${
                          shippingData.deliveryMethod === "pickup"
                            ? "border-orange-500 bg-orange-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => handleDeliveryMethodChange("pickup")}
                      >
                        <div className="flex items-center">
                          <input
                            type="radio"
                            name="deliveryMethod"
                            value="pickup"
                            checked={shippingData.deliveryMethod === "pickup"}
                            onChange={() =>
                              handleDeliveryMethodChange("pickup")
                            }
                            className="mr-3 text-orange-600 focus:ring-orange-500"
                          />
                          <div>
                            <h3 className="font-medium text-gray-900">
                              Retiro en local
                            </h3>
                            <p className="text-sm text-gray-500">
                              Retira tu pedido en nuestro local
                            </p>
                          </div>
                        </div>
                      </div>

                      <div
                        className={`border-2 rounded-lg p-3 cursor-pointer transition-colors ${
                          shippingData.deliveryMethod === "delivery"
                            ? "border-orange-500 bg-orange-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => handleDeliveryMethodChange("delivery")}
                      >
                        <div className="flex items-center">
                          <input
                            type="radio"
                            name="deliveryMethod"
                            value="delivery"
                            checked={shippingData.deliveryMethod === "delivery"}
                            onChange={() =>
                              handleDeliveryMethodChange("delivery")
                            }
                            className="mr-3 text-orange-600 focus:ring-orange-500"
                          />
                          <div>
                            <h3 className="font-medium text-gray-900">
                              Envío a domicilio
                            </h3>
                            <p className="text-sm text-gray-500">
                              Te enviamos el pedido a tu dirección
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Dirección de entrega - Solo si es envío */}
                  {shippingData.deliveryMethod === "delivery" && (
                    <>
                      <div>
                        <label
                          htmlFor="deliveryAddress"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Dirección de entrega *
                        </label>
                        <input
                          type="text"
                          id="deliveryAddress"
                          name="deliveryAddress"
                          required
                          value={shippingData.deliveryAddress}
                          onChange={handleShippingInputChange}
                          placeholder="Dirección completa donde se realizará la entrega"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      </div>

                      {/* Teléfono de contacto */}
                      <div>
                        <label
                          htmlFor="contactPhone"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Teléfono de contacto (quien recibe) *
                        </label>
                        <input
                          type="tel"
                          id="contactPhone"
                          name="contactPhone"
                          required
                          value={shippingData.contactPhone}
                          onChange={handleShippingInputChange}
                          placeholder="Teléfono de la persona que recibirá el pedido"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      </div>

                      {/* Horario de preferencia */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Horario de preferencia *
                        </label>
                        <Select
                          value={shippingData.preferredTime}
                          onValueChange={handlePreferredTimeChange}
                        >
                          <SelectTrigger
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent flex items-center"
                            style={{ height: "40px", minHeight: "40px" }}
                          >
                            <SelectValue placeholder="Selecciona un horario" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="8-12">8:00 a 12:00</SelectItem>
                            <SelectItem value="12-18">12:00 a 18:00</SelectItem>
                            <SelectItem value="after-18">
                              Después de las 18:00
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Observaciones */}
                      <div>
                        <label
                          htmlFor="observations"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Observaciones (opcional)
                        </label>
                        <textarea
                          id="observations"
                          name="observations"
                          rows={3}
                          value={shippingData.observations}
                          onChange={handleShippingInputChange}
                          placeholder="Información adicional sobre la entrega (ej: referencias de ubicación, instrucciones especiales)"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      </div>
                    </>
                  )}

                  <button
                    type="button"
                    onClick={handleContinueToConfirmation}
                    className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-orange-700 transition-colors mt-6"
                  >
                    Continuar
                  </button>
                </form>
              </div>
            )}

            {currentStep === 4 && (
              <div className="bg-white rounded-lg shadow-md p-6 h-full">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Confirmación del Pedido
                  </h2>
                  <button
                    onClick={handleGoBackToShipping}
                    className="text-orange-600 hover:text-orange-700 text-sm font-medium"
                  >
                    ← Volver
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Resumen del método de pago */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Método de Pago
                    </h3>
                    <div className="flex items-center">
                      {selectedPaymentMethod === "cash" && (
                        <>
                          <BanknotesIcon className="h-5 w-5 mr-2 text-orange-600" />
                          <span>Efectivo</span>
                        </>
                      )}
                      {selectedPaymentMethod === "transfer" && (
                        <>
                          <BuildingLibraryIcon className="h-5 w-5 mr-2 text-orange-600" />
                          <span>Transferencia Bancaria</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Información de contacto */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">
                      Información de Contacto
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Nombre:</span>{" "}
                        {customerData.name}
                      </div>
                      {isDocumentRequired() && (
                        <div>
                          <span className="font-medium">Documento:</span>{" "}
                          {customerData.documentType.toUpperCase()}{" "}
                          {customerData.documentNumber}
                        </div>
                      )}
                      <div>
                        <span className="font-medium">Email:</span>{" "}
                        {customerData.email}
                      </div>
                      <div>
                        <span className="font-medium">Teléfono:</span>{" "}
                        {customerData.phone}
                      </div>
                      {customerData.documentType === "rut" && (
                        <>
                          <div>
                            <span className="font-medium">Dirección:</span>{" "}
                            {customerData.address}
                          </div>
                          <div>
                            <span className="font-medium">Ciudad:</span>{" "}
                            {customerData.city}
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Datos de envío */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">
                      Datos de Envío
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Fecha de entrega:</span>{" "}
                        {formatDate(shippingData.deliveryDate)}
                      </div>
                      <div>
                        <span className="font-medium">Forma de retiro:</span>{" "}
                        {shippingData.deliveryMethod === "pickup"
                          ? "Retiro en local"
                          : "Envío a domicilio"}
                      </div>
                      {shippingData.deliveryMethod === "delivery" && (
                        <>
                          <div>
                            <span className="font-medium">
                              Dirección de entrega:
                            </span>{" "}
                            {shippingData.deliveryAddress}
                          </div>
                          <div>
                            <span className="font-medium">
                              Teléfono de contacto:
                            </span>{" "}
                            {shippingData.contactPhone}
                          </div>
                          <div>
                            <span className="font-medium">
                              Horario de preferencia:
                            </span>{" "}
                            {shippingData.preferredTime === "8-12"
                              ? "8:00 a 12:00"
                              : shippingData.preferredTime === "12-18"
                              ? "12:00 a 18:00"
                              : "Después de las 18:00"}
                          </div>
                          {shippingData.observations && (
                            <div>
                              <span className="font-medium">
                                Observaciones:
                              </span>{" "}
                              {shippingData.observations}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Botón de confirmación final */}
                  <form onSubmit={handleSubmit}>
                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                      {isProcessing ? "PROCESANDO..." : "CONFIRMAR PEDIDO"}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>

          {/* Right Side - Order Summary */}
          <div className="h-full">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8 h-fit">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Resumen del Pedido
              </h2>

              {/* Order Items */}
              <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
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

              {/* Payment Method Info - Only show when method is selected */}
              {selectedPaymentMethod && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h3 className="text-sm font-medium text-blue-900 mb-2">
                    {selectedPaymentMethod === "cash" && "Pago en Efectivo"}
                    {selectedPaymentMethod === "transfer" &&
                      "Transferencia Bancaria"}
                    {selectedPaymentMethod === "card" && "Pago con Tarjeta"}
                  </h3>
                  <div className="text-sm text-blue-800">
                    {selectedPaymentMethod === "cash" && (
                      <p>
                        Podrás pagar en efectivo en puntos autorizados. Te
                        enviaremos las instrucciones por email.
                      </p>
                    )}
                    {selectedPaymentMethod === "transfer" && (
                      <p>
                        Te enviaremos los datos bancarios para realizar la
                        transferencia.
                      </p>
                    )}
                    {selectedPaymentMethod === "card" && (
                      <p>
                        Procesaremos tu pago de forma segura con tecnología de
                        encriptación.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Security Info */}
              <div className="mt-4 p-4 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <div className="text-green-600 mr-2">🔒</div>
                  <div className="text-sm">
                    <p className="font-medium text-green-800">Compra Segura</p>
                    <p className="text-green-600">Tus datos están protegidos</p>
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
