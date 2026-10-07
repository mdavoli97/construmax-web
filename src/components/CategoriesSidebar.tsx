"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ChevronRight,
  MenuIcon,
  Package,
  Hammer,
  Wrench,
  Anvil,
  Home,
  Layers,
  Search,
  Phone,
  type LucideIcon,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface Category {
  id: number | string;
  name: string;
  description: string | null;
  slug?: string;
  icon?: string | null;
  is_active: boolean;
}

interface PriceGroup {
  id: string;
  name: string;
  description?: string;
  category?: string;
}

interface CategoriesSidebarProps {
  onOpenSearch: () => void;
  /** Controlled mobile sheet */
  mobileOpen?: boolean;
  onMobileOpenChange?: (open: boolean) => void;
  /** Force expanded width (from Categorías button) */
  forceExpanded?: boolean;
  onDesktopHoverChange?: (hovering: boolean) => void;
}

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  construccion: Layers,
  construcción: Layers,
  metalurgica: Anvil,
  metalúrgica: Anvil,
  herramientas: Hammer,
  herreria: Wrench,
  herrería: Wrench,
  hogar: Home,
  plomeria: Wrench,
  plomería: Wrench,
};

function getCategoryIcon(category: Category): LucideIcon {
  const key = (category.slug || category.name).toLowerCase();
  return CATEGORY_ICONS[key] || Package;
}

function getSlug(category: Category) {
  return category.slug || category.name.toLowerCase().replace(/\s+/g, "-");
}

