"use client";

import { useEffect, useState } from "react";
import { adminFetch } from "@/lib/admin-fetch";
import { toast } from "sonner";

export default function SalesSwitch() {
  const [salesOpen, setSalesOpen] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    adminFetch("/api/admin/settings")
      .then((response) => (response.ok ? response.json() : null))
      .then((body) => {
        if (!cancelled) {
          setSalesOpen(body?.settings?.salesOpen !== false);
        }
      })
      .catch(() => {
        if (!cancelled) setSalesOpen(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const toggle = async () => {
    if (salesOpen === null || saving) return;
    const next = !salesOpen;
    const confirmed = confirm(
      next
        ? "¿Volver a abrir las ventas?"
        : "¿Cerrar las ventas? Los clientes no van a poder confirmar pedidos hasta que las abras de nuevo."
    );
    if (!confirmed) return;

    setSaving(true);
    try {
      const response = await adminFetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ salesOpen: next }),
      });
      const body = await response.json();
      if (!response.ok || !body.success) {
        throw new Error(body.error || "No se pudo cambiar el estado de las ventas");
      }
      setSalesOpen(body.settings?.salesOpen !== false);
      toast.success(next ? "Ventas abiertas" : "Ventas cerradas");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "No se pudo cambiar el estado"
      );
    } finally {
      setSaving(false);
    }
  };

  const open = salesOpen === true;

  return (
    <button
      type="button"
      role="switch"
      aria-checked={open}
      onClick={toggle}
      disabled={salesOpen === null || saving}
      className={`ml-auto inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium disabled:opacity-60 ${
        open
          ? "border-green-200 bg-green-50 text-green-800"
          : "border-red-200 bg-red-50 text-red-800"
      }`}
    >
      <span
        className={`relative h-5 w-9 rounded-full transition-colors ${
          open ? "bg-green-600" : "bg-red-600"
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
            open ? "left-4" : "left-0.5"
          }`}
        />
      </span>
      <span className="hidden sm:inline">
        {salesOpen === null
          ? "Ventas"
          : open
            ? "Ventas abiertas"
            : "Ventas cerradas"}
      </span>
    </button>
  );
}
