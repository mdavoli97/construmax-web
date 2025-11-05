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
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer group overflow-hidden"
    >
      {/* Image Container */}
      <div className="aspect-square bg-gray-100 relative overflow-hidden">
        {firstProduct ? (
          <ProductImage
            src={firstProduct.primary_image || ""}
            alt={firstProduct.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <span className="text-6xl text-gray-400">📦</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <h3 className="font-semibold text-gray-900 text-lg mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors min-h-[3.5rem] flex items-start">
          {priceGroup.name}
        </h3>

        {/* Description */}
        {priceGroup.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {priceGroup.description}
          </p>
        )}

        {/* Product Count */}
        <p className="text-sm text-gray-500 mb-3">
          {products.length} producto{products.length !== 1 ? "s" : ""}
        </p>

        {/* Price Range */}
        <div className="mb-4">
          <div className="text-xl font-bold text-gray-900">
            {formatPriceRange()}
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md transition-colors duration-200 flex items-center justify-center gap-2 group-hover:bg-orange-700"
        >
          <EyeIcon className="h-4 w-4" />
          Ver Productos
        </button>
      </div>
    </div>
  );
}
