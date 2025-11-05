"use client";

import { useState } from "react";
import { Product, ProductImage } from "@/types";
import ProductImageComponent from "./ProductImage";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

interface ProductImageGalleryProps {
  product: Product;
  productImages?: ProductImage[];
}

export default function ProductImageGallery({
  product,
  productImages = [],
}: ProductImageGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [imageLoading, setImageLoading] = useState(true);

  // Construir array de imágenes disponibles
  const images = [];

  // Agregar imagen principal si existe
  if (product.primary_image) {
    images.push({
      url: product.primary_image,
      alt: product.name,
    });
  }

  // Agregar imágenes adicionales desde productImages
  productImages
    .filter((img) => !img.is_primary) // Evitar duplicar la imagen principal
    .sort((a, b) => a.display_order - b.display_order)
    .forEach((img) => {
      images.push({
        url: img.image_url,
        alt: img.alt_text || product.name,
      });
    });

  // Si no hay imágenes, mostrar placeholder
  if (images.length === 0) {
    return (
      <div className="space-y-4">
        <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <div className="text-center">
              <div className="text-8xl mb-2">📦</div>
              <div className="text-lg">Sin imágenes disponibles</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentImage = images[selectedImageIndex];

  const goToPrevious = () => {
    setSelectedImageIndex((prev) =>
      prev === 0 ? images.length - 1 : prev - 1
    );
    setImageLoading(true); // Reset loading cuando cambia imagen
  };

  const goToNext = () => {
    setSelectedImageIndex((prev) =>
      prev === images.length - 1 ? 0 : prev + 1
    );
    setImageLoading(true); // Reset loading cuando cambia imagen
  };

  return (
    <div className="space-y-4 w-full">
      {/* Imagen principal */}
      <div className="relative aspect-square bg-gray-200 rounded-lg overflow-hidden group w-full max-w-lg mx-auto">
        {imageLoading && <Skeleton className="absolute inset-0 rounded-lg" />}
        <ProductImageComponent
          src={currentImage.url}
          alt={currentImage.alt}
          className={`transition-opacity duration-300 ${
            imageLoading ? "opacity-0" : "opacity-100"
          }`}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          onLoad={() => setImageLoading(false)}
          onError={() => setImageLoading(false)}
        />

        {/* Controles de navegación */}
        {images.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-opacity-70"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-opacity-70"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </>
        )}

        {/* Indicador de imagen actual */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
            {selectedImageIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Miniaturas */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2 max-w-md mx-auto">
          {images.map((image, index) => (
            <button
              key={index}
              className={`relative aspect-square bg-gray-200 rounded-md overflow-hidden border-2 transition-all duration-200 ${
                selectedImageIndex === index
                  ? "border-orange-500 ring-2 ring-orange-200"
                  : "border-gray-300 hover:border-orange-300"
              }`}
              onClick={() => {
                setSelectedImageIndex(index);
                setImageLoading(true);
              }}
            >
              <ProductImageComponent
                src={image.url}
                alt={image.alt}
                fill
                sizes="100px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
