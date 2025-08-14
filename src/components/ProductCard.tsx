'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ShoppingCartIcon, PlusIcon, MinusIcon } from '@heroicons/react/24/outline';
import { Product } from '@/types';
import { useCartStore } from '@/store/cartStore';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [quantity, setQuantity] = useState(1);
  const { addItem, getItemQuantity } = useCartStore();
  const currentQuantity = getItemQuantity(product.id);

  const handleAddToCart = () => {
    addItem(product, quantity);
    setQuantity(1);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-UY', {
      style: 'currency',
      currency: 'UYU',
    }).format(price);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* Product Image */}
      <div className="relative h-48 bg-gray-200">
        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
          <span className="text-4xl">🏗️</span>
        </div>
        {product.featured && (
          <div className="absolute top-2 left-2 bg-orange-500 text-white px-2 py-1 rounded text-xs font-medium">
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
          <span className="text-sm text-gray-500">
            por {product.unit}
          </span>
        </div>

        {product.brand && (
          <p className="text-sm text-gray-500 mb-3">
            Marca: {product.brand}
          </p>
        )}

        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-600">
            Stock: {product.stock} {product.unit}
          </span>
          <span className="text-xs text-gray-400">
            SKU: {product.sku}
          </span>
        </div>

        {/* Quantity Selector */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center border border-gray-300 rounded">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-2 hover:bg-gray-100"
            >
              <MinusIcon className="h-4 w-4" />
            </button>
            <span className="px-4 py-2 text-center min-w-[60px]">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
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
            {product.stock === 0 ? 'Sin stock' : 'Agregar al carrito'}
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
