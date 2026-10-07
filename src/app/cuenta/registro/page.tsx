"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCustomerAuth } from "@/contexts/CustomerAuthContext";
import { getSafeNextPath } from "@/lib/safe-next-path";

function RegistroPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = getSafeNextPath(searchParams.get("next"), "/cuenta");
  const { signUp, user, loading: authLoading } = useCustomerAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const entrarHref =
    nextPath !== "/cuenta"
      ? `/cuenta/entrar?next=${encodeURIComponent(nextPath)}`
      : "/cuenta/entrar";

  useEffect(() => {
    if (!authLoading && user) {
      router.replace(nextPath);
    }
  }, [authLoading, user, router, nextPath]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    if (password !== confirm) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);
    const result = await signUp({ email, password, fullName });
    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setSuccess(
      "Cuenta creada. Si tu email requiere confirmación, revisá tu bandeja. Ya podés iniciar sesión."
    );
    setTimeout(() => router.push(entrarHref), 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-md mx-auto px-4">
        <div className="bg-white rounded-xl border border-gray-100 p-6 sm:p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Crear una cuenta
          </h1>
          <p className="text-sm text-gray-600 mb-6">
            Registrate para agilizar tus compras en ConstruMax.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nombre completo *
              </label>
              <Input
                id="fullName"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Tu nombre"
              />
            </div>
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
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
              />
            </div>
            <div>
              <label
                htmlFor="confirm"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Confirmar contraseña *
              </label>
              <Input
                id="confirm"
                type="password"
                required
                minLength={6}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}
            {success && <p className="text-sm text-green-700">{success}</p>}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white"
            >
              {loading ? "Creando cuenta…" : "Crear cuenta"}
            </Button>
          </form>

          <p className="mt-6 text-sm text-center text-gray-600">
            ¿Ya tenés cuenta?{" "}
            <Link
              href={entrarHref}
              className="font-medium text-orange-600 hover:text-orange-700"
            >
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegistroPage() {
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
      <RegistroPageContent />
    </Suspense>
  );
}
