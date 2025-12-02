"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ShoppingCartIcon, MenuIcon } from "lucide-react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useCartCount } from "@/hooks/useCartCount";
import SearchDialog from "@/components/SearchDialog";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import Image from "next/image";

// Tipos para la estructura de navegación
interface Category {
  id: number;
  name: string;
  description: string | null;
  slug?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface NavigationItem {
  title: string;
  href: string;
  description: string;
  icon: string;
}

interface NavigationStructure {
  name: string;
  href?: string;
  type: "link" | "menu";
  items?: NavigationItem[];
}

// Función para mapear categorías a iconos
const getCategoryIcon = (categoryName: string): string => {
  const iconMap: Record<string, string> = {
    construccion: "🏗️",
    construcción: "🏗️",
    metalurgica: "⚙️",
    metalúrgica: "⚙️",
    herramientas: "🔧",
    herreria: "🔨",
    herrería: "🔨",
    plomeria: "🔧",
    plomería: "🔧",
    electricidad: "⚡",
    pintura: "🎨",
    jardineria: "🌱",
    jardinería: "🌱",
  };

  const key = categoryName.toLowerCase();
  return iconMap[key] || "�";
};

// Componente para los items del menú con descripción (Desktop)
const ListItem = ({
  className,
  title,
  children,
  href,
  ...props
}: {
  className?: string;
  title: string;
  children?: React.ReactNode;
  href: string;
}) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          href={href}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-orange-50 hover:text-orange-600 focus:bg-orange-50 focus:text-orange-600",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  );
};

