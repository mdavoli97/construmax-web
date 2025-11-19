import { MetadataRoute } from "next";
import { categoryService } from "@/lib/services";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://www.construmax.com.uy";

  // Páginas estáticas
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/productos`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/carrito`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/checkout`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  try {
    // Obtener todas las categorías
    const categories = await categoryService.getAll();

    // Crear URLs para cada categoría
    const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
      url: `${baseUrl}/productos/${category.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    // Obtener todos los productos para incluir en el sitemap si es necesario
    // Por ahora solo incluimos las categorías ya que no hay páginas individuales de productos

    return [...staticPages, ...categoryPages];
  } catch (error) {
    console.error("Error generating sitemap:", error);
    // En caso de error, devolver solo las páginas estáticas
    return staticPages;
  }
}
