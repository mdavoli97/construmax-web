"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  HomeIcon,
  PackageIcon,
  UserIcon,
  LogOutIcon,
} from "lucide-react";
import { useCustomerAuth } from "@/contexts/CustomerAuthContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const NAV = [
  { href: "/cuenta", label: "Inicio", icon: HomeIcon, exact: true },
  { href: "/cuenta/pedidos", label: "Mis pedidos", icon: PackageIcon },
  { href: "/cuenta/datos", label: "Mis datos", icon: UserIcon },
];

export default function AccountShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, signOut } = useCustomerAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      const next = encodeURIComponent(pathname || "/cuenta");
      router.replace(`/cuenta/entrar?next=${next}`);
    }
  }, [loading, user, router, pathname]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-5xl mx-auto px-4">
          <div className="h-64 rounded-xl border border-gray-100 bg-white animate-pulse" />
        </div>
      </div>
    );
  }

  const displayName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split("@")[0] ||
    "Cliente";

  return (
    <div className="min-h-screen bg-gray-50 py-8 sm:py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="mb-6 sm:mb-8">
          <p className="text-sm text-gray-500 mb-1">Mi cuenta</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Hola, {displayName}
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6">
          <aside className="bg-white rounded-xl border border-gray-100 p-3 h-fit">
            <nav className="space-y-1">
              {NAV.map(({ href, label, icon: Icon, exact }) => {
                const active = exact
                  ? pathname === href
                  : pathname === href || pathname.startsWith(`${href}/`);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      active
                        ? "bg-orange-50 text-orange-700"
                        : "text-gray-700 hover:bg-gray-50"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {label}
                  </Link>
                );
              })}
            </nav>
            <div className="mt-3 pt-3 border-t border-gray-100">
              <Button
                type="button"
                variant="ghost"
                className="w-full justify-start text-gray-700 hover:text-red-600 hover:bg-red-50"
                onClick={async () => {
                  await signOut();
                  router.push("/");
                }}
              >
                <LogOutIcon className="h-4 w-4 mr-2" />
                Cerrar sesión
              </Button>
            </div>
          </aside>

          <main className="min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
