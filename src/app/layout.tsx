import type { Metadata } from "next";
import ClientLayout from "./layout.client";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.construmax.com.uy"),
  title: {
    default:
      "ConstruMax - Tienda Online ¡Todo lo que necesitas para construir!",
    template: "%s | ConstruMax",
  },
  description:
    "Materiales de construcción, barraca de hierros, portland. Encontrá los mejores precios del mercado en ConstruMax.",
  keywords: [
    "materiales construcción Uruguay",
    "ConstruMax",
    "portland Uruguay",
    "hierros construcción",

    "materiales metalúrgica",

    "construcción Montevideo",
    "materiales obras",
  ],
  authors: [{ name: "ConstruMax" }],
  creator: "ConstruMax",
  publisher: "ConstruMax",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "es_UY",
    url: "https://www.construmax.com.uy/",
    siteName: "ConstruMax",
    title: "ConstruMax - Tienda Online ¡Todo lo que necesitas para construir!",
    description:
      "Materiales de construcción, barraca de hierros, portland. Encontrá los mejores precios del mercado en ConstruMax.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "ConstruMax - Materiales de Construcción Uruguay",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@ConstruMax",
    creator: "@ConstruMax",
    title: "ConstruMax - Materiales de Construcción Uruguay",
    description:
      "Materiales de construcción, barraca de hierros, portland. Encontra los mejores precios del mercado en ConstruMax.",
    images: ["/twitter-image.jpg"],
  },
  alternates: {
    canonical: "https://www.construmax.com.uy/",
  },
  verification: {
    google: "VR3BjiW5XRkz9GM09GJ3wYu6fhE-K8MLL6Lfk4Sgzfk",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "16x16 32x32", type: "image/x-icon" },
      { url: "/favicon.svg", sizes: "any", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-icon.svg", sizes: "180x180", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.ico",
  },
  category: "construcción",
  classification: "Materiales de Construcción y Metalúrgica",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <ClientLayout>{children}</ClientLayout>;
}
