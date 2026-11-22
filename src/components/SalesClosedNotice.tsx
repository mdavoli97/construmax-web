"use client";

import { SALES_CLOSED_MESSAGE } from "@/lib/site-settings";
import { useSiteSettings } from "@/lib/use-site-settings";

export default function SalesClosedNotice() {
  const settings = useSiteSettings();
  if (settings.salesOpen) return null;

  const phone = (settings.whatsapp || "").replace(/\D/g, "");
  const whatsappUrl = phone
    ? `https://wa.me/${phone}?text=${encodeURIComponent(
        "Hola, vi que la web está en mantenimiento y quiero hacer un pedido."
      )}`
    : null;

  return (
    <div className="border-b border-amber-300 bg-amber-50 lg:pl-[60px]">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-amber-950">
          <p className="font-semibold">Sitio en mantenimiento</p>
          <p className="mt-1">{SALES_CLOSED_MESSAGE}</p>
        </div>
        {whatsappUrl && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center justify-center rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
          >
            Escribir por WhatsApp
          </a>
        )}
      </div>
    </div>
  );
}
