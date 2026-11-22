"use client";

import { useRouter } from "next/navigation";
import { EyeIcon } from "@heroicons/react/24/outline";
import { Product } from "@/types";
import ProductImage from "./ProductImage";
import { formatCatalogPrice } from "@/lib/currency";
import { useExchangeRate } from "@/contexts/ExchangeRateContext";

function productHref(product: Product) {
  if (product.price_group_id) {
    return `/productos/${product.category}/${product.price_group_id}?productId=${encodeURIComponent(product.id)}`;
  }
  return `/productos/${product.category}`;
}

function productVariant(product: Product) {
  return [product.thickness, product.size, product.presentation, product.length]
    .filter((value) => value && value.trim())
    .join(" · ");
}

function FeaturedProductCard({ product }: { product: Product }) {
  const router = useRouter();
  const { exchangeRate, displayCurrency } = useExchangeRate();
  const href = productHref(product);
  const variant = productVariant(product);

  return (
    <div
      onClick={() => router.push(href)}
      className="bg-white rounded-xl shadow-md border-2 border-gray-200 hover:shadow-xl hover:border-orange-300 transition-all duration-300 cursor-pointer group overflow-hidden flex flex-col h-full"
    >
      <div className="aspect-[4/3] bg-gradient-to-br from-gray-50 via-white to-gray-100 relative overflow-hidden">
        <ProductImage
          src={product.primary_image || ""}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
        />
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-bold text-gray-900 text-base mb-1 line-clamp-2 group-hover:text-orange-600 transition-colors duration-300 leading-tight">
          {product.name}
        </h3>
        {variant ? (
          <p className="text-sm text-gray-500 mb-3 line-clamp-2">{variant}</p>
        ) : (
          <p className="text-sm text-gray-500 mb-3">{product.sku}</p>
        )}
        <div className="text-lg font-bold text-gray-900 mb-4">
          {formatCatalogPrice(
            product.price,
            product,
            exchangeRate || undefined,
            displayCurrency,
            true
          )}
        </div>
        <div className="flex-grow" />
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            router.push(href);
          }}
          className="w-full inline-flex items-center gap-2 justify-center px-4 py-2 text-sm font-medium text-orange-600 bg-white border border-orange-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-all duration-200"
        >
          <EyeIcon className="h-4 w-4" />
          Ver producto
        </button>
      </div>
    </div>
  );
}

export default function FeaturedProducts({ products }: { products: Product[] }) {
  if (products.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {products.map((product) => (
        <FeaturedProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
