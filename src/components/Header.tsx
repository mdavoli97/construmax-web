"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingCartIcon, MenuIcon } from "lucide-react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useCartCount } from "@/hooks/useCartCount";
import SearchDialog from "@/components/SearchDialog";
import CategoriesSidebar from "@/components/CategoriesSidebar";
import UserAccountMenu from "@/components/UserAccountMenu";
import ContactanosMenu from "@/components/ContactanosMenu";
import CurrencySwitcher from "@/components/CurrencySwitcher";
import { whyChooseUs } from "@/lib/benefits";
import { cn } from "@/lib/utils";

export default function Header() {
  const totalItems = useCartCount();
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [categoriesExpanded, setCategoriesExpanded] = useState(false);
  const [showBenefitsBar, setShowBenefitsBar] = useState(false);
  const showBenefitsBarRef = useRef(false);
  const coverBottomRef = useRef(0);
  const logoRowRef = useRef<HTMLDivElement>(null);
  const searchRowRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const categoriesLeaveTimer = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  const openSearch = () => {
    setSearchOpen(true);
    requestAnimationFrame(() => searchInputRef.current?.focus());
  };

  const openCategories = () => {
    if (categoriesLeaveTimer.current) {
      clearTimeout(categoriesLeaveTimer.current);
      categoriesLeaveTimer.current = null;
    }
    setCategoriesExpanded(true);
  };

  const scheduleCloseCategories = () => {
    if (categoriesLeaveTimer.current) {
      clearTimeout(categoriesLeaveTimer.current);
    }
    categoriesLeaveTimer.current = setTimeout(
      () => setCategoriesExpanded(false),
      180
    );
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "k") {
        event.preventDefault();
        setSearchOpen(true);
        requestAnimationFrame(() => searchInputRef.current?.focus());
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Swap cuando #why-choose-us queda totalmente bajo el header (no antes)
  useEffect(() => {
    const measureCoverBottom = () => {
      const searchBottom =
        searchRowRef.current?.getBoundingClientRect().bottom ?? 0;
      const logoBottom =
        logoRowRef.current?.getBoundingClientRect().bottom ?? 0;
      // Borde inferior real del chrome con logo (search si está visible, si no logo)
      return Math.max(searchBottom, logoBottom);
    };

    const update = () => {
      const section = document.getElementById("why-choose-us");
      if (!section) {
        showBenefitsBarRef.current = false;
        setShowBenefitsBar(false);
        return;
      }

      const shown = showBenefitsBarRef.current;
      const bottom = section.getBoundingClientRect().bottom;

      // Cachear el cover mientras el logo sigue visible
      if (!shown) {
        const measured = measureCoverBottom();
        if (measured > 0) coverBottomRef.current = measured;
      }

      const cover = coverBottomRef.current || measureCoverBottom();
      // Entrar: el bloque quedó entero por encima del borde inferior del header sticky
      const enterLine = cover;
      // Salir: histéresis para no parpadear al cambiar la altura del header
      const exitLine = cover + 64;

      const next = shown ? bottom <= exitLine : bottom <= enterLine;

      if (next !== shown) {
        showBenefitsBarRef.current = next;
        setShowBenefitsBar(next);
      }
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <>
      <CategoriesSidebar
        onOpenSearch={openSearch}
        mobileOpen={mobileNavOpen}
        onMobileOpenChange={setMobileNavOpen}
        forceExpanded={categoriesExpanded}
        onDesktopHoverChange={(hovering) => {
          if (hovering) openCategories();
          else scheduleCloseCategories();
        }}
      />

      <header className="sticky top-0 z-40 bg-white lg:pl-[60px]">
        {/* ROW 1: Logo — se oculta junto con la aparición de la barra naranja */}
        <div
          ref={logoRowRef}
          className={cn(
            "relative z-[60] border-b border-gray-100 bg-white transition-all duration-300",
            showBenefitsBar
              ? "max-h-0 border-b-0 opacity-0 pointer-events-none overflow-hidden"
              : "max-h-24 opacity-100 overflow-visible"
          )}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative flex items-center justify-between h-16 lg:h-20">
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setMobileNavOpen(true)}
                  className="lg:hidden p-2 text-gray-700 hover:text-orange-600 rounded-md hover:bg-orange-50 transition-colors"
                >
                  <MenuIcon className="h-6 w-6" />
                  <span className="sr-only">Abrir menú</span>
                </button>

                <Link href="/" className="flex items-center">
                  <Image
                    src="/logo.svg"
                    alt="ConstruMax Logo"
                    width={150}
                    height={50}
                    className="bg-gray-800 p-2 rounded-xl shadow-sm w-[120px] lg:w-[150px] h-auto"
                  />
                </Link>
              </div>

              <nav className="hidden lg:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
                <Link
                  href="/productos"
                  className="px-3 py-2 text-sm font-medium text-gray-800 hover:text-orange-600 transition-colors rounded-md"
                >
                  Tienda
                </Link>
                <ContactanosMenu />
              </nav>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={openSearch}
                  className="lg:hidden p-2.5 text-gray-700 hover:text-orange-600 transition-colors rounded-xl hover:bg-orange-50"
                >
                  <MagnifyingGlassIcon className="h-6 w-6" />
                  <span className="sr-only">Buscar</span>
                </button>

                <UserAccountMenu />

                <CurrencySwitcher className="sm:hidden" />

                <Link
                  href="/carrito"
                  className="lg:hidden relative p-2.5 text-gray-700 hover:text-orange-600 transition-colors rounded-xl hover:bg-orange-50"
                >
                  <ShoppingCartIcon className="h-6 w-6" />
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-orange-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {Math.floor(totalItems) > 99
                        ? "99+"
                        : Math.floor(totalItems)}
                    </span>
                  )}
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits bar — reemplaza exactamente a #why-choose-us al ocultarse */}
        <div
          className={cn(
            "relative z-40 border-b border-orange-100 bg-orange-600 text-white overflow-hidden transition-all duration-300",
            showBenefitsBar
              ? "max-h-20 opacity-100"
              : "max-h-0 opacity-0 pointer-events-none border-b-0"
          )}
          aria-hidden={!showBenefitsBar}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ul className="flex h-16 lg:h-20 items-center justify-between gap-2 sm:gap-4 overflow-x-auto">
              {whyChooseUs.map(({ icon: Icon, title, description }) => (
                <li
                  key={title}
                  className="flex min-w-0 flex-1 items-center justify-center gap-2 px-1"
                  title={description}
                >
                  <Icon className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
                  <div className="min-w-0 text-left">
                    <p className="truncate text-xs sm:text-sm font-semibold leading-tight">
                      {title}
                    </p>
                    <p className="hidden md:block truncate text-[11px] leading-tight text-orange-100">
                      {description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ROW 2: buscador — desktop siempre; mobile si hay beneficios o se abrió la búsqueda */}
        <div
          ref={searchRowRef}
          className={cn(
            "relative border-b border-gray-100 bg-gray-50 overflow-visible",
            searchOpen ? "z-[70]" : "z-40",
            showBenefitsBar || searchOpen ? "block" : "hidden lg:block"
          )}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 lg:gap-4 h-[60px]">
              <button
                type="button"
                onClick={() => setMobileNavOpen(true)}
                className="lg:hidden shrink-0 p-2 text-gray-700 hover:text-orange-600 rounded-md"
              >
                <MenuIcon className="h-5 w-5" />
              </button>

              <button
                type="button"
                onMouseEnter={openCategories}
                onMouseLeave={scheduleCloseCategories}
                onClick={() => setCategoriesExpanded((v) => !v)}
                className={cn(
                  "hidden lg:inline-flex items-center gap-2.5 shrink-0",
                  "h-10 pl-1.5 pr-4 rounded-full",
                  "bg-white border border-gray-200 shadow-sm",
                  "text-sm font-medium text-gray-800",
                  "hover:border-orange-300 hover:shadow transition-all",
                  categoriesExpanded && "border-orange-300 shadow"
                )}
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-600 text-white">
                  <MenuIcon className="h-3.5 w-3.5" />
                </span>
                Categorías
              </button>

              <SearchDialog
                open={searchOpen}
                setOpen={setSearchOpen}
                inputRef={searchInputRef}
              />

              <CurrencySwitcher className="hidden sm:inline-flex" />

              <Link
                href="/carrito"
                className={cn(
                  "relative inline-flex items-center gap-2 shrink-0",
                  "h-10 px-2 lg:px-4 rounded-full",
                  "bg-white border border-gray-200",
                  "text-sm font-medium text-gray-800",
                  "hover:border-orange-300 hover:text-orange-600 transition-all"
                )}
              >
                <ShoppingCartIcon className="h-5 w-5" />
                <span className="hidden lg:inline">Carrito</span>
                {totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 bg-orange-600 text-white text-[11px] font-bold rounded-full flex items-center justify-center">
                    {Math.floor(totalItems) > 99
                      ? "99+"
                      : Math.floor(totalItems)}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
