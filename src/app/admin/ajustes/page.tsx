"use client";

import { useEffect, useState } from "react";
import { LoaderFive } from "@/components/ui/loader";
import { adminFetch } from "@/lib/admin-fetch";
import {
  DEFAULT_SITE_SETTINGS,
  mergeSettings,
  type SiteSettings,
} from "@/lib/site-settings";
import { toast } from "sonner";

export default function AjustesPage() {
  const [form, setForm] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminFetch("/api/admin/settings")
      .then((response) => (response.ok ? response.json() : null))
      .then((body) => {
        if (body?.settings) setForm(mergeSettings(body.settings));
      })
      .finally(() => setLoading(false));
  }, []);

  const setText = (key: keyof SiteSettings, value: string) => {
    setForm((current) => ({ ...current, [key]: value }) as SiteSettings);
  };
  const setNumber = (key: keyof SiteSettings, value: string) => {
    setForm(
      (current) => ({ ...current, [key]: Number(value) }) as SiteSettings
    );
  };

  const save = async () => {
    setSaving(true);
    try {
      const payload: Partial<SiteSettings> = {
        ...form,
        shippingBaseUyu: Number(form.shippingBaseUyu),
        freeShippingFromUyu: Number(form.freeShippingFromUyu),
        documentFromUyu: Number(form.documentFromUyu),
        ivaRate: Number(form.ivaRate),
      };
      delete payload.salesOpen;
      const response = await adminFetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await response.json();
      if (!response.ok || !body.success) {
        throw new Error(body.error || "No se pudieron guardar los ajustes");
      }
      setForm(mergeSettings(body.settings));
      toast.success("Ajustes guardados");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "No se pudieron guardar"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoaderFive text="Cargando ajustes..." />
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Ajustes del sitio</h1>
        <p className="text-sm text-gray-600 mt-2">
          Teléfono, WhatsApp, envío y umbrales que ve el cliente. El envío a
          domicilio usa la base más IVA. El retiro en el local no cobra envío.
        </p>
      </div>

      <div className="bg-white shadow-sm rounded-lg p-6 space-y-4">
        <Field
          label="Teléfono visible"
          value={form.phoneDisplay}
          onChange={(value) => setText("phoneDisplay", value)}
        />
        <Field
          label="WhatsApp (solo números, con código de país)"
          value={form.whatsapp}
          onChange={(value) => setText("whatsapp", value)}
        />
        <Field
          label="Email"
          value={form.email}
          onChange={(value) => setText("email", value)}
        />
        <Field
          label="Dirección"
          value={form.address}
          onChange={(value) => setText("address", value)}
        />
        <Field
          label="Horario de semana"
          value={form.hoursWeekday}
          onChange={(value) => setText("hoursWeekday", value)}
        />
        <Field
          label="Horario del sábado"
          value={form.hoursSaturday}
          onChange={(value) => setText("hoursSaturday", value)}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            label="Envío base (UYU, sin IVA)"
            value={String(form.shippingBaseUyu)}
            onChange={(value) => setNumber("shippingBaseUyu", value)}
            type="number"
          />
          <Field
            label="Envío gratis desde (UYU, con IVA)"
            value={String(form.freeShippingFromUyu)}
            onChange={(value) => setNumber("freeShippingFromUyu", value)}
            type="number"
          />
          <Field
            label="Documento obligatorio desde (UYU, con IVA)"
            value={String(form.documentFromUyu)}
            onChange={(value) => setNumber("documentFromUyu", value)}
            type="number"
          />
          <Field
            label="IVA (0.22 = 22%)"
            value={String(form.ivaRate)}
            onChange={(value) => setNumber("ivaRate", value)}
            type="number"
          />
        </div>
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="bg-orange-600 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-60"
        >
          {saving ? "Guardando..." : "Guardar ajustes"}
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="block text-sm">
      <span className="font-medium text-gray-700">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
      />
    </label>
  );
}
