"use client";

import { FormEvent, Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCustomerAuth } from "@/contexts/CustomerAuthContext";
import { getSafeNextPath } from "@/lib/safe-next-path";

function EntrarPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = getSafeNextPath(searchParams.get("next"), "/");
  const { signIn, signOut, user, loading: authLoading } = useCustomerAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const registroHref =
    nextPath !== "/"
      ? `/cuenta/registro?next=${encodeURIComponent(nextPath)}`
      : "/cuenta/registro";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await signIn({ email, password });
    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    router.push(nextPath);
  };

  if (!authLoading && user) {
    const displayName =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email;

    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-md mx-auto px-4">
          <div className="bg-white rounded-xl border border-gray-100 p-6 sm:p-8 shadow-sm text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Mi cuenta</h1>
            <p className="text-gray-600 mb-6">
              Sesión iniciada como{" "}
              <span className="font-medium text-gray-900">{displayName}</span>
            </p>
            <div className="flex flex-col gap-3">
              {nextPath !== "/" && (
                <Button asChild className="bg-orange-600 hover:bg-orange-700">
                  <Link href={nextPath}>Continuar al pago</Link>
                </Button>
              )}
              <Button
                asChild
                className={
                  nextPath !== "/"
                    ? undefined
                    : "bg-orange-600 hover:bg-orange-700"
                }
                variant={nextPath !== "/" ? "outline" : "default"}
              >
                <Link href="/productos">Ver productos</Link>
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={async () => {
                  await signOut();
                }}
              >
                Cerrar sesión
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-md mx-auto px-4">
        <div className="bg-white rounded-xl border border-gray-100 p-6 sm:p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Entrar</h1>
          <p className="text-sm text-gray-600 mb-6">
            Iniciá sesión con tu cuenta de ConstruMax.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email *
              </label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Contraseña *
              </label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white"
            >
              {loading ? "Ingresando…" : "Iniciar sesión"}
            </Button>
          </form>

          <p className="mt-6 text-sm text-center text-gray-600">
            ¿No tenés cuenta?{" "}
            <Link
              href={registroHref}
              className="font-medium text-orange-600 hover:text-orange-700"
            >
              Crear una cuenta
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function EntrarPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="max-w-md mx-auto px-4">
            <div className="bg-white rounded-xl border border-gray-100 p-6 sm:p-8 shadow-sm h-64 animate-pulse" />
          </div>
        </div>
      }
    >
      <EntrarPageContent />
    </Suspense>
  );
}
