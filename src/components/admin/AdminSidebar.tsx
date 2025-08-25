"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { useState } from "react";
import {
  HomeIcon,
  BoxIcon,
  TagIcon,
  ShoppingCartIcon,
  BarChart3Icon,
  LogOutIcon,
  DollarSignIcon,
  MenuIcon,
  XIcon,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const navigation = [
  { name: "Dashboard", href: "/admin", icon: HomeIcon },
  { name: "Productos", href: "/admin/productos", icon: BoxIcon },
  { name: "Precios", href: "/admin/precios", icon: DollarSignIcon },
  { name: "Categorías", href: "/admin/categorias", icon: TagIcon },
  { name: "Órdenes", href: "/admin/ordenes", icon: ShoppingCartIcon },
  { name: "Reportes", href: "/admin/reportes", icon: BarChart3Icon },
];

interface AdminSidebarProps {
  isMobileMenuOpen?: boolean;
  setIsMobileMenuOpen?: (open: boolean) => void;
}

export default function AdminSidebar({
  isMobileMenuOpen,
  setIsMobileMenuOpen,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();

  const handleLogout = () => {
    if (confirm("¿Estás seguro que quieres cerrar sesión?")) {
      logout();
    }
  };

  const handleLinkClick = () => {
    // Cerrar menú móvil al hacer click en un enlace
    if (setIsMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-4 sm:p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Admin Panel</h2>
      </div>

      <nav className="flex-1 mt-4 sm:mt-6 overflow-y-auto">
        <div className="px-3">
          {navigation.map((item) => {
            let isActive = false;

            if (item.href === "/admin") {
              // Dashboard solo está activo si estamos exactamente en /admin
              isActive = pathname === "/admin";
            } else {
              // Para otras rutas, verificar si coincide exactamente o es una subruta
              isActive =
                pathname === item.href || pathname.startsWith(item.href + "/");
            }

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={handleLinkClick}
                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md mb-1 transition-colors ${
                  isActive
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-800 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <item.icon
                  className={`mr-3 h-5 w-5 flex-shrink-0 ${
                    isActive
                      ? "text-blue-500"
                      : "text-gray-400 group-hover:text-gray-500"
                  }`}
                />
                {item.name}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Botón de logout - siempre en la parte inferior */}
      <div className="border-t border-gray-200 p-3 flex-shrink-0">
        <button
          onClick={handleLogout}
          className="group flex items-center w-full px-3 py-2 text-sm font-medium rounded-md text-gray-800 hover:bg-red-50 hover:text-red-700 transition-colors"
        >
          <LogOutIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-red-500 flex-shrink-0" />
          Cerrar Sesión
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex flex-col bg-white shadow-sm border-r border-gray-200 h-full">
          <SidebarContent />
        </div>
      </div>

      {/* Mobile Sidebar usando Sheet */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="w-80 p-0 lg:hidden">
          <SheetTitle className="sr-only">Admin Panel Navigation</SheetTitle>
          <SidebarContent />
        </SheetContent>
      </Sheet>
    </>
  );
}
