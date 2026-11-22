"use client";

import { useEffect, useState } from "react";
import { adminFetch } from "@/lib/admin-fetch";
import type { PromoBanner } from "@/lib/banners";
import { toast } from "sonner";
import { LoaderFive } from "@/components/ui/loader";
import { Button } from "@/components/ui/button";

export default function BannersPage() {
  const [banners, setBanners] = useState<PromoBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    adminFetch("/api/admin/banners")
      .then((response) => (response.ok ? response.json() : null))
      .then((body) => {
        if (body?.banners) setBanners(body.banners);
      })
      .finally(() => setLoading(false));
  }, []);

  const persist = async (next: PromoBanner[]) => {
    setSaving(true);
    try {
      const response = await adminFetch("/api/admin/banners", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ banners: next }),
      });
      const body = await response.json();
      if (!response.ok || !body.success) {
        throw new Error(body.error || "No se pudieron guardar los banners");
      }
      setBanners(body.banners);
      toast.success("Banners guardados");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "No se pudieron guardar"
      );
    } finally {
      setSaving(false);
    }
  };

  const upload = async (file: File) => {
    if (banners.length >= 8) {
      toast.error("Podés cargar hasta 8 fotos");
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.set("file", file);
      formData.set("preset", "banner");
      const response = await adminFetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const body = await response.json();
      if (!response.ok || !body.url) {
        throw new Error(body.error || "No se pudo subir la foto");
      }
      await persist([
        ...banners,
        {
          id: crypto.randomUUID(),
          imageUrl: body.url,
          href: "",
          alt: "Publicidad",
        },
      ]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo subir");
    } finally {
      setUploading(false);
    }
  };

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= banners.length) return;
    const next = [...banners];
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);
    setBanners(next);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoaderFive text="Cargando banners..." />
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Banner de publicidad</h1>
        <p className="mt-2 text-sm text-gray-600">
          Las fotos aparecen debajo del inicio y se van pasando solas. El enlace
          es opcional: si lo completás, la foto lleva a esa página.
        </p>
      </div>

      <label className="inline-flex cursor-pointer items-center rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white">
        {uploading ? "Subiendo..." : "Agregar foto"}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          disabled={uploading || saving || banners.length >= 8}
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (file) upload(file);
          }}
        />
      </label>

      {banners.length === 0 ? (
        <p className="text-sm text-gray-500">Todavía no hay fotos en el banner.</p>
      ) : (
        <div className="space-y-4">
          {banners.map((banner, index) => (
            <div key={banner.id} className="rounded-lg border bg-white p-4 space-y-3">
              <img
                src={banner.imageUrl}
                alt={banner.alt || "Publicidad"}
                className="h-40 w-full rounded-md object-cover"
              />
              <label className="block text-sm">
                <span className="font-medium text-gray-700">Texto alternativo</span>
                <input
                  value={banner.alt}
                  onChange={(event) =>
                    setBanners((current) =>
                      current.map((item) =>
                        item.id === banner.id
                          ? { ...item, alt: event.target.value }
                          : item
                      )
                    )
                  }
                  className="mt-1 w-full rounded-md border px-3 py-2"
                />
              </label>
              <label className="block text-sm">
                <span className="font-medium text-gray-700">
                  Enlace (opcional, por ejemplo /productos)
                </span>
                <input
                  value={banner.href}
                  onChange={(event) =>
                    setBanners((current) =>
                      current.map((item) =>
                        item.id === banner.id
                          ? { ...item, href: event.target.value }
                          : item
                      )
                    )
                  }
                  className="mt-1 w-full rounded-md border px-3 py-2"
                />
              </label>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={index === 0}
                  onClick={() => move(index, -1)}
                >
                  Subir
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={index === banners.length - 1}
                  onClick={() => move(index, 1)}
                >
                  Bajar
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() =>
                    setBanners((current) =>
                      current.filter((item) => item.id !== banner.id)
                    )
                  }
                >
                  Quitar
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Button type="button" onClick={() => persist(banners)} disabled={saving}>
        {saving ? "Guardando..." : "Guardar banners"}
      </Button>
    </div>
  );
}
