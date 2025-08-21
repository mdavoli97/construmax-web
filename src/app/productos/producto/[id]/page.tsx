"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeftIcon,
  ShoppingCartIcon,
  PlusIcon,
  MinusIcon,
  HomeIcon,
} from "@heroicons/react/24/outline";
import { Product, ProductImage } from "@/types";
import { useCartStore } from "@/store/cartStore";
import ProductCard from "@/components/ProductCard";
import ProductImageGallery from "@/components/ProductImageGallery";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [productImages, setProductImages] = useState<ProductImage[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addItem, getItemQuantity } = useCartStore();

  const currentQuantity = product ? getItemQuantity(product.id) : 0;

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${params.id}`);
        if (response.ok) {
          const productData = await response.json();
          setProduct(productData);

          // Fetch product images
          try {
            const imagesResponse = await fetch(
              `/api/products/${params.id}/images`
            );
            if (imagesResponse.ok) {
              const imagesData = await imagesResponse.json();
              setProductImages(imagesData);
            }
          } catch (error) {
            console.error("Error fetching product images:", error);
          }

          // Fetch related products from the same category
          if (productData.category) {
            const relatedResponse = await fetch(
              `/api/products?category=${productData.category}&limit=4&exclude=${productData.id}`
            );
            if (relatedResponse.ok) {
              const relatedData = await relatedResponse.json();
              setRelatedProducts(relatedData);
            }
          }
        } else {
          router.push("/productos");
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        router.push("/productos");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchProduct();
    }
  }, [params.id, router]);

  const handleAddToCart = () => {
    if (product) {
      addItem(product, quantity);
      setQuantity(1);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-UY", {
      style: "currency",
      currency: "UYU",
    }).format(price);
  };

  const goBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando producto...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Producto no encontrado
          </h2>
          <p className="text-gray-600 mb-4">
            El producto que buscas no existe o fue eliminado.
          </p>
          <button
            onClick={() => router.push("/productos")}
            className="bg-orange-600 text-white px-6 py-3 rounded-md hover:bg-orange-700 transition-colors"
          >
            Volver a Productos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <Link
            href="/"
            className="flex items-center hover:text-orange-600 transition-colors"
          >
            <HomeIcon className="h-4 w-4 mr-1" />
            Inicio
          </Link>
          <span>/</span>
          <Link
            href="/productos"
            className="hover:text-orange-600 transition-colors"
          >
            Productos
          </Link>
          {product.category && (
            <>
              <span>/</span>
              <Link
                href={`/productos/${product.category}`}
                className="hover:text-orange-600 transition-colors capitalize"
              >
                {product.category}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-gray-900 font-medium">{product.name}</span>
        </nav>

        {/* Back Button */}
        <button
          onClick={goBack}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Volver
        </button>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
            {/* Product Images */}
            <div className="w-full max-w-lg mx-auto lg:mx-0">
              <ProductImageGallery
                product={product}
                productImages={productImages}
              />
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              {/* Featured Badge */}
              {product.featured && (
                <div className="inline-block bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Producto Destacado
                </div>
              )}

              {/* Product Title */}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {product.name}
                </h1>
                <p className="text-xl text-gray-600">{product.description}</p>
              </div>

              {/* Price */}
              <div className="border-t border-b border-gray-200 py-4">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold text-orange-600">
                    {formatPrice(product.price)}
                  </span>
                  <span className="text-lg text-gray-500">
                    por {product.unit}
                  </span>
                </div>
              </div>

              {/* Product Details */}
              <div className="space-y-3">
                {product.brand && (
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Marca:</span>
                    <span className="text-gray-900">{product.brand}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">SKU:</span>
                  <span className="text-gray-900">{product.sku}</span>
                </div>

                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">
                    Stock disponible:
                  </span>
                  <span
                    className={`font-medium ${
                      product.stock > 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {product.stock} {product.unit}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Categoría:</span>
                  <span className="text-gray-900 capitalize">
                    {product.category}
                  </span>
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <span className="font-medium text-gray-700">Cantidad:</span>
                  <div className="flex items-center border border-gray-300 rounded-md">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 hover:bg-gray-100 transition-colors"
                    >
                      <MinusIcon className="h-5 w-5" />
                    </button>
                    <span className="px-4 py-2 text-center min-w-[80px] font-medium">
                      {quantity}
                    </span>
                    <button
                      onClick={() =>
                        setQuantity(Math.min(product.stock, quantity + 1))
                      }
                      className="p-2 hover:bg-gray-100 transition-colors"
                      disabled={quantity >= product.stock}
                    >
                      <PlusIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Total Price */}
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">Total:</span>
                    <span className="text-2xl font-bold text-orange-600">
                      {formatPrice(product.price * quantity)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Add to Cart Button */}
              <div className="space-y-3">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="w-full bg-orange-600 text-white py-3 px-6 rounded-md hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2 text-lg font-medium"
                >
                  <ShoppingCartIcon className="h-6 w-6" />
                  <span>
                    {product.stock === 0 ? "Sin stock" : "Agregar al carrito"}
                  </span>
                </button>

                {currentQuantity > 0 && (
                  <p className="text-sm text-green-600 text-center font-medium">
                    ✓ {currentQuantity}{" "}
                    {currentQuantity === 1 ? "unidad" : "unidades"} en el
                    carrito
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Additional Product Information */}
          <div className="border-t border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Descripción del Producto
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {product.description}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Información Adicional
                </h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• Producto de alta calidad para construcción</li>
                  <li>• Entrega rápida en Montevideo y interior</li>
                  <li>• Garantía de satisfacción</li>
                  <li>• Asesoramiento técnico incluido</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Productos Relacionados
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
