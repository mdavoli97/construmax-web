"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { UserIcon, LogOutIcon } from "lucide-react";
import { useCustomerAuth } from "@/contexts/CustomerAuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface UserAccountMenuProps {
  className?: string;
  iconOnly?: boolean;
}

export default function UserAccountMenu({
  className,
  iconOnly = true,
}: UserAccountMenuProps) {
  const { user, loading, signIn, signOut } = useCustomerAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    null;

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const result = await signIn({ email, password });
    setSubmitting(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setEmail("");
    setPassword("");
  };

  if (loading) {
    return (
      <div
        className={cn(
          "p-2.5 rounded-xl",
          iconOnly ? "w-10 h-10" : "h-9 w-20",
          className
        )}
      />
    );
  }

  return (
    <div className={cn("relative z-[70] group/user", className)}>
      <button
        type="button"
        className={cn(
          "flex items-center gap-2 p-2.5 text-gray-700 hover:text-orange-600 transition-colors rounded-xl hover:bg-orange-50",
          !iconOnly && "px-3"
        )}
        title="Mi cuenta"
        aria-haspopup="true"
      >
        <UserIcon className="h-6 w-6" />
        {!iconOnly && (
          <span className="text-sm font-medium">
            {user ? displayName : "Cuenta"}
          </span>
        )}
      </button>

      {/* Hover dropdown por encima del resto del header */}
      <div
        className={cn(
          "absolute right-0 top-full z-[80] pt-2",
          "opacity-0 invisible translate-y-1 pointer-events-none",
          "group-hover/user:opacity-100 group-hover/user:visible group-hover/user:translate-y-0 group-hover/user:pointer-events-auto",
          "group-focus-within/user:opacity-100 group-focus-within/user:visible group-focus-within/user:translate-y-0 group-focus-within/user:pointer-events-auto",
          "transition-all duration-200 ease-out"
        )}
      >
        <div className="w-[300px] bg-white border border-gray-200 shadow-2xl rounded-xl overflow-hidden">
          {user ? (
            <div className="p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">
                Mi cuenta
              </p>
              <p className="text-sm font-medium text-gray-900 truncate mb-1">
                {displayName}
              </p>
              <p className="text-xs text-gray-500 truncate mb-4">{user.email}</p>
              <div className="space-y-2">
                <Link
                  href="/cuenta"
                  className="block w-full text-center text-sm font-medium text-orange-600 hover:text-orange-700 border border-orange-200 hover:bg-orange-50 py-2 px-3 rounded-lg transition-colors"
                >
                  Ver cuenta
                </Link>
                <button
                  type="button"
                  onClick={() => signOut()}
                  className="flex items-center justify-center gap-2 w-full text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 py-2 px-3 rounded-lg transition-colors"
                >
                  <LogOutIcon className="h-4 w-4" />
                  Cerrar sesión
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-base font-semibold text-gray-900">
                  Entrar
                </span>
                <Link
                  href="/cuenta/registro"
                  className="text-sm font-medium text-orange-600 hover:text-orange-700 hover:underline"
                >
                  Crear una cuenta
                </Link>
              </div>

              <form onSubmit={handleLogin} className="space-y-3">
                <div>
                  <label
                    htmlFor="nav-login-email"
                    className="block text-xs font-medium text-gray-600 mb-1"
                  >
                    Email
                  </label>
                  <Input
                    id="nav-login-email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    className="h-9 bg-white"
                  />
                </div>
                <div>
                  <label
                    htmlFor="nav-login-password"
                    className="block text-xs font-medium text-gray-600 mb-1"
                  >
                    Contraseña
                  </label>
                  <Input
                    id="nav-login-password"
                    type="password"
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-9 bg-white"
                  />
                </div>

                {error && <p className="text-xs text-red-600">{error}</p>}

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                >
                  {submitting ? "Ingresando…" : "Iniciar sesión"}
                </Button>
              </form>

              <p className="mt-3 text-center text-xs text-gray-500">
                ¿No tenés cuenta?{" "}
                <Link
                  href="/cuenta/registro"
                  className="text-orange-600 hover:underline font-medium"
                >
                  Registrate
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
