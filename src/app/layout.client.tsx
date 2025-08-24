"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { usePathname } from "next/navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${
          geistMono.variable
        } antialiased min-h-screen ${isAdminRoute ? "" : "flex flex-col"}`}
      >
        {!isAdminRoute && <Header />}
        <main className={isAdminRoute ? "" : "flex-1"}>{children}</main>
        {!isAdminRoute && <Footer />}
      </body>
    </html>
  );
}