// Componente MobileNav con Sheet de shadcn/ui
const MobileNav = ({
  navigationStructure,
}: {
  navigationStructure: NavigationStructure[];
}) => {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className="lg:hidden p-2 text-gray-700 hover:text-orange-600 focus:outline-none rounded-md hover:bg-orange-50 transition-colors">
          <MenuIcon className="h-6 w-6" />
          <span className="sr-only">Abrir menú de navegación</span>
        </button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-[320px] sm:w-[400px] p-0 flex flex-col h-full"
      >
        <SheetHeader className="p-6 border-b flex-shrink-0">
          <SheetTitle className="flex items-center text-left">
            <Link
              href="/"
              className="flex items-center"
              onClick={() => setOpen(false)}
            >
              <div className="text-xl font-bold text-orange-600">🏗️</div>
              <span className="ml-2 text-lg font-bold text-gray-900">
                ConstruMax
              </span>
            </Link>
          </SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground mt-1">
            Navegación del sitio
          </SheetDescription>
        </SheetHeader>

        {/* Contenido scrolleable */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Menú Principal */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                Navegación
              </h4>
              <nav className="space-y-1">
                <Link
                  href="/"
                  className="flex items-center py-3 px-4 text-sm text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors font-medium"
                  onClick={() => setOpen(false)}
                >
                  🏠 Inicio
                </Link>
              </nav>
            </div>

            {/* Productos */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                Productos
              </h4>
              <nav className="space-y-1">
                {navigationStructure
                  .find((item) => item.type === "menu")
                  ?.items?.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="group flex items-start gap-3 py-3 px-4 text-sm text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                      onClick={() => setOpen(false)}
                    >
                      <span className="text-lg flex-shrink-0">{item.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium group-hover:text-orange-600">
                          {item.title}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                          {item.description}
                        </div>
                      </div>
                    </Link>
                  ))}
              </nav>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                ACERCA DE
              </h4>
              <nav className="space-y-1">
                <Link
                  href="/about"
                  className="flex items-center py-3 px-4 text-sm text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors font-medium"
                  onClick={() => setOpen(false)}
                >
                  ℹ️ Acerca del Desarrollador
                </Link>
              </nav>
            </div>
          </div>
        </div>

        {/* Footer fijo - siempre visible */}
        <div className="p-4 border-t bg-white flex-shrink-0">
          <Link
            href="/carrito"
            className="flex items-center justify-center gap-2 w-full bg-orange-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-700 transition-colors"
            onClick={() => setOpen(false)}
          >
            <ShoppingCartIcon className="h-5 w-5" />
            Ver Carrito
          </Link>
          <p className="text-xs text-gray-500 text-center mt-2">
            © 2025 ConstruMax. Todos los derechos reservados.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
};
export default function Header() {
  const totalItems = useCartCount();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);

  // Añadir shortcut de teclado para el buscador
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Obtener categorías de la base de datos
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setCategories(data.data.filter((cat: Category) => cat.is_active));
          } else {
            console.error("API returned success: false", data.error);
          }
        } else {
          console.error("HTTP error:", response.status, response.statusText);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        // En caso de error, usar categorías por defecto
        setCategories([
          {
            id: 1,
            name: "Construcción",
            slug: "construccion",
            description: "Materiales para construcción",
            is_active: true,
            created_at: "",
            updated_at: "",
          },
          {
            id: 2,
            name: "Metalúrgica",
            slug: "metalurgica",
            description: "Productos metalúrgicos",
            is_active: true,
            created_at: "",
            updated_at: "",
          },
          {
            id: 3,
            name: "Herramientas",
            slug: "herramientas",
            description: "Herramientas profesionales",
            is_active: true,
            created_at: "",
            updated_at: "",
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Crear estructura de navegación dinámica
  const navigationStructure: NavigationStructure[] = [
    {
      name: "Inicio",
      href: "/",
      type: "link" as const,
    },
    {
      name: "Productos",
      type: "menu" as const,
      items: [
        {
          title: "Todos los Productos",
          href: "/productos",
          description: "Explora nuestro catálogo completo de productos",
          icon: "📦",
        },
        ...categories.map((category) => ({
          title: category.name,
          href: `/productos/${category.slug || category.name.toLowerCase()}`,
          description:
            category.description ||
            `Productos de ${category.name.toLowerCase()}`,
          icon: getCategoryIcon(category.name),
        })),
      ],
    },
  ];

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50 backdrop-blur-lg bg-white/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <Image
                src="/logo.svg"
                alt="ConstruMax Logo"
                width={150}
                height={50}
                className="bg-gray-800 p-2 rounded-xl shadow-sm"
              />
            </Link>
          </div>

          {/* Center Search Bar - Prominente */}
          <div className="hidden lg:flex flex-1 max-w-2xl mx-8">
            <div className="relative w-full">
              <button
                onClick={() => setSearchOpen(true)}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-500 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all duration-200 border border-gray-200 hover:border-gray-300 focus:border-orange-300 focus:ring-2 focus:ring-orange-100 group"
              >
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 group-hover:text-orange-500 transition-colors" />
                <span className="flex-1 text-left font-medium">
                  Buscar productos, categorías...
                </span>
              </button>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-4">
            {/* Elegant Phone Number */}
            <a
              href="tel:+59897971111"
              className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-lg hover:from-orange-100 hover:to-orange-200 hover:border-orange-300 transition-all duration-200 group"
            >
              <div className="w-6 h-6 bg-gradient-to-r from-orange-500 to-orange-600 rounded-md flex items-center justify-center">
                <svg
                  className="w-3 h-3 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-gray-900 group-hover:text-orange-700 transition-colors">
                  +598 97971111
                </p>
              </div>
            </a>
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-3">
            {/* Mobile Search Button */}
            <button
              onClick={() => setSearchOpen(true)}
              className="lg:hidden p-2.5 text-gray-700 hover:text-orange-600 transition-colors rounded-xl hover:bg-orange-50"
            >
              <MagnifyingGlassIcon className="h-6 w-6" />
              <span className="sr-only">Buscar</span>
            </button>

            {/* Cart Button */}
            <Link
              href="/carrito"
              className="relative p-2.5 text-gray-700 hover:text-orange-600 transition-colors rounded-xl hover:bg-orange-50 group"
            >
              <ShoppingCartIcon className="h-6 w-6" />
              {totalItems > 0 && (
                <span
                  className={`absolute -top-1 -right-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full flex items-center justify-center font-bold shadow-lg ${
                    Math.floor(totalItems) > 99
                      ? "h-6 w-8 text-xs px-1"
                      : "h-5 w-5 text-xs"
                  }`}
                >
                  {Math.floor(totalItems) > 99 ? "99+" : Math.floor(totalItems)}
                </span>
              )}
            </Link>

            {/* Mobile Navigation Component */}
            <MobileNav navigationStructure={navigationStructure} />
          </div>
        </div>
      </div>

      {/* Search Dialog */}
      <SearchDialog open={searchOpen} setOpen={setSearchOpen} />
    </header>
  );
}
