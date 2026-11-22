"use client";

import { adminFetch } from "@/lib/admin-fetch";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Edit2, Trash2, Save, X, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { LoaderFive } from "@/components/ui/loader";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean; // Para compatibilidad, siempre será true
  created_at: string;
  updated_at: string;
}

interface EditingCategory {
  id: string;
  name: string;
  description: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Category | null>(null);
  const [moveTo, setMoveTo] = useState("");
  const [pendingCounts, setPendingCounts] = useState({
    products: 0,
    groups: 0,
  });
  const [deleting, setDeleting] = useState(false);
  const [editingData, setEditingData] = useState<EditingCategory | null>(null);
  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await adminFetch("/api/admin/categories");
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCategories(data.data);
        }
      } else {
        toast.error("Error al cargar categorías");
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Error al cargar categorías");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategory.name.trim()) {
      toast.error("El nombre de la categoría es requerido");
      return;
    }

    try {
      const response = await adminFetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCategory),
      });

      const data = await response.json();
      if (data.success) {
        setCategories([...categories, data.data]);
        setNewCategory({ name: "", description: "" });
        toast.success("Categoría creada exitosamente");
      } else {
        toast.error(data.error || "Error al crear categoría");
      }
    } catch (error) {
      console.error("Error creating category:", error);
      toast.error("Error al crear categoría");
    }
  };

  const handleEditStart = (category: Category) => {
    setEditingId(category.id);
    setEditingData({
      id: category.id,
      name: category.name,
      description: category.description || "",
    });
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditingData(null);
  };

  const handleEditSave = async () => {
    if (!editingData || !editingData.name.trim()) {
      toast.error("El nombre de la categoría es requerido");
      return;
    }

    try {
      const response = await adminFetch(`/api/admin/categories/${editingData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editingData.name,
          description: editingData.description,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setCategories(
          categories.map((cat) => (cat.id === editingData.id ? data.data : cat))
        );
        setEditingId(null);
        setEditingData(null);
        toast.success("Categoría actualizada exitosamente");
      } else {
        toast.error(data.error || "Error al actualizar categoría");
      }
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error("Error al actualizar categoría");
    }
  };

  const handleDelete = async (category: Category, destination = "") => {
    if (
      !destination &&
      !confirm(
        `¿Estás seguro de que quieres eliminar la categoría "${category.name}"?`
      )
    ) {
      return;
    }

    setDeleting(true);
    try {
      const params = new URLSearchParams();
      if (destination) {
        params.set("force", "true");
        params.set("moveTo", destination);
      }
      const query = params.toString();
      const response = await adminFetch(
        `/api/admin/categories/${category.id}${query ? `?${query}` : ""}`,
        { method: "DELETE" }
      );

      const data = await response.json();
      if (data.success) {
        setCategories(categories.filter((cat) => cat.id !== category.id));
        setPendingDelete(null);
        setMoveTo("");
        toast.success(data.message || "Categoría eliminada exitosamente");
        return;
      }

      if (data.requiresMove) {
        setPendingDelete(category);
        setPendingCounts({
          products: data.productCount || 0,
          groups: data.groupCount || 0,
        });
        setMoveTo("");
        toast("Elegí la categoría que va a recibir los productos");
        return;
      }

      if (data.groupCount && !destination) {
        const forceDelete = confirm(
          `${data.error}\n\n¿Eliminarla de todas formas? Los grupos de precios quedarán sin categoría.`
        );
        if (forceDelete) {
          const forceResponse = await adminFetch(
            `/api/admin/categories/${category.id}?force=true`,
            { method: "DELETE" }
          );
          const forceData = await forceResponse.json();
          if (forceData.success) {
            setCategories(categories.filter((cat) => cat.id !== category.id));
            toast.success(forceData.message);
          } else {
            toast.error(forceData.error || "Error al eliminar categoría");
          }
        }
        return;
      }

      toast.error(data.error || "Error al eliminar categoría");
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Error al eliminar categoría");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Gestión de Categorías</h1>
        <div className="text-center py-8">
          <LoaderFive text="Cargando categorías..." />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestión de Categorías</h1>
      </div>

      {/* Formulario para crear nueva categoría */}
      <div className="border rounded-lg p-4 space-y-4">
        <h2 className="text-lg font-semibold">Nueva Categoría</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            placeholder="Nombre de la categoría"
            value={newCategory.name}
            onChange={(e) =>
              setNewCategory({ ...newCategory, name: e.target.value })
            }
          />
          <Input
            placeholder="Descripción (opcional)"
            value={newCategory.description}
            onChange={(e) =>
              setNewCategory({ ...newCategory, description: e.target.value })
            }
          />
          <Button
            onClick={handleCreateCategory}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Crear Categoría
          </Button>
        </div>
      </div>

      {pendingDelete && (
        <div className="border border-amber-300 bg-amber-50 rounded-lg p-4 space-y-3">
          <p className="font-medium text-amber-950">
            Para eliminar «{pendingDelete.name}» hay que mover lo que tiene
            adentro
          </p>
          <p className="text-sm text-amber-900">
            Tiene {pendingCounts.products} producto
            {pendingCounts.products === 1 ? "" : "s"}
            {pendingCounts.groups > 0
              ? ` y ${pendingCounts.groups} grupo${
                  pendingCounts.groups === 1 ? "" : "s"
                } de precios`
              : ""}
            . Elegí la categoría que los va a recibir.
          </p>
          {categories.filter((cat) => cat.id !== pendingDelete.id).length ===
          0 ? (
            <p className="text-sm text-amber-900">
              Creá otra categoría antes de eliminar esta. Los productos tienen
              que quedar en alguna.
            </p>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                className="h-9 rounded-md border bg-white px-3 text-sm"
                value={moveTo}
                onChange={(e) => setMoveTo(e.target.value)}
              >
                <option value="">Elegir categoría</option>
                {categories
                  .filter((cat) => cat.id !== pendingDelete.id)
                  .map((cat) => (
                    <option key={cat.id} value={cat.slug}>
                      {cat.name}
                    </option>
                  ))}
              </select>
              <Button
                onClick={() => handleDelete(pendingDelete, moveTo)}
                disabled={!moveTo || deleting}
                variant="destructive"
              >
                Eliminar y mover
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setPendingDelete(null);
                  setMoveTo("");
                }}
                disabled={deleting}
              >
                Cancelar
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Tabla de categorías */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Nombre</th>
              <th className="px-4 py-3 text-left font-medium">Descripción</th>
              <th className="px-4 py-3 text-left font-medium">Creada</th>
              <th className="px-4 py-3 text-right font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                  No hay categorías registradas
                </td>
              </tr>
            ) : (
              categories.map((category) => (
                <tr key={category.id} className="border-t">
                  <td className="px-4 py-3">
                    {editingId === category.id ? (
                      <Input
                        value={editingData?.name || ""}
                        onChange={(e) =>
                          setEditingData((prev) =>
                            prev ? { ...prev, name: e.target.value } : null
                          )
                        }
                        className="w-full"
                      />
                    ) : (
                      <span>{category.name}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editingId === category.id ? (
                      <Input
                        value={editingData?.description || ""}
                        onChange={(e) =>
                          setEditingData((prev) =>
                            prev
                              ? { ...prev, description: e.target.value }
                              : null
                          )
                        }
                        className="w-full"
                        placeholder="Descripción opcional"
                      />
                    ) : (
                      <span>{category.description || "-"}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(category.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      {editingId === category.id ? (
                        <>
                          <Button
                            size="sm"
                            onClick={handleEditSave}
                            className="flex items-center gap-1"
                          >
                            <Save className="h-3 w-3" />
                            Guardar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleEditCancel}
                            className="flex items-center gap-1"
                          >
                            <X className="h-3 w-3" />
                            Cancelar
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditStart(category)}
                            className="flex items-center gap-1"
                          >
                            <Edit2 className="h-3 w-3" />
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(category)}
                            disabled={deleting}
                            className="flex items-center gap-1"
                          >
                            <Trash2 className="h-3 w-3" />
                            Eliminar
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Información adicional */}
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
        <div className="flex items-start">
          <AlertTriangle className="h-5 w-5 text-blue-400 mt-0.5 mr-2" />
          <div className="text-sm">
            <p className="font-medium text-blue-800">Información importante:</p>
            <ul className="mt-1 text-blue-700 space-y-1">
              <li>• Las categorías se utilizan para organizar los productos</li>
              <li>
                • Si la categoría tiene productos, hay que moverlos a otra
                antes de eliminarla
              </li>
              <li>• Los nombres de categoría deben ser únicos</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
