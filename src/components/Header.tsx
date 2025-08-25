"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingCartIcon, MenuIcon } from "lucide-react";
import { useCartCount } from "@/hooks/useCartCount";
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

// Estructura de navegación con submenús
const navigationStructure = [
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
      {
        title: "Construcción",
        href: "/productos/construccion",
        description: "Materiales y herramientas para construcción",
        icon: "🏗️",
      },
      {
        title: "Metalúrgica",
        href: "/productos/metalurgica",
        description: "Productos especializados en metalurgia",
        icon: "⚙️",
      },
      {
        title: "Herramientas",
        href: "/productos/herramientas",
        description: "Herramientas profesionales y de uso general",
        icon: "🔧",
      },
      {
        title: "Herrería",
        href: "/productos/herreria",
        description: "Productos especializados para herrería",
        icon: "🔨",
      },
    ],
  },
];

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
const MobileNav = () => {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className="lg:hidden p-2 text-gray-700 hover:text-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 rounded-md hover:bg-orange-50 transition-colors">
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

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50 border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <div className="text-xl sm:text-2xl font-bold text-orange-600">
                🏗️
              </div>
              <span className="ml-2 text-lg sm:text-xl font-bold text-gray-900">
                ConstruMax
              </span>
            </Link>
          </div>

          {/* Desktop Navigation with shadcn Navigation Menu */}
          <div className="hidden lg:flex">
            <NavigationMenu>
              <NavigationMenuList>
                {navigationStructure.map((item) => (
                  <NavigationMenuItem key={item.name}>
                    {item.type === "link" ? (
                      <NavigationMenuLink
                        asChild
                        className={cn(
                          navigationMenuTriggerStyle(),
                          "text-gray-700 hover:text-orange-600 hover:bg-orange-50"
                        )}
                      >
                        <Link href={item.href!}>{item.name}</Link>
                      </NavigationMenuLink>
                    ) : (
                      <>
                        <NavigationMenuTrigger className="text-gray-700 hover:text-orange-600 hover:bg-orange-50 data-[state=open]:bg-orange-50 data-[state=open]:text-orange-600">
                          {item.name}
                        </NavigationMenuTrigger>
                        <NavigationMenuContent>
                          <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                            {item.items?.map((subItem) => (
                              <ListItem
                                key={subItem.title}
                                title={subItem.title}
                                href={subItem.href}
                              >
                                {subItem.description}
                              </ListItem>
                            ))}
                          </ul>
                        </NavigationMenuContent>
                      </>
                    )}
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Cart and Mobile menu button */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Link
              href="/carrito"
              className="relative p-2 text-gray-700 hover:text-orange-600 transition-colors rounded-md hover:bg-orange-50"
            >
              <ShoppingCartIcon className="h-6 w-6" />
              {totalItems > 0 && (
                <span
                  className={`absolute -top-1 -right-1 bg-orange-600 text-white rounded-full h-5 w-5 flex items-center justify-center ${
                    totalItems > 99 ? "text-[10px]" : "text-xs"
                  } font-medium`}
                >
                  {totalItems > 99 ? "+99" : totalItems}
                </span>
              )}
            </Link>

            {/* Mobile Navigation Component */}
            <MobileNav />
          </div>
        </div>
      </div>
    </header>
  );
}
