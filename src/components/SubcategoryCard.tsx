"use client";

import { EyeIcon } from "@heroicons/react/24/outline";
import { Product, PriceGroup } from "@/types";
import ProductImage from "./ProductImage";
import { formatPriceWithCurrency, convertPrice } from "@/lib/currency";
import { useExchangeRate } from "@/contexts/ExchangeRateContext";

interface SubcategoryCardProps {
  priceGroup: PriceGroup;
  products: Product[];
  category: string;
  onClick: () => void;
}

export default function SubcategoryCard({
  priceGroup,
  products,
  onClick,
}: SubcategoryCardProps) {
  const { exchangeRate, displayCurrency } = useExchangeRate();

  const firstProduct = products[0];

  const prices = products
    .map((p) => {
      const sourceCurrency = (p.price_group?.currency || "USD") as
        | "USD"
        | "UYU";
      return convertPrice(
        p.price * 1.22,
        sourceCurrency,
        displayCurrency,
        exchangeRate || undefined
      );
    })
    .filter((price) => price > 0);

  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

  const formatPriceRange = () => {
    if (prices.length === 0) {
      return "Consultar precio";
    }

    const format = (amount: number) =>
      formatPriceWithCurrency(
        amount,
        displayCurrency,
        exchangeRate || undefined,
        false,
        displayCurrency
      );

    if (minPrice === maxPrice) {
      return format(minPrice);
    }
    return `${format(minPrice)} - ${format(maxPrice)}`;
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl shadow-md border-2 border-gray-200 hover:shadow-xl hover:border-orange-300 transition-all duration-300 cursor-pointer group overflow-hidden flex flex-col h-full"
    >
      <div className="aspect-[4/3] bg-gradient-to-br from-gray-50 via-white to-gray-100 relative overflow-hidden">
        {firstProduct ? (
          <>
            <ProductImage
              src={firstProduct.primary_image || ""}
              alt={firstProduct.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
            />
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

      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-bold text-gray-900 text-base mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors duration-300 leading-tight">
          {priceGroup.name}
        </h3>

        <p className="text-sm text-gray-600 mb-3">
          {products.length} producto{products.length !== 1 ? "s" : ""}
        </p>

        <div className="mb-4">
          <div className="text-lg font-bold text-gray-900">
            {formatPriceRange()}
          </div>
        </div>

        <div className="flex-grow"></div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          className="w-full inline-flex items-center gap-2 justify-center px-4 py-2 text-sm font-medium text-orange-600 bg-white border border-orange-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-all duration-200"
        >
          <EyeIcon className="h-4 w-4" />
          Ver Productos
        </button>
      </div>
    </div>
  );
}
