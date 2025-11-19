import type { Metadata } from "next";
import ClientLayout from "./layout.client";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.construmax.com.uy"),
  title: {
    default:
      "Barraca Construcción - Materiales de Construcción y Metalúrgica en Uruguay",
    template: "%s | Barraca Construcción",
  },
  description:
    "✅ Tu proveedor confiable de materiales de construcción y metalúrgica en Uruguay desde 2025. ⚡ Cemento, hierros, herramientas, electricidad y plomería. 🚚 Envío gratis en compras +$50.000",
  keywords: [
    "materiales construcción Uruguay",
    "ConstruMax",
    "cemento Uruguay",
    "hierros construcción",
    "herramientas construcción",
    "materiales metalúrgica",
    "electricidad construcción",
    "plomería materiales",
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
    title: "ConstruMax - Materiales de Construcción y Metalúrgica en Uruguay",
    description:
      "✅ Tu proveedor confiable de materiales de construcción y metalúrgica en Uruguay desde 2025. ⚡ Cemento, hierros, herramientas, electricidad y plomería. 🚚 Envío gratis en compras +$50.000",
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
      "✅ Tu proveedor confiable de materiales de construcción y metalúrgica en Uruguay desde 2025. 🚚 Envío gratis +$50.000",
    images: ["/twitter-image.jpg"],
  },
  alternates: {
    canonical: "https://www.construmax.com.uy/",
  },
  verification: {
    google: "VR3BjjW5XRkz9GM09GJ3wYu6fhE-K8MLL6L",
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
