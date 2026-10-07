"use client";

import { FormEvent, useEffect, useState } from "react";
import { useCustomerAuth } from "@/contexts/CustomerAuthContext";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function CuentaDatosPage() {
  const { user } = useCustomerAuth();
  const [fullName, setFullName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!user) return;
    setFullName(
      user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        ""
    );
  }, [user]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const trimmed = fullName.trim();
    if (trimmed.length < 2) {
      setError("Ingresá un nombre válido");
      return;
    }

    setSaving(true);
    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        full_name: trimmed,
        name: trimmed,
      },
    });
    setSaving(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setSuccess("Datos actualizados");
  };

  return (
    <div className="space-y-4">
      <section className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Mis datos</h2>
        <p className="text-sm text-gray-600 mb-6">
          Información de tu cuenta ConstruMax.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
          <div>
            <label
              htmlFor="account-email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <Input
              id="account-email"
              type="email"
              value={user?.email || ""}
              disabled
              className="bg-gray-50"
            />
            <p className="mt-1 text-xs text-gray-500">
              El email no se puede cambiar desde acá.
            </p>
          </div>

          <div>
            <label
              htmlFor="account-name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Nombre completo
            </label>
            <Input
              id="account-name"
              type="text"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                setSuccess("");
              }}
              placeholder="Tu nombre"
              autoComplete="name"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="text-sm text-green-600">{success}</p>}

          <Button
            type="submit"
            disabled={saving}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            {saving ? "Guardando…" : "Guardar cambios"}
          </Button>
        </form>
      </section>
    </div>
  );
}
