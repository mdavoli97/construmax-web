import { notFound } from "next/navigation";
import { Metadata } from "next";
import { productService, categoryService } from "@/lib/services";
import CategoryClient from "./CategoryClient";
import StructuredData from "@/components/StructuredData";
import { productListSchema, breadcrumbSchema } from "@/lib/schemas";

// Forzar revalidación en cada request
export const revalidate = 0;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const categories = await categoryService.getAll();
  const categoryInfo = categories.find((cat) => cat.slug === category);

  if (!categoryInfo) {
    return {
      title: "Categoría no encontrada",
    };
  }

  const products = await productService.getByCategory(category);
  const productCount = products.length;

  return {
    title: `${categoryInfo.name} - Materiales de Construcción Uruguay`,
    description: `🏗️ ${categoryInfo.description} ✅ ${productCount} productos disponibles en ${categoryInfo.name}. 🚚 Envío gratis en compras superiores a $50.000 en Uruguay.`,
    keywords: [
      `${categoryInfo.name.toLowerCase()} construcción`,
      `materiales ${categoryInfo.name.toLowerCase()} Uruguay`,
      `${categoryInfo.name.toLowerCase()} obra`,
      `comprar ${categoryInfo.name.toLowerCase()}`,
      `${categoryInfo.name.toLowerCase()} Montevideo`,
      "construcción Uruguay",
    ],
    openGraph: {
      title: `${categoryInfo.name} - Materiales de Construcción | ConstruMax`,
      description: `🏗️ ${categoryInfo.description} ✅ ${productCount} productos disponibles. 🚚 Envío gratis +$50.000`,
      url: `https://www.construmax.com.uy/productos/${category}`,
      images: [
        {
          url: `/og-category-${category}.jpg`,
          width: 1200,
          height: 630,
          alt: `${categoryInfo.name} - ConstruMax`,
        },
      ],
    },
    twitter: {
      title: `${categoryInfo.name} - Materiales de Construcción Uruguay`,
      description: `🏗️ ${categoryInfo.description} ✅ ${productCount} productos disponibles.`,
    },
    alternates: {
      canonical: `https://www.construmax.com.uy/productos/${category}`,
    },
  };
}

interface CategoryPageProps {
  params: Promise<{
    category: string;
  }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;

  // Obtener datos de la base de datos
  const [categories, products] = await Promise.all([
    categoryService.getAll(),
    productService.getByCategory(category),
  ]);

  // Verificar si la categoría existe
  const categoryExists = categories.find((cat) => cat.slug === category);
  if (!categoryExists) {
    notFound();
  }

  const categoryInfo = categories.find((cat) => cat.slug === category);

  if (!categoryInfo) {
    notFound();
  }

  const breadcrumbs = [
    { name: "Inicio", url: "https://www.construmax.com.uy" },
    { name: "Productos", url: "https://www.construmax.com.uy/productos" },
    {
      name: categoryInfo.name,
      url: `https://www.construmax.com.uy/productos/${category}`,
    },
  ];

  return (
    <>
      {/* Structured Data */}
      <StructuredData
        data={[
          productListSchema(products, categoryInfo),
          breadcrumbSchema(breadcrumbs),
        ]}
      />

      <CategoryClient
        category={category}
        categoryInfo={categoryInfo}
        categories={categories}
        initialProducts={products}
      />
    </>
  );
}
