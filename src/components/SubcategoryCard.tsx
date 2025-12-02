"use client";

import { useState, useEffect } from "react";
import { EyeIcon } from "@heroicons/react/24/outline";
import { Product, PriceGroup } from "@/types";
import ProductImage from "./ProductImage";
import { getUSDToUYURate, formatPriceWithCurrency } from "@/lib/currency";

interface SubcategoryCardProps {
  priceGroup: PriceGroup;
  products: Product[];
  category: string;
  onClick: () => void;
}

export default function SubcategoryCard({
  priceGroup,
  products,
  category,
  onClick,
}: SubcategoryCardProps) {
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);

  // Obtener cotización del dólar al cargar el componente
  useEffect(() => {
    getUSDToUYURate()
      .then((data) => setExchangeRate(data.usd_to_uyu))
      .catch(console.error);
  }, []);

  // Obtener el primer producto para la imagen
  const firstProduct = products[0];

  // Calcular rango de precios en UYU IVA incluido
  const pricesUYU = products
    .map((p) => {
      // Si el producto está en USD, convertir a UYU
      let priceUYU = p.price;
      if (p.price_group?.currency === "USD" && exchangeRate) {
        priceUYU = Math.round(p.price * exchangeRate);
      }
      // Sumar IVA (22%)
      priceUYU = Math.round(priceUYU * 1.22);
      return priceUYU;
    })
    .filter((price) => price > 0);

  const minPriceUYU = pricesUYU.length > 0 ? Math.min(...pricesUYU) : 0;
  const maxPriceUYU = pricesUYU.length > 0 ? Math.max(...pricesUYU) : 0;

  // Función para formatear el rango de precios en UYU
  const formatPriceRange = () => {
    if (pricesUYU.length === 0) {
      return "Consultar precio";
    }
    const formatUYU = (amount: number) =>
      new Intl.NumberFormat("es-UY", {
        style: "currency",
        currency: "UYU",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);

    if (minPriceUYU === maxPriceUYU) {
      return formatUYU(minPriceUYU);
    }
    return `${formatUYU(minPriceUYU)} - ${formatUYU(maxPriceUYU)}`;
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl shadow-md border-2 border-gray-200 hover:shadow-xl hover:border-orange-300 transition-all duration-300 cursor-pointer group overflow-hidden flex flex-col h-full"
    >
      {/* Image Container */}
      <div className="aspect-[4/3] bg-gradient-to-br from-gray-50 via-white to-gray-100 relative overflow-hidden">
        {firstProduct ? (
          <>
            <ProductImage
              src={firstProduct.primary_image || ""}
              alt={firstProduct.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
            />
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <div className="text-center">
              <span className="text-5xl text-gray-300 mb-2 block">📦</span>
              <p className="text-xs text-gray-400 font-medium">Sin imagen</p>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-grow">
        {/* Title */}
        <h3 className="font-bold text-gray-900 text-base mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors duration-300 leading-tight">
          {priceGroup.name}
        </h3>

        {/* Product Count */}
        <p className="text-sm text-gray-600 mb-3">
          {products.length} producto{products.length !== 1 ? "s" : ""}
        </p>

        {/* Price Range */}
        <div className="mb-4">
          <div className="text-lg font-bold text-gray-900">
            {formatPriceRange()}
          </div>
        </div>

        {/* Spacer to push button to bottom */}
        <div className="flex-grow"></div>

        {/* Action Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          className="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-orange-600 bg-white border border-orange-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-all duration-200"
        >
          <EyeIcon className="h-4 w-4 mr-2" />
          Ver Productos
        </button>
      </div>
    </div>
  );
}
