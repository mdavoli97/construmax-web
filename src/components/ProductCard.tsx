"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { EyeIcon } from "@heroicons/react/24/outline";
import { Product } from "@/types";
import { useItemQuantity } from "@/hooks/useItemQuantity";
import ProductImage from "./ProductImage";
import { getUSDToUYURate, convertUSDToUYU, formatUYU } from "@/lib/currency";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const router = useRouter();
  const currentQuantity = useItemQuantity(product.id);

  // Obtener cotización del dólar al cargar el componente
  useEffect(() => {
    getUSDToUYURate()
      .then((data) => setExchangeRate(data.usd_to_uyu))
      .catch(console.error);
  }, []);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevenir navegación cuando se hace click en agregar al carrito
    router.push(`/productos/producto/${product.id}`);
  };

  const handleCardClick = () => {
    router.push(`/productos/producto/${product.id}`);
  };

  // Función para obtener el tipo de producto
  const getProductType = (product: Product) => {
    // Usar campo directo de la base de datos si está disponible
    if (product.product_type) {
      return product.product_type;
    }

    // Fallback: parsear JSON del description
    try {
      if (
        product.description?.startsWith("{") ||
        product.description?.startsWith("[")
      ) {
        const parsed = JSON.parse(product.description);
        const metadata = parsed.meta || parsed;
        return metadata.product_type || "standard";
      }
    } catch (error) {
      // Ignorar errores de parsing
    }

    return "standard";
  };

  const formatPrice = (priceInUSD: number) => {
    if (!exchangeRate) {
      return "Cargando...";
    }
    const priceInUYU = convertUSDToUYU(priceInUSD, exchangeRate);
    return formatUYU(priceInUYU);
  };

  const formatPriceWithIVA = (priceInUSD: number) => {
    if (!exchangeRate) {
      return "Cargando...";
    }
    const priceInUYU = convertUSDToUYU(priceInUSD, exchangeRate);
    const priceWithIVA = priceInUYU * 1.22; // 22% IVA
    return formatUYU(priceWithIVA);
  };

  // Función para obtener descripción limpia del producto
  const getCleanDescription = (product: Product) => {
    try {
      if (
        product.description?.startsWith("{") ||
        product.description?.startsWith("[")
      ) {
        const parsed = JSON.parse(product.description);
        if (parsed.description) {
          return parsed.description;
        }
        return `${product.name} - Producto de alta calidad`;
      }
      return (
        product.description || `${product.name} - Producto de alta calidad`
      );
    } catch (error) {
      return (
        product.description || `${product.name} - Producto de alta calidad`
      );
    }
  };

  // Función para obtener stock display
  const getStockDisplay = (product: Product) => {
    // Usar campos directos de la base de datos si están disponibles
    if (
      (product.product_type === "perfiles" ||
        product.product_type === "chapas_conformadas") &&
      product.stock_type === "availability"
    ) {
      return product.is_available ? "Disponible" : "No disponible";
    }

    // Fallback: parsear JSON del description para productos legacy
    try {
      if (
        product.description?.startsWith("{") ||
        product.description?.startsWith("[")
      ) {
        const parsed = JSON.parse(product.description);
        const metadata = parsed.meta || parsed;

        if (
          (metadata.product_type === "perfiles" ||
            metadata.product_type === "chapas_conformadas") &&
          metadata.stock_type === "availability"
        ) {
          return metadata.is_available ? "Disponible" : "No disponible";
        }
      }
    } catch (error) {
      // Ignorar errores de parsing
    }

    // Para productos estándar con stock numérico
    if (product.stock === 0) {
      return "No disponible";
    } else if (product.stock > 1000) {
      return "Disponible";
    } else {
      return `${product.stock} disponibles`;
    }
  };

  // Función para verificar disponibilidad
  const isAvailable = (product: Product) => {
    // Usar campos directos de la base de datos si están disponibles
    if (
      (product.product_type === "perfiles" ||
        product.product_type === "chapas_conformadas") &&
      product.stock_type === "availability"
    ) {
      return product.is_available === true;
    }

    // Fallback: parsear JSON del description para productos legacy
    try {
      if (
        product.description?.startsWith("{") ||
        product.description?.startsWith("[")
      ) {
        const parsed = JSON.parse(product.description);
        const metadata = parsed.meta || parsed;

        if (
          (metadata.product_type === "perfiles" ||
            metadata.product_type === "chapas_conformadas") &&
          metadata.stock_type === "availability"
        ) {
          return metadata.is_available;
        }
      }
    } catch (error) {
      // Ignorar errores de parsing
    }

    // Para productos estándar
    return product.stock > 0;
  };

  // Función para obtener metadata del producto
  const getProductMetadata = (product: Product) => {
    try {
      if (
        product.description?.startsWith("{") ||
        product.description?.startsWith("[")
      ) {
        const parsed = JSON.parse(product.description);
        return parsed.meta || parsed;
      }
      return null;
    } catch (error) {
      return null;
    }
  };

  // Función para obtener la unidad de precio correcta
  const getPriceUnit = (product: Product) => {
    // Usar campos directos de la base de datos si están disponibles
    if (product.product_type === "perfiles") {
      return "por unidad"; // Para perfiles, el precio ya está calculado por unidad completa
    }

    if (product.product_type === "chapas_conformadas") {
      return "por metro"; // Para chapas conformadas, mostrar "por metro" en lugar de "por m"
    }

    // Fallback: parsear JSON del description para productos legacy
    const metadata = getProductMetadata(product);
    if (metadata && metadata.product_type === "perfiles") {
      return "por unidad";
    }
    if (metadata && metadata.product_type === "chapas_conformadas") {
      return "por metro";
    }

    // Para otros productos, mostrar la unidad con formato mejorado
    if (product.unit === "m") {
      return "por metro";
    }
    if (product.unit === "kg") {
      return "por kilogramo";
    }

    return `por ${product.unit}`;
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer flex flex-col h-full"
    >
      {/* Product Image */}
      <div className="relative h-40 sm:h-48 bg-gray-200">
        <ProductImage
          src={product.primary_image}
          alt={product.name}
          fill
          className="rounded-t-lg"
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
        />
        {product.featured && (
          <div className="absolute top-2 left-2 bg-orange-500 text-white px-2 py-1 rounded text-xs font-medium z-10">
            Destacado
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-3 sm:p-4 flex flex-col flex-grow">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 h-10 sm:h-13 line-clamp-2 flex items-start">
          {product.name}
        </h3>

        <p className="text-gray-600 text-xs sm:text-sm mb-3 line-clamp-2">
          {getCleanDescription(product)}
        </p>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-1">
          <span className="text-lg sm:text-2xl font-bold text-orange-600">
            {formatPriceWithIVA(product.price)}
          </span>
          <span className="text-xs sm:text-sm text-gray-500">
            {getPriceUnit(product)}
          </span>
        </div>

        {product.brand && (
          <p className="text-xs sm:text-sm text-gray-500 mb-3">
            Marca: {product.brand}
          </p>
        )}

        <div className="flex items-center justify-center mb-3">
          <span
            className={`text-xs sm:text-sm font-medium px-2 sm:px-3 py-1 rounded-full ${
              getStockDisplay(product) === "Disponible"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {getStockDisplay(product)}
          </span>
        </div>

        {/* Spacer to push bottom content down */}
        <div className="flex-grow"></div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={!isAvailable(product)}
          className="w-full bg-orange-600 text-white py-2 px-3 sm:px-4 rounded-md hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base"
        >
          <EyeIcon className="h-4 w-4 sm:h-5 sm:w-5" />
          <span>
            {!isAvailable(product) ? "No disponible" : "Ver producto"}
          </span>
        </button>

        {currentQuantity > 0 && (
          <p className="text-xs sm:text-sm text-green-600 mt-2 text-center">
            {currentQuantity} en el carrito
          </p>
        )}
      </div>
    </div>
  );
}
