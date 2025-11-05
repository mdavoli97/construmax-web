import { notFound } from "next/navigation";
import { productService, categoryService } from "@/lib/services";
import CategoryClient from "./CategoryClient";

// Forzar revalidación en cada request
export const revalidate = 0;

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

  return (
    <CategoryClient
      category={category}
      categoryInfo={categoryInfo}
      categories={categories}
      initialProducts={products}
    />
  );
}
