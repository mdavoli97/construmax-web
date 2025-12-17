"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { usePathname } from "next/navigation";
import { ExchangeRateProvider } from "@/contexts/ExchangeRateContext";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  return (
    <html lang="es" className="light">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, user-scalable=yes"
        />
        <meta name="format-detection" content="telephone=yes" />
        <meta name="theme-color" content="#ea580c" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="ConstruMax" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="manifest" href="/manifest.json" />

        {/* Preconnect para mejorar performance */}
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />

        {/* DNS Prefetch para dominios externos */}

        {/* Schema.org Organization markup */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "ConstruMax",
              url: "https://www.construmax.com.uy/",
              logo: "https://www.construmax.com.uy/logo.png",
              description:
                "Materiales de construcción, barraca de hierro, portland. Encontrá los mejores precios del mercado en ConstruMax.",
              foundingDate: "2025",
              address: {
                "@type": "PostalAddress",
                addressCountry: "UY",
                addressLocality: "Montevideo",
              },
              areaServed: "Uruguay",
              hasOfferCatalog: {
                "@type": "OfferCatalog",
                name: "Materiales de Construcción",
                itemListElement: [
                  {
                    "@type": "Offer",
                    itemOffered: {
                      "@type": "Product",
                      name: "Cemento",
                    },
                  },
                  {
                    "@type": "Offer",
                    itemOffered: {
                      "@type": "Product",
                      name: "Hierros de Construcción",
                    },
                  },
                  {
                    "@type": "Offer",
                    itemOffered: {
                      "@type": "Product",
                      name: "Herramientas de Construcción",
                    },
                  },
                ],
              },
            }),
          }}
        />
      </head>
      <body
        className={`${inter.className} antialiased min-h-screen ${
          isAdminRoute ? "" : "flex flex-col"
        }`}
      >
        <ExchangeRateProvider>
          {!isAdminRoute && <Header />}
          <main className={isAdminRoute ? "" : "flex-1 w-full"}>
            {children}
          </main>
          {!isAdminRoute && <Footer />}
        </ExchangeRateProvider>
      </body>
    </html>
  );
}
