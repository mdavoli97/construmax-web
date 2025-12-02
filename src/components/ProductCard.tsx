"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { EyeIcon } from "@heroicons/react/24/outline";
import { Product } from "@/types";
import { useItemQuantity } from "@/hooks/useItemQuantity";
import ProductImage from "./ProductImage";
import { getUSDToUYURate, formatPriceWithCurrency } from "@/lib/currency";

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
    router.push(`/productos/${product.category}/${product.id}`);
  };

  const handleCardClick = () => {
    router.push(`/productos/${product.category}/${product.id}`);
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

  const formatPrice = (price: number) => {
    // Determinar la moneda del producto
    const currency = product.price_group?.currency || "USD";

    if (!exchangeRate && currency === "USD") {
      return "Cargando...";
    }

    return formatPriceWithCurrency(
      price,
      currency,
      exchangeRate || undefined,
      false
    );
  };

  const formatPriceWithIVA = (price: number) => {
    // Determinar la moneda del producto
    const currency = product.price_group?.currency || "USD";

    if (!exchangeRate && currency === "USD") {
      return "Cargando...";
    }

    // Si está en UYU, aplicar IVA directamente
    if (currency === "UYU") {
      const priceWithIVA = price * 1.22; // 22% IVA
      return formatPriceWithCurrency(
        priceWithIVA,
        currency,
        exchangeRate || undefined,
        false
      );
    }

    // Si está en USD, convertir primero y luego aplicar IVA
    if (currency === "USD" && exchangeRate) {
      const priceWithIVA = price * 1.22; // 22% IVA
      return formatPriceWithCurrency(
        priceWithIVA,
        currency,
        exchangeRate || undefined,
        false
      );
    }

    // Fallback
    return formatPriceWithCurrency(
      price * 1.22,
      currency,
      exchangeRate || undefined,
      false
    );
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
      className="bg-white rounded-xl shadow-md border-2 border-gray-200 overflow-hidden hover:shadow-xl hover:border-orange-300 transition-all duration-300 cursor-pointer flex flex-col h-full group"
    >
      {" "}
      {/* Product Image */}
      <div className="relative h-20 sm:h-24 bg-gradient-to-br from-gray-50 via-white to-orange-50/30 overflow-hidden">
        <ProductImage
          src={product.primary_image}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
        />
        {/* Image overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        {product.featured && (
          <div className="absolute top-4 left-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg backdrop-blur-sm border border-orange-400/30">
            ⭐ Destacado
          </div>
        )}
      </div>
      {/* Product Info */}
      <div className="p-3 flex flex-col flex-grow">
        <h3 className="text-sm font-bold text-gray-900 mb-2 line-clamp-2 leading-tight group-hover:text-orange-600 transition-colors duration-300">
          {product.name}
        </h3>

        <div className="flex flex-col gap-1 mb-2">
          <span className="text-base font-bold bg-gradient-to-r from-orange-600 via-orange-500 to-orange-700 bg-clip-text text-transparent">
            {formatPriceWithIVA(product.price)}
          </span>
          <span className="text-xs text-gray-500 font-medium">
            {getPriceUnit(product)}
          </span>
        </div>

        {product.brand && (
          <p className="text-xs text-gray-600 mb-2 font-medium">
            {product.brand}
          </p>
        )}

        <div className="flex items-center justify-center mb-3">
          <span
            className={`text-xs font-bold px-2 py-1 rounded-md ${
              getStockDisplay(product) === "Disponible"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {getStockDisplay(product) === "Disponible" ? "✓" : "✗"}
          </span>
        </div>

        {/* Spacer to push bottom content down */}
        <div className="flex-grow"></div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={!isAvailable(product)}
          className="w-full inline-flex items-center justify-center px-3 py-2 text-xs font-medium text-orange-600 bg-white border border-orange-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-all duration-200 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200 disabled:cursor-not-allowed"
        >
          <EyeIcon className="h-3 w-3 mr-1" />
          <span>{!isAvailable(product) ? "No disponible" : "Ver"}</span>
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
