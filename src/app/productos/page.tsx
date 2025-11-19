import { Metadata } from "next";
import { productService, categoryService } from "@/lib/services";
import AllProductsClient from "./AllProductsClient";
import StructuredData from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import { productListSchema, breadcrumbSchema } from "@/lib/schemas";

// Forzar revalidación en cada request
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Productos de Construcción y Metalúrgica - Catálogo Completo",
  description:
    "🛍️ Explora nuestro catálogo completo de materiales de construcción y metalúrgica. Cemento, hierros, herramientas, electricidad, plomería y más. ✅ Mejores precios en Uruguay 🚚 Envío gratis +$50.000",
  keywords: [
    "catálogo construcción Uruguay",
    "productos construcción completo",
    "materiales construcción variedad",
    "cemento hierros herramientas",
    "electricidad plomería construcción",
    "materiales obra completos",
  ],
  openGraph: {
    title:
      "Productos de Construcción y Metalúrgica - Catálogo Completo | ConstruMax",
    description:
      "🛍️ Explora nuestro catálogo completo de materiales de construcción y metalúrgica. Cemento, hierros, herramientas, electricidad, plomería y más.",
    url: "https://www.construmax.com.uy/productos",
    images: [
      {
        url: "/og-productos.jpg",
        width: 1200,
        height: 630,
        alt: "Catálogo de Productos - ConstruMax",
      },
    ],
  },
  twitter: {
    title: "Productos de Construcción y Metalúrgica - Catálogo Completo",
    description:
      "🛍️ Explora nuestro catálogo completo de materiales de construcción y metalúrgica en Uruguay.",
  },
  alternates: {
    canonical: "https://www.construmax.com.uy/productos",
  },
};

export default async function ProductosPage() {
  const [products, categories] = await Promise.all([
    productService.getAll(),
    categoryService.getAll(),
  ]);

  const breadcrumbs = [
    { name: "Inicio", url: "https://www.construmax.com.uy" },
    { name: "Productos", url: "https://www.construmax.com.uy/productos" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Structured Data */}
      <StructuredData
        data={[productListSchema(products), breadcrumbSchema(breadcrumbs)]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { name: "Inicio", href: "/" },
            { name: "Productos", href: "/productos", current: true },
          ]}
        />

        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Nuestros Productos
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Encuentra todo lo que necesitas para tu proyecto de construcción
          </p>
        </div>

        {/* All Subcategories */}
        <AllProductsClient products={products} categories={categories} />
      </div>
    </div>
  );
}
