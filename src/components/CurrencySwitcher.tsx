"use client";

import { useExchangeRate } from "@/contexts/ExchangeRateContext";
import type { DisplayCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";

const options: DisplayCurrency[] = ["UYU", "USD"];

export default function CurrencySwitcher({
  className,
}: {
  className?: string;
}) {
  const { displayCurrency, setDisplayCurrency } = useExchangeRate();

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border border-gray-200 bg-white p-0.5 shrink-0",
        className
      )}
      role="group"
      aria-label="Seleccionar moneda"
    >
      {options.map((currency) => {
        const active = displayCurrency === currency;
        return (
          <button
            key={currency}
            type="button"
            onClick={() => setDisplayCurrency(currency)}
            className={cn(
              "min-w-[44px] px-2.5 py-1.5 text-xs font-semibold rounded-full transition-colors",
              active
                ? "bg-orange-600 text-white shadow-sm"
                : "text-gray-600 hover:text-orange-600 hover:bg-orange-50"
            )}
            aria-pressed={active}
          >
            {currency}
          </button>
        );
      })}
    </div>
  );
}
