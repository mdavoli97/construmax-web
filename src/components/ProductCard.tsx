"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ShoppingCartIcon,
  PlusIcon,
  MinusIcon,
} from "@heroicons/react/24/outline";
import { Product } from "@/types";
import { useCartStore } from "@/store/cartStore";
import ProductImage from "./ProductImage";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [quantity, setQuantity] = useState(1);
  const router = useRouter();
  const { addItem, getItemQuantity } = useCartStore();
  const currentQuantity = getItemQuantity(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevenir navegación cuando se hace click en agregar al carrito
    addItem(product, quantity);
    setQuantity(1);
  };

  const handleCardClick = () => {
    router.push(`/productos/producto/${product.id}`);
  };

  const handleQuantityChange = (
    e: React.MouseEvent,
    action: "increment" | "decrement"
  ) => {
    e.stopPropagation(); // Prevenir navegación cuando se cambia la cantidad
    if (action === "increment") {
      setQuantity(quantity + 1);
    } else {
      setQuantity(Math.max(1, quantity - 1));
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-UY", {
      style: "currency",
      currency: "UYU",
    }).format(price);
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
    >
      {/* Product Image */}
      <div className="relative h-48 bg-gray-200">
        <ProductImage
          src={product.primary_image}
          alt={product.name}
          fill
          className="rounded-t-lg"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {product.featured && (
          <div className="absolute top-2 left-2 bg-orange-500 text-white px-2 py-1 rounded text-xs font-medium z-10">
            Destacado
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {product.name}
        </h3>

        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {product.description}
        </p>

        <div className="flex items-center justify-between mb-3">
          <span className="text-2xl font-bold text-orange-600">
            {formatPrice(product.price)}
          </span>
          <span className="text-sm text-gray-500">por {product.unit}</span>
        </div>

        {product.brand && (
          <p className="text-sm text-gray-500 mb-3">Marca: {product.brand}</p>
        )}

        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-600">
            Stock: {product.stock} {product.unit}
          </span>
          <span className="text-xs text-gray-400">SKU: {product.sku}</span>
        </div>

        {/* Quantity Selector */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center border border-gray-300 rounded">
            <button
              onClick={(e) => handleQuantityChange(e, "decrement")}
              className="p-2 hover:bg-gray-100"
            >
              <MinusIcon className="h-4 w-4" />
            </button>
            <span className="px-4 py-2 text-center min-w-[60px]">
              {quantity}
            </span>
            <button
              onClick={(e) => handleQuantityChange(e, "increment")}
              className="p-2 hover:bg-gray-100"
            >
              <PlusIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className="w-full bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
        >
          <ShoppingCartIcon className="h-5 w-5" />
          <span>
            {product.stock === 0 ? "Sin stock" : "Agregar al carrito"}
          </span>
        </button>

        {currentQuantity > 0 && (
          <p className="text-sm text-green-600 mt-2 text-center">
            {currentQuantity} en el carrito
          </p>
        )}
      </div>
    </div>
  );
}
