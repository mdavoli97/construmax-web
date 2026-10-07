"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { UserIcon, ZapIcon, ArrowLeftIcon } from "lucide-react";
import { useCustomerAuth } from "@/contexts/CustomerAuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Step = "choice" | "login";

interface CheckoutAuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContinue: () => void;
}

export default function CheckoutAuthModal({
  open,
  onOpenChange,
  onContinue,
}: CheckoutAuthModalProps) {
  const { signIn } = useCustomerAuth();
  const [step, setStep] = useState<Step>("choice");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setStep("choice");
      setEmail("");
      setPassword("");
      setError("");
      setSubmitting(false);
    }
  }, [open]);

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
    onOpenChange(false);
    onContinue();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white">
        {step === "choice" ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl text-gray-900">
                ¿Cómo querés comprar?
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                Elegí si preferís una cuenta o continuar sin registrarte.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-3 pt-1">
              <button
                type="button"
                onClick={() => setStep("login")}
                className={cn(
                  "flex items-start gap-3 w-full text-left rounded-xl border border-gray-200 p-4",
                  "hover:border-orange-300 hover:bg-orange-50/60 transition-colors"
                )}
              >
                <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                  <UserIcon className="h-5 w-5" />
                </span>
                <span>
                  <span className="block font-semibold text-gray-900">
                    Comprar con cuenta
                  </span>
                  <span className="mt-1 block text-sm text-gray-600">
                    Seguí el estado de tu pedido, historial de compras y datos
                    guardados para la próxima vez.
                  </span>
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onOpenChange(false);
                  onContinue();
                }}
                className={cn(
                  "flex items-start gap-3 w-full text-left rounded-xl border border-gray-200 p-4",
                  "hover:border-orange-300 hover:bg-orange-50/60 transition-colors"
                )}
              >
                <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-700">
                  <ZapIcon className="h-5 w-5" />
                </span>
                <span>
                  <span className="block font-semibold text-gray-900">
                    Comprar sin cuenta
                  </span>
                  <span className="mt-1 block text-sm text-gray-600">
                    Completá tus datos solo para este pedido.
                  </span>
                </span>
              </button>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl text-gray-900">
                Iniciar sesión
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                Entrá con tu cuenta para continuar al pago.
              </DialogDescription>
            </DialogHeader>

            <button
              type="button"
              onClick={() => {
                setStep("choice");
                setError("");
              }}
              className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-orange-600 -mt-1"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Volver
            </button>

            <form onSubmit={handleLogin} className="space-y-3">
              <div>
                <label
                  htmlFor="checkout-login-email"
                  className="block text-xs font-medium text-gray-600 mb-1"
                >
                  Email
                </label>
                <Input
                  id="checkout-login-email"
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
                  htmlFor="checkout-login-password"
                  className="block text-xs font-medium text-gray-600 mb-1"
                >
                  Contraseña
                </label>
                <Input
                  id="checkout-login-password"
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
                {submitting ? "Ingresando…" : "Continuar al pago"}
              </Button>
            </form>

            <p className="text-center text-xs text-gray-500">
              ¿No tenés cuenta?{" "}
              <Link
                href="/cuenta/registro?next=/checkout"
                className="text-orange-600 hover:underline font-medium"
                onClick={() => onOpenChange(false)}
              >
                Registrate
              </Link>
            </p>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
