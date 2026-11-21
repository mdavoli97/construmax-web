import { Product, Category } from "@/types";

export interface BreadcrumbItem {
  name: string;
  url: string;
}

// Schema para Organización
export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "ConstruMax",
  url: "https://www.construmax.com.uy/",
  logo: "https://www.construmax.com.uy/logo.png",
  description:
    "Materiales de construcción, barraca de hierros, portland. Encontrá los mejores precios del mercado en ConstruMax.",
  foundingDate: "2025",
  address: {
    "@type": "PostalAddress",
    addressCountry: "UY",
    addressLocality: "Montevideo",
    addressRegion: "Montevideo",
  },
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+598-97971111",
    contactType: "customer service",
    availableLanguage: "Spanish",
  },
  areaServed: {
    "@type": "Country",
    name: "Uruguay",
  },
  sameAs: [
    "https://facebook.com/ConstruMax",
    "https://instagram.com/ConstruMax",
  ],
};

// Schema para producto individual
export const productSchema = (product: Product, category?: Category) => ({
  "@context": "https://schema.org",
  "@type": "Product",
  name: product.name,
  description: product.description,
  image:
    product.primary_image ||
    (Array.isArray(product.images) && product.images.length > 0
      ? typeof product.images[0] === "string"
        ? product.images[0]
        : product.images[0].image_url
      : null),
  sku: product.sku || product.id.toString(),
  brand: {
    "@type": "Brand",
    name: "ConstruMax",
  },
  category: category?.name || "Materiales de Construcción",
  offers: {
    "@type": "Offer",
    price: product.price.toString(),
    priceCurrency: "UYU",
    availability:
      product.stock > 0
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    seller: {
      "@type": "Organization",
      name: "ConstruMax",
    },
    url: `https://www.construmax.com.uy/productos/${
      category?.slug || "general"
    }`,
    priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0], // 30 days from now
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.5",
    reviewCount: "150",
    bestRating: "5",
    worstRating: "1",
  },
});

// Schema para lista de productos
export const productListSchema = (
  products: Product[],
  category?: Category
) => ({
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: category ? `Productos de ${category.name}` : "Catálogo de Productos",
  description:
    category?.description ||
    "Catálogo completo de materiales de construcción y metalúrgica",
  numberOfItems: products.length,
  itemListElement: products.slice(0, 20).map((product, index) => ({
    "@type": "ListItem",
    position: index + 1,
    item: {
      "@type": "Product",
      name: product.name,
      description: product.description,
      image:
        product.primary_image ||
        (Array.isArray(product.images) && product.images.length > 0
          ? typeof product.images[0] === "string"
            ? product.images[0]
            : product.images[0].image_url
          : null),
      url: `https://www.construmax.com.uy/productos/${
        category?.slug || "general"
      }`,
      offers: {
        "@type": "Offer",
        price: product.price.toString(),
        priceCurrency: "UYU",
        availability:
          product.stock > 0
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
      },
    },
  })),
});

// Schema para breadcrumbs
export const breadcrumbSchema = (items: BreadcrumbItem[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    item: item.url,
  })),
});

// Schema para LocalBusiness
export const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "ConstruMax",
  image: "https://www.construmax.com.uy/logo.png",
  description:
    "Materiales de construcción y metalúrgica de alta calidad en Uruguay",
  url: "https://www.construmax.com.uy/",
  telephone: "+598-97971111",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Jose Marmol 615", // Agregar dirección real
    addressLocality: "Montevideo",
    addressRegion: "Montevideo",
    addressCountry: "UY",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: -34.86147399607502,
    longitude: -56.233142538401886,
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "08:00",
      closes: "18:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Saturday",
      opens: "08:00",
      closes: "13:00",
    },
  ],
  priceRange: "$$",
  acceptedPaymentMethod: [
    "http://purl.org/goodrelations/v1#ByBankTransferInAdvance",
    "http://purl.org/goodrelations/v1#Cash",
    "http://purl.org/goodrelations/v1#PayPal",
  ],
  areaServed: {
    "@type": "Country",
    name: "Uruguay",
  },
};

// Schema para WebSite con SearchAction y mejor estructura de navegación
export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "ConstruMax",
  alternateName: "ConstruMax Uruguay",
  url: "https://www.construmax.com.uy/",
  description:
    "Materiales de construcción, barraca de hierros, portland. Encontrá los mejores precios del mercado en ConstruMax.",
  publisher: {
    "@type": "Organization",
    name: "ConstruMax",
  },
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate:
        "https://www.construmax.com.uy/productos?buscar={search_term_string}",
    },
    "query-input": "required name=search_term_string",
  },
  mainEntity: {
    "@type": "ItemList",
    name: "Secciones principales",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        item: {
          "@type": "WebPage",
          "@id": "https://www.construmax.com.uy/productos/construccion",
          name: "Construcción",
          description:
            "Materiales para construcción - cemento, hierros, bloques, ladrillos",
        },
      },
      {
        "@type": "ListItem",
        position: 2,
        item: {
          "@type": "WebPage",
          "@id": "https://www.construmax.com.uy/productos/metalurgica",
          name: "Metalúrgica",
          description:
            "Productos metalúrgicos - chapas, perfiles, soldadura, herrajes",
        },
      },
      {
        "@type": "ListItem",
        position: 3,
        item: {
          "@type": "WebPage",
          "@id": "https://www.construmax.com.uy/productos",
          name: "Nuestros Productos",
          description:
            "Catálogo completo de productos - construcción y metalúrgica",
        },
      },
    ],
  },
};

// Schema para mejorar la visualización de sitelinks en Google
export const siteNavigationSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": "https://www.construmax.com.uy/",
  name: "ConstruMax - Inicio",
  isPartOf: {
    "@type": "WebSite",
    "@id": "https://www.construmax.com.uy/",
  },
  about: {
    "@type": "LocalBusiness",
    "@id": "https://www.construmax.com.uy/#organization",
  },
  mainEntity: {
    "@type": "ItemList",
    name: "Navegación principal",
    description: "Secciones principales de ConstruMax",
    itemListElement: [
      {
        "@type": "SiteNavigationElement",
        position: 1,
        name: "Contactanos",
        description: "Información de contacto y ubicación",
        url: "https://www.construmax.com.uy/#contacto",
      },
      {
        "@type": "SiteNavigationElement",
        position: 2,
        name: "Construcción",
        description: "Materiales para construcción - cemento, hierros, bloques",
        url: "https://www.construmax.com.uy/productos/construccion",
      },
      {
        "@type": "SiteNavigationElement",
        position: 3,
        name: "Metalúrgica",
        description: "Productos metalúrgicos - chapas, perfiles, soldadura",
        url: "https://www.construmax.com.uy/productos/metalurgica",
      },
      {
        "@type": "SiteNavigationElement",
        position: 4,
        name: "Nuestros Productos",
        description: "Catálogo completo de productos disponibles",
        url: "https://www.construmax.com.uy/productos",
      },
    ],
  },
};
