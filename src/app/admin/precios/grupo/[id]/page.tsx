"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { LoaderFive } from "@/components/ui/loader";
import {
  ArrowLeftIcon,
  SaveIcon,
  DollarSignIcon,
  PackageIcon,
  InfoIcon,
  PlusIcon,
  TrashIcon,
  EditIcon,
} from "lucide-react";
import { useNotifications } from "@/components/admin/NotificationProvider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface PriceGroupPrice {
  id: string;
  name: string;
  description?: string;
  price_per_kg: number;
  currency: "USD" | "UYU";
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface PriceGroup {
  id: string;
  name: string;
  description?: string;
  category: string;
  is_active: boolean;
  thickness?: boolean;
  size?: boolean;
  presentation?: boolean;
  length?: boolean;
  created_at: string;
  updated_at: string;
  products: Product[];
  price_group_prices: PriceGroupPrice[];
  product_count: number;
  avg_product_price: number;
  min_product_price: number;
  max_product_price: number;
  price_count: number;
  active_price_count: number;
  avg_group_price: number;
  min_group_price: number;
  max_group_price: number;
  main_price: number;
}

interface Product {
  id: string;
  name: string;
  price: number;
  weight_per_unit: number;
  is_available: boolean;
}

export default function EditarGrupoPrecioPage() {
  const params = useParams();
  const router = useRouter();
  const { addNotification } = useNotifications();
  const groupId = params.id as string;

  const [priceGroup, setPriceGroup] = useState<PriceGroup | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states for group info
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState<
    { slug: string; name: string }[]
  >([]);
  const [isActive, setIsActive] = useState(true);
  const [thickness, setThickness] = useState(false);
  const [size, setSize] = useState(false);
  const [presentation, setPresentation] = useState(false);
  const [length, setLength] = useState(false);

  // Form states for new price
  const [showAddPriceForm, setShowAddPriceForm] = useState(false);
  const [newPriceName, setNewPriceName] = useState("");
  const [newPriceDescription, setNewPriceDescription] = useState("");
  const [newPricePerKg, setNewPricePerKg] = useState("");
  const [newPriceCurrency, setNewPriceCurrency] = useState<"USD" | "UYU">(
    "USD"
  );

  // Form states for editing prices
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [editPriceName, setEditPriceName] = useState("");
  const [editPriceDescription, setEditPriceDescription] = useState("");
  const [editPricePerKg, setEditPricePerKg] = useState("");
  const [editPriceCurrency, setEditPriceCurrency] = useState<"USD" | "UYU">(
    "USD"
  );
  const [editPriceIsActive, setEditPriceIsActive] = useState(true);

  // Load categories
  const loadCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setCategories(
            result.data.map((cat: any) => ({
              slug: cat.slug,
              name: cat.name,
            }))
          );
        }
      }
    } catch (err) {
      console.error("Error loading categories:", err);
    }
  };

  // Load price group data
  useEffect(() => {
    if (!groupId) return;

    const fetchPriceGroup = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/admin/price-groups/${groupId}`);
        const data = await response.json();

        if (!data.success) {
          addNotification("error", "Error al cargar el grupo de precios");
          router.push("/admin/precios");
          return;
        }

        const group = data.data;
        setPriceGroup(group);
        setName(group.name);
        setDescription(group.description || "");
        setCategory(group.category || "");
        setIsActive(group.is_active);
        setThickness(group.thickness || false);
        setSize(group.size || false);
        setPresentation(group.presentation || false);
        setLength(group.length || false);
        setLength(group.length || false);
      } catch (error) {
        console.error("Error fetching price group:", error);
        addNotification("error", "Error al cargar el grupo de precios");
        router.push("/admin/precios");
      } finally {
        setLoading(false);
      }
    };

    fetchPriceGroup();
    loadCategories();
  }, [groupId, addNotification, router]);

  const handleSave = async () => {
    if (!name.trim() || !category) {
      addNotification(
        "error",
        "Por favor completa todos los campos requeridos"
      );
      return;
    }

    try {
      setSaving(true);
      const response = await fetch(`/api/admin/price-groups/${groupId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          category: category,
          is_active: isActive,
          thickness,
          size,
          presentation,
          length,
        }),
      });

      const data = await response.json();

      if (data.success) {
        addNotification("success", "Grupo de precios actualizado exitosamente");
        // Reload data
        const fetchResponse = await fetch(`/api/admin/price-groups/${groupId}`);
        const fetchData = await fetchResponse.json();
        if (fetchData.success) {
          setPriceGroup(fetchData.data);
        }
      } else {
        addNotification("error", data.error || "Error al actualizar el grupo");
      }
    } catch (error) {
      console.error("Error saving price group:", error);
      addNotification("error", "Error al actualizar el grupo de precios");
    } finally {
      setSaving(false);
    }
  };

  const formatPrice = (price: number, currency: string) => {
    return currency === "USD"
      ? `$${price.toFixed(2)}`
      : `$U ${price.toFixed(2)}`;
  };

  const handleAddPrice = async () => {
    if (!newPriceName.trim() || !newPricePerKg.trim()) {
      addNotification("error", "Por favor completa el nombre y precio");
      return;
    }

    const priceValue = parseFloat(newPricePerKg);
    if (isNaN(priceValue) || priceValue <= 0) {
      addNotification("error", "El precio debe ser un número válido mayor a 0");
      return;
    }

    try {
      setSaving(true);
      const response = await fetch(
        `/api/admin/price-groups/${groupId}/prices`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: newPriceName.trim(),
            description: newPriceDescription.trim(),
            price_per_kg: priceValue,
            currency: newPriceCurrency,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        addNotification("success", "Precio agregado exitosamente");
        // Reset form
        setNewPriceName("");
        setNewPriceDescription("");
        setNewPricePerKg("");
        setNewPriceCurrency("USD");
        setShowAddPriceForm(false);
        // Reload data
        const fetchResponse = await fetch(`/api/admin/price-groups/${groupId}`);
        const fetchData = await fetchResponse.json();
        if (fetchData.success) {
          setPriceGroup(fetchData.data);
        }
      } else {
        addNotification("error", data.error || "Error al agregar el precio");
      }
    } catch (error) {
      console.error("Error adding price:", error);
      addNotification("error", "Error al agregar el precio");
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePrice = async (priceId: string, priceName: string) => {
    if (
      !confirm(
        `¿Estás seguro de que quieres eliminar el precio "${priceName}"?`
      )
    ) {
      return;
    }

    try {
      setSaving(true);
      const response = await fetch(
        `/api/admin/price-groups/${groupId}/prices/${priceId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (data.success) {
        addNotification("success", "Precio eliminado exitosamente");
        // Reload data
        const fetchResponse = await fetch(`/api/admin/price-groups/${groupId}`);
        const fetchData = await fetchResponse.json();
        if (fetchData.success) {
          setPriceGroup(fetchData.data);
        }
      } else {
        addNotification("error", data.error || "Error al eliminar el precio");
      }
    } catch (error) {
      console.error("Error deleting price:", error);
      addNotification("error", "Error al eliminar el precio");
    } finally {
      setSaving(false);
    }
  };

  const handleEditPrice = (price: PriceGroupPrice) => {
    // Close add form if open
    setShowAddPriceForm(false);

    setEditingPriceId(price.id);
    setEditPriceName(price.name);
    setEditPriceDescription(price.description || "");
    setEditPricePerKg(price.price_per_kg.toString());
    setEditPriceCurrency(price.currency);
    setEditPriceIsActive(price.is_active);
  };

  const handleCancelEdit = () => {
    // Check if there are changes
    if (editingPriceId) {
      const originalPrice = priceGroup?.price_group_prices.find(
        (p) => p.id === editingPriceId
      );
      if (originalPrice) {
        const hasChanges =
          editPriceName !== originalPrice.name ||
          editPriceDescription !== (originalPrice.description || "") ||
          editPricePerKg !== originalPrice.price_per_kg.toString() ||
          editPriceCurrency !== originalPrice.currency ||
          editPriceIsActive !== originalPrice.is_active;

        if (
          hasChanges &&
          !confirm(
            "¿Estás seguro de cancelar? Se perderán los cambios no guardados."
          )
        ) {
          return;
        }
      }
    }

    setEditingPriceId(null);
    setEditPriceName("");
    setEditPriceDescription("");
    setEditPricePerKg("");
    setEditPriceCurrency("USD");
    setEditPriceIsActive(true);
  };

  const handleSaveEdit = async () => {
    if (!editPriceName.trim() || !editPricePerKg.trim()) {
      addNotification("error", "Por favor completa el nombre y precio");
      return;
    }

    const priceValue = parseFloat(editPricePerKg);
    if (isNaN(priceValue) || priceValue <= 0) {
      addNotification("error", "El precio debe ser un número válido mayor a 0");
      return;
    }

    try {
      setSaving(true);
      const response = await fetch(
        `/api/admin/price-groups/${groupId}/prices/${editingPriceId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: editPriceName.trim(),
            description: editPriceDescription.trim(),
            price_per_kg: priceValue,
            currency: editPriceCurrency,
            is_active: editPriceIsActive,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        addNotification("success", "Precio actualizado exitosamente");
        handleCancelEdit();
        // Reload data
        const fetchResponse = await fetch(`/api/admin/price-groups/${groupId}`);
        const fetchData = await fetchResponse.json();
        if (fetchData.success) {
          setPriceGroup(fetchData.data);
        }
      } else {
        addNotification("error", data.error || "Error al actualizar el precio");
      }
    } catch (error) {
      console.error("Error updating price:", error);
      addNotification("error", "Error al actualizar el precio");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoaderFive text="Cargando grupo de precio..." />
      </div>
    );
  }

  if (!priceGroup) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Grupo de precios no encontrado
          </h2>
          <button
            onClick={() => router.push("/admin/precios")}
            className="text-blue-600 hover:text-blue-800"
          >
            Volver a la lista
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push("/admin/precios")}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Volver a Grupos de Precios
            </button>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <SaveIcon className="h-4 w-4 mr-2" />
            {saving ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mt-4">
          Editar Grupo de Precios: {priceGroup.name}
        </h1>
        <p className="text-gray-600 mt-1">
          Creado el{" "}
          {new Date(priceGroup.created_at).toLocaleDateString("es-ES")}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <InfoIcon className="h-5 w-5 mr-2" />
              Información Básica
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Grupo *
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nombre del grupo de precios"
                  disabled={saving}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoría *
                </label>
                <Select
                  value={category}
                  onValueChange={(value) => setCategory(value)}
                  disabled={saving}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.slug} value={cat.slug}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descripción opcional del grupo"
                  rows={3}
                  disabled={saving}
                />
              </div>

              {/* Checkboxes */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    disabled={saving}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="isActive"
                    className="text-sm font-medium text-gray-700"
                  >
                    Grupo activo
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="thickness"
                    checked={thickness}
                    onChange={(e) => setThickness(e.target.checked)}
                    disabled={saving}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="thickness"
                    className="text-sm font-medium text-gray-700"
                  >
                    Requiere espesor
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="size"
                    checked={size}
                    onChange={(e) => setSize(e.target.checked)}
                    disabled={saving}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="size"
                    className="text-sm font-medium text-gray-700"
                  >
                    Requiere tamaño
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="presentation"
                    checked={presentation}
                    onChange={(e) => setPresentation(e.target.checked)}
                    disabled={saving}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="presentation"
                    className="text-sm font-medium text-gray-700"
                  >
                    Requiere presentación
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="length"
                    checked={length}
                    onChange={(e) => setLength(e.target.checked)}
                    disabled={saving}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="length"
                    className="text-sm font-medium text-gray-700"
                  >
                    Requiere largo
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Price Management Section */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <DollarSignIcon className="h-5 w-5 mr-2" />
                Precios del Grupo
                {editingPriceId && (
                  <span className="ml-2 text-sm text-blue-600 font-normal">
                    (editando...)
                  </span>
                )}
              </h2>
              <button
                onClick={() => setShowAddPriceForm(true)}
                disabled={saving || editingPriceId !== null}
                className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Agregar Precio
              </button>
            </div>

            {/* Existing Prices List */}
            {priceGroup &&
            priceGroup.price_group_prices &&
            priceGroup.price_group_prices.length > 0 ? (
              <div className="space-y-3">
                {priceGroup.price_group_prices.map((price) => (
                  <div
                    key={price.id}
                    className={`p-4 rounded-lg border ${
                      editingPriceId === price.id
                        ? "bg-blue-50 border-blue-200"
                        : "bg-gray-50"
                    }`}
                  >
                    {editingPriceId === price.id ? (
                      // Edit Mode
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Nombre del Precio
                            </label>
                            <Input
                              value={editPriceName}
                              onChange={(e) => setEditPriceName(e.target.value)}
                              placeholder="Nombre del precio"
                              disabled={saving}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Precio por Kg
                            </label>
                            <Input
                              type="number"
                              step="0.01"
                              value={editPricePerKg}
                              onChange={(e) =>
                                setEditPricePerKg(e.target.value)
                              }
                              placeholder="0.00"
                              disabled={saving}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Moneda
                            </label>
                            <Select
                              value={editPriceCurrency}
                              onValueChange={(value: "USD" | "UYU") =>
                                setEditPriceCurrency(value)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="USD">
                                  USD (Dólares)
                                </SelectItem>
                                <SelectItem value="UYU">
                                  UYU (Pesos Uruguayos)
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex items-end">
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id="editIsActive"
                                checked={editPriceIsActive}
                                onChange={(e) =>
                                  setEditPriceIsActive(e.target.checked)
                                }
                                disabled={saving}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <label
                                htmlFor="editIsActive"
                                className="text-sm text-gray-700"
                              >
                                Precio activo
                              </label>
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Descripción
                          </label>
                          <Textarea
                            value={editPriceDescription}
                            onChange={(e) =>
                              setEditPriceDescription(e.target.value)
                            }
                            placeholder="Descripción del precio"
                            rows={2}
                            disabled={saving}
                          />
                        </div>

                        <div className="flex justify-end space-x-3">
                          <button
                            onClick={handleCancelEdit}
                            disabled={saving}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={handleSaveEdit}
                            disabled={saving}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                          >
                            {saving ? "Guardando..." : "Guardar Cambios"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      // View Mode
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <h4 className="font-medium text-gray-900">
                              {price.name}
                            </h4>
                            <span className="text-lg font-semibold text-blue-600">
                              {formatPrice(price.price_per_kg, price.currency)}
                            </span>
                            <span className="text-xs text-gray-500">
                              per kg
                            </span>
                            {!price.is_active && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Inactivo
                              </span>
                            )}
                          </div>
                          {price.description && (
                            <p className="text-sm text-gray-600 mt-1">
                              {price.description}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            Creado el{" "}
                            {new Date(price.created_at).toLocaleDateString(
                              "es-ES"
                            )}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditPrice(price)}
                            disabled={saving || editingPriceId !== null}
                            className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                            title="Editar precio"
                          >
                            <EditIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() =>
                              handleDeletePrice(price.id, price.name)
                            }
                            disabled={saving || editingPriceId !== null}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50"
                            title="Eliminar precio"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <DollarSignIcon className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p className="text-sm">No hay precios configurados</p>
                <p className="text-xs">
                  Agrega el primer precio para este grupo
                </p>
              </div>
            )}

            {/* Add Price Form */}
            {showAddPriceForm && editingPriceId === null && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-gray-900">
                    Agregar Nuevo Precio
                  </h3>
                  <button
                    onClick={() => {
                      setShowAddPriceForm(false);
                      setNewPriceName("");
                      setNewPriceDescription("");
                      setNewPricePerKg("");
                      setNewPriceCurrency("USD");
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre del Precio *
                    </label>
                    <Input
                      value={newPriceName}
                      onChange={(e) => setNewPriceName(e.target.value)}
                      placeholder="ej: Precio Mayorista, Precio Especial"
                      disabled={saving}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descripción
                    </label>
                    <Textarea
                      value={newPriceDescription}
                      onChange={(e) => setNewPriceDescription(e.target.value)}
                      placeholder="Descripción opcional del precio"
                      rows={2}
                      disabled={saving}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Precio por Kg *
                      </label>
                      <Input
                        type="number"
                        step="0.01"
                        value={newPricePerKg}
                        onChange={(e) => setNewPricePerKg(e.target.value)}
                        placeholder="0.00"
                        disabled={saving}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Moneda *
                      </label>
                      <Select
                        value={newPriceCurrency}
                        onValueChange={(value: "USD" | "UYU") =>
                          setNewPriceCurrency(value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD (Dólares)</SelectItem>
                          <SelectItem value="UYU">
                            UYU (Pesos Uruguayos)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => {
                        setShowAddPriceForm(false);
                        setNewPriceName("");
                        setNewPriceDescription("");
                        setNewPricePerKg("");
                        setNewPriceCurrency("USD");
                      }}
                      disabled={saving}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleAddPrice}
                      disabled={saving}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      {saving ? "Guardando..." : "Agregar Precio"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Statistics and Products Sidebar */}
        <div className="space-y-6">
          {/* Statistics */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <DollarSignIcon className="h-5 w-5 mr-2" />
              Estadísticas
            </h3>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-gray-600">
                  Precios configurados
                </div>
                <div className="text-xl font-semibold text-gray-900">
                  {priceGroup.price_count || 0}
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-600">Precios activos</div>
                <div className="text-lg font-semibold text-green-600">
                  {priceGroup.active_price_count || 0}
                </div>
              </div>

              {priceGroup.price_count > 0 && (
                <>
                  <div>
                    <div className="text-sm text-gray-600">
                      Precio principal
                    </div>
                    <div className="text-lg font-medium text-blue-600">
                      {formatPrice(priceGroup.main_price || 0, "USD")}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600">
                      Rango de precios
                    </div>
                    <div className="text-sm text-gray-900">
                      {formatPrice(priceGroup.min_group_price || 0, "USD")} -{" "}
                      {formatPrice(priceGroup.max_group_price || 0, "USD")}
                    </div>
                  </div>
                </>
              )}

              <div className="border-t pt-3 mt-3">
                <div className="text-sm text-gray-600">Productos asociados</div>
                <div className="text-xl font-semibold text-gray-900">
                  {priceGroup.product_count}
                </div>
              </div>

              {priceGroup.product_count > 0 && (
                <>
                  <div>
                    <div className="text-sm text-gray-600">Precio promedio</div>
                    <div className="text-lg font-medium text-gray-900">
                      {formatPrice(priceGroup.avg_product_price, "USD")}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600">
                      Rango de precios
                    </div>
                    <div className="text-sm text-gray-900">
                      {formatPrice(priceGroup.min_product_price, "USD")} -{" "}
                      {formatPrice(priceGroup.max_product_price, "USD")}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Products List */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <PackageIcon className="h-5 w-5 mr-2" />
              Productos ({priceGroup.product_count})
            </h3>

            {priceGroup.products && priceGroup.products.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {priceGroup.products.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {product.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatPrice(product.price, "USD")} •{" "}
                        {product.weight_per_unit}kg
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {product.is_available ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Disponible
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          No disponible
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                <PackageIcon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">No hay productos asociados</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
