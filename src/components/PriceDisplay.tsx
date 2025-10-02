import React, { useState, useEffect } from "react";
import { getUSDToUYURate, formatPriceWithCurrency } from "@/lib/currency";

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
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Solo obtener tasa de cambio si el precio está en USD
    if (currency === "USD") {
      getUSDToUYURate()
        .then((data) => {
          setExchangeRate(data.usd_to_uyu);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching exchange rate:", error);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [currency]);

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
