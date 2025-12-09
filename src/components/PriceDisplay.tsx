"use client";

import React from "react";
import { formatPriceWithCurrency } from "@/lib/currency";
import { useExchangeRate } from "@/contexts/ExchangeRateContext";

interface PriceDisplayProps {
  price: number;
  currency?: "USD" | "UYU";
  className?: string;
  showOriginalPrice?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
}

export default function PriceDisplay({
  price,
  currency = "USD",
  className = "",
  showOriginalPrice = false,
  size = "md",
}: PriceDisplayProps) {
  const { exchangeRate, loading } = useExchangeRate();

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "text-xs sm:text-sm";
      case "md":
        return "text-base sm:text-lg";
      case "lg":
        return "text-lg sm:text-xl md:text-2xl";
      case "xl":
        return "text-xl sm:text-2xl md:text-3xl";
      default:
        return "text-base sm:text-lg";
    }
  };

  if (loading && currency === "USD") {
    return (
      <div className={`${getSizeClasses()} ${className}`}>
        <span className="text-gray-500">Cargando precio...</span>
      </div>
    );
  }

  if (!exchangeRate && currency === "USD") {
    return (
      <div className={`${getSizeClasses()} ${className}`}>
        <span className="text-red-500">Error al cargar precio</span>
      </div>
    );
  }

  const formattedPrice = formatPriceWithCurrency(
    price,
    currency,
    exchangeRate || undefined,
    showOriginalPrice
  );

  return (
    <div className={`${getSizeClasses()} ${className}`}>
      <span className="font-bold text-orange-600">{formattedPrice}</span>
    </div>
  );
}