export default function CategoriesSidebar({
  onOpenSearch,
  mobileOpen = false,
  onMobileOpenChange,
  forceExpanded = false,
  onDesktopHoverChange,
}: CategoriesSidebarProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [priceGroups, setPriceGroups] = useState<PriceGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);
  const [flyoutTop, setFlyoutTop] = useState(64);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [expandedMobile, setExpandedMobile] = useState<Record<string, boolean>>(
    {}
  );

  const keepHover = (slug: string, top?: number) => {
    if (leaveTimer.current) {
      clearTimeout(leaveTimer.current);
      leaveTimer.current = null;
    }
    setHoveredSlug(slug);
    if (typeof top === "number") setFlyoutTop(top);
  };

  const scheduleClearHover = () => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
    leaveTimer.current = setTimeout(() => setHoveredSlug(null), 120);
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [catRes, pgRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/price-groups"),
        ]);
        const [catData, pgData] = await Promise.all([
          catRes.json(),
          pgRes.json(),
        ]);

        if (catData.success) {
          setCategories(
            (catData.data || []).filter((c: Category) => c.is_active !== false)
          );
        }
        if (pgData.success) {
          setPriceGroups(pgData.data || []);
        }
      } catch (error) {
        console.error("Error loading categories sidebar:", error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const groupsForCategory = (slug: string) =>
    priceGroups.filter(
      (pg) => (pg.category || "").toLowerCase() === slug.toLowerCase()
    );

  const navItemClass =
    "flex items-center h-11 w-full text-gray-700 hover:text-orange-600 hover:bg-orange-50 transition-colors overflow-hidden";
  const iconColClass =
    "flex w-[60px] shrink-0 items-center justify-center";
  const labelClass = cn(
    "text-sm font-medium whitespace-nowrap overflow-hidden transition-all duration-300 delay-75",
    forceExpanded
      ? "opacity-100 max-w-[160px]"
      : "opacity-0 max-w-0 group-hover/nav:opacity-100 group-hover/nav:max-w-[160px]"
  );

  /* ---------- Desktop sticky nav (Barraca Julia style) ---------- */
  const desktopNav = (
    <aside
      className={cn(
        "hidden lg:flex fixed inset-y-0 left-0 z-[45] flex-col",
        "w-[60px] hover:w-[275px] group/nav",
        forceExpanded && "w-[275px]",
        "bg-white border-r border-gray-200/80 shadow-sm",
        "transition-[width] duration-500 ease-[cubic-bezier(0.19,1,0.22,1)]",
        "overflow-x-hidden overflow-y-hidden"
      )}
      onMouseEnter={() => {
        if (leaveTimer.current) {
          clearTimeout(leaveTimer.current);
          leaveTimer.current = null;
        }
        onDesktopHoverChange?.(true);
      }}
      onMouseLeave={() => {
        scheduleClearHover();
        onDesktopHoverChange?.(false);
      }}
    >
      {/* Header / Categorías title */}
      <div className="flex items-center h-16 border-b border-gray-100 flex-shrink-0 overflow-hidden w-full">
        <div className={iconColClass}>
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-600 text-white">
            <MenuIcon className="h-4 w-4" />
          </span>
        </div>
        <span className={cn(labelClass, "font-semibold text-gray-900")}>
          Categorías
        </span>
      </div>

      {/* Category list — only vertical scroll */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-2 overscroll-contain">
        {loading ? (
          <div className="flex justify-center py-3 text-xs text-gray-400">
            <span className="opacity-0 group-hover/nav:opacity-100">
              Cargando…
            </span>
          </div>
        ) : (
          <ul className="w-full">
            <li>
              <Link href="/productos" className={navItemClass}>
                <span className={iconColClass}>
                  <Package className="h-[18px] w-[18px]" />
                </span>
                <span className={labelClass}>Todos los productos</span>
              </Link>
            </li>

            {categories.map((category) => {
              const slug = getSlug(category);
              const Icon = getCategoryIcon(category);
              const groups = groupsForCategory(slug);
              const showFlyout = hoveredSlug === slug && groups.length > 0;

              return (
                <li
                  key={category.id}
                  className="relative"
                  onMouseEnter={(e) => {
                    keepHover(
                      slug,
                      e.currentTarget.getBoundingClientRect().top
                    );
                  }}
                >
                  <Link href={`/productos/${slug}`} className={navItemClass}>
                    <span className={iconColClass}>
                      <Icon className="h-[18px] w-[18px]" />
                    </span>
                    <span className={cn(labelClass, "flex-1")}>
                      {category.name}
                    </span>
                    {groups.length > 0 && (
                      <ChevronRight
                        className={cn(
                          "h-3.5 w-3.5 shrink-0 text-gray-400 mr-3",
                          "transition-opacity duration-300 delay-75",
                          forceExpanded
                            ? "opacity-100"
                            : "opacity-0 group-hover/nav:opacity-100"
                        )}
                      />
                    )}
                  </Link>

                  {/* Flyout fixed para no generar scroll horizontal */}
                  {showFlyout && (
                    <div
                      className={cn(
                        "fixed left-[275px] z-[46]",
                        "w-[240px] max-h-[70vh] overflow-y-auto overflow-x-hidden",
                        "bg-white border border-gray-200 shadow-lg rounded-r-lg py-2"
                      )}
                      style={{ top: flyoutTop }}
                      onMouseEnter={() => keepHover(slug)}
                      onMouseLeave={scheduleClearHover}
                    >
                      <p className="px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400">
                        {category.name}
                      </p>
                      <ul>
                        {groups.map((group) => (
                          <li key={group.id}>
                            <Link
                              href={`/productos/${slug}/${group.id}`}
                              className="block px-4 py-2 text-sm text-gray-700 hover:text-orange-600 hover:bg-orange-50 transition-colors"
                            >
                              {group.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </nav>

      {/* Bottom search CTA — only visible when expanded */}
      <div
        className={cn(
          "flex-shrink-0 border-t border-gray-100 overflow-hidden",
          "transition-all duration-300 delay-100",
          forceExpanded
            ? "h-auto opacity-100 pointer-events-auto p-3"
            : "h-0 opacity-0 pointer-events-none p-0 group-hover/nav:h-auto group-hover/nav:opacity-100 group-hover/nav:pointer-events-auto group-hover/nav:p-3"
        )}
      >
        <p className="text-xs font-medium text-gray-900 mb-0.5 truncate">
          ¿No encontraste lo que buscás?
        </p>
        <button
          type="button"
          onClick={onOpenSearch}
          className="mt-2 w-full flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white py-2 px-3 rounded-lg text-xs font-medium transition-colors"
        >
          <Search className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">Buscar productos</span>
        </button>
      </div>
    </aside>
  );

  /* ---------- Mobile sheet ---------- */
  const mobileSheet = (
    <Sheet open={mobileOpen} onOpenChange={onMobileOpenChange}>
      <SheetContent
        side="left"
        className="w-[320px] sm:w-[380px] p-0 flex flex-col h-full lg:hidden"
      >
        <SheetHeader className="p-5 border-b flex-shrink-0">
          <SheetTitle className="text-left text-base font-semibold">
            Categorías
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-6 text-sm text-gray-500">Cargando…</div>
          ) : (
            <nav className="py-2">
              <Link
                href="/productos"
                onClick={() => onMobileOpenChange?.(false)}
                className="flex items-center gap-3 px-5 py-3 text-sm font-medium text-gray-800 hover:bg-orange-50 hover:text-orange-600"
              >
                <Package className="h-4 w-4" />
                Todos los productos
              </Link>

              {categories.map((category) => {
                const slug = getSlug(category);
                const Icon = getCategoryIcon(category);
                const groups = groupsForCategory(slug);
                const isOpen = !!expandedMobile[slug];

                return (
                  <div key={category.id} className="border-t border-gray-50">
                    <div className="flex items-stretch">
                      <Link
                        href={`/productos/${slug}`}
                        onClick={() => onMobileOpenChange?.(false)}
                        className="flex-1 flex items-center gap-3 px-5 py-3 text-sm font-medium text-gray-800 hover:bg-orange-50 hover:text-orange-600"
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        {category.name}
                      </Link>
                      {groups.length > 0 && (
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedMobile((prev) => ({
                              ...prev,
                              [slug]: !prev[slug],
                            }))
                          }
                          className="px-4 text-gray-500 hover:text-orange-600"
                          aria-expanded={isOpen}
                        >
                          <ChevronRight
                            className={cn(
                              "h-4 w-4 transition-transform",
                              isOpen && "rotate-90"
                            )}
                          />
                        </button>
                      )}
                    </div>
                    {isOpen &&
                      groups.map((group) => (
                        <Link
                          key={group.id}
                          href={`/productos/${slug}/${group.id}`}
                          onClick={() => onMobileOpenChange?.(false)}
                          className="block pl-12 pr-5 py-2.5 text-sm text-gray-600 hover:text-orange-600 hover:bg-orange-50"
                        >
                          {group.name}
                        </Link>
                      ))}
                  </div>
                );
              })}

              <div className="border-t border-gray-100 mt-2 pt-2">
                <Link
                  href="/contacto"
                  onClick={() => onMobileOpenChange?.(false)}
                  className="flex items-center gap-3 px-5 py-3 text-sm font-medium text-gray-800 hover:bg-orange-50 hover:text-orange-600"
                >
                  <Phone className="h-4 w-4" />
                  Contáctanos
                </Link>
              </div>
            </nav>
          )}
        </div>

        <div className="p-4 border-t bg-orange-50 flex-shrink-0">
          <button
            type="button"
            onClick={() => {
              onMobileOpenChange?.(false);
              setTimeout(onOpenSearch, 150);
            }}
            className="w-full flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white py-2.5 px-4 rounded-lg text-sm font-medium"
          >
            <Search className="h-4 w-4" />
            Buscar productos
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );

  return (
    <>
      {desktopNav}
      {mobileSheet}
    </>
  );
}
