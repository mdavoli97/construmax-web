"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { getUSDToUYURate, type DisplayCurrency } from "@/lib/currency";

interface ExchangeRateContextType {
  exchangeRate: number | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  displayCurrency: DisplayCurrency;
  setDisplayCurrency: (currency: DisplayCurrency) => void;
}

const STORAGE_KEY = "construmax-display-currency";

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
  const [displayCurrency, setDisplayCurrencyState] =
    useState<DisplayCurrency>("UYU");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "USD" || stored === "UYU") {
        setDisplayCurrencyState(stored);
      }
    } catch {
      // ignore
    }
  }, []);

  const setDisplayCurrency = (currency: DisplayCurrency) => {
    setDisplayCurrencyState(currency);
    try {
      localStorage.setItem(STORAGE_KEY, currency);
    } catch {
      // ignore
    }
  };

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
      value={{
        exchangeRate,
        loading,
        error,
        refresh,
        displayCurrency,
        setDisplayCurrency,
      }}
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
