import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://www.construmax.com.uy/";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/api/",
          "/checkout/",
          "/carrito/",
          "/_next/",
          "/static/",
          "/*.json",
          "/test-*",
        ],
      },
      // Reglas específicas para bots de Google
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/admin/", "/api/webhook/", "/checkout/", "/carrito/"],
      },
      // Permitir acceso a Googlebot-Image para imágenes
      {
        userAgent: "Googlebot-Image",
        allow: "/",
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
