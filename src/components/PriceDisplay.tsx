import React, { useState, useEffect } from "react";
import {
  getUSDToUYURate,
  convertUSDToUYU,
  formatUYU,
  formatUSD,
} from "@/lib/currency";

interface PriceDisplayProps {
  priceUSD: number;
  className?: string;
  showUSDPrice?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
}

export default function PriceDisplay({
  priceUSD,
  className = "",
  showUSDPrice = false,
  size = "md",
}: PriceDisplayProps) {
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUSDToUYURate()
      .then((data) => {
        setExchangeRate(data.usd_to_uyu);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching exchange rate:", error);
        setLoading(false);
      });
  }, []);

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

  if (loading) {
    return (
      <div className={`${getSizeClasses()} ${className}`}>
        <span className="text-gray-500">Cargando precio...</span>
      </div>
    );
  }

  if (!exchangeRate) {
    return (
      <div className={`${getSizeClasses()} ${className}`}>
        <span className="text-red-500">Error al cargar precio</span>
      </div>
    );
  }

  const priceInUYU = convertUSDToUYU(priceUSD, exchangeRate);

  return (
    <div className={`${getSizeClasses()} ${className}`}>
      <span className="font-bold text-orange-600">{formatUYU(priceInUYU)}</span>
      {showUSDPrice && (
        <span className="text-sm text-gray-500 ml-2">
          ({formatUSD(priceUSD)})
        </span>
      )}
    </div>
  );
}
