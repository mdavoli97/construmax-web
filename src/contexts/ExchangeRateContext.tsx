"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { getUSDToUYURate } from "@/lib/currency";

interface ExchangeRateData {
  usd_to_uyu: number;
  last_updated: string;
  source: "dolarapi" | "cache";
  compra?: number;
  venta?: number;
}

interface ExchangeRateContextType {
  exchangeRate: number | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const ExchangeRateContext = createContext<ExchangeRateContextType | undefined>(
  undefined
);

export function ExchangeRateProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExchangeRate = async () => {
    try {
      const data = await getUSDToUYURate();
      setExchangeRate(data.usd_to_uyu);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      console.error("Error fetching exchange rate:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExchangeRate();
  }, []);

  const refresh = async () => {
    setLoading(true);
    await fetchExchangeRate();
  };

  return (
    <ExchangeRateContext.Provider
      value={{ exchangeRate, loading, error, refresh }}
    >
      {children}
    </ExchangeRateContext.Provider>
  );
}

export function useExchangeRate() {
  const context = useContext(ExchangeRateContext);
  if (context === undefined) {
    throw new Error(
      "useExchangeRate must be used within an ExchangeRateProvider"
    );
  }
  return context;
}
