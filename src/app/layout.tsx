import type { Metadata } from "next";
import ClientLayout from "./layout.client";

export const metadata: Metadata = {
  title: "Barraca Construcción - Materiales de Construcción y Metalúrgica",
  description:
    "Tu proveedor confiable de materiales de construcción y metalúrgica en Uruguay. Cemento, hierros, herramientas, electricidad y plomería.",
  keywords:
    "construcción, materiales, metalúrgica, cemento, hierros, herramientas, Uruguay",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <ClientLayout>{children}</ClientLayout>;
}
