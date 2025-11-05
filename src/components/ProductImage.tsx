"use client";

import Image from "next/image";

interface ProductImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  priority?: boolean;
  sizes?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export default function ProductImage({
  src,
  alt,
  className = "",
  fill = false,
  width = 400,
  height = 400,
  priority = false,
  sizes,
  onLoad,
  onError,
}: ProductImageProps) {
  // Si no hay src, mostrar placeholder
  if (!src) {
    return (
      <div
        className={`bg-gray-300 flex items-center justify-center ${className}`}
      >
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-2">📦</div>
          <div className="text-sm">Sin imagen</div>
        </div>
      </div>
    );
  }

  if (fill) {
    // Para imágenes con fill, usar el layout absoluto de Next.js
    return (
      <Image
        src={src}
        alt={alt}
        fill
        className={`object-contain ${className}`}
        style={{ objectPosition: "center" }}
        onLoad={onLoad}
        onError={(e) => {
          e.currentTarget.style.display = "none";
          onError?.();
        }}
        priority={priority}
        sizes={
          sizes || "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        }
      />
    );
  } else {
    // Para imágenes con dimensiones fijas
    return (
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={`object-contain ${className}`}
        style={{ objectPosition: "center" }}
        onLoad={onLoad}
        onError={(e) => {
          e.currentTarget.style.display = "none";
          onError?.();
        }}
        priority={priority}
        sizes={sizes}
      />
    );
  }
}
