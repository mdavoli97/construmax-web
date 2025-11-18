"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  DollarSignIcon,
  SaveIcon,
  EditIcon,
  PlusIcon,
  TrashIcon,
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

interface PriceGroup {
  id: string;
  name: string;
  price_per_kg: number | null; // Legacy field
  currency: "USD" | "UYU" | null; // Legacy field
  category: string;
  product_count: number;
  created_at: string;
  updated_at: string;
  // New fields for multiple prices
  price_group_prices?: Array<{
    id: string;
    name: string;
    description?: string;
    price_per_kg: number;
    currency: "USD" | "UYU";
    is_active: boolean;
  }>;
  price_count?: number;
  min_price?: number;
  max_price?: number;
  main_currency?: "USD" | "UYU";
}
interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
}

export default function PreciosAdminPage() {
  const router = useRouter();
  const [priceGroups, setPriceGroups] = useState<PriceGroup[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingGroup, setEditingGroup] = useState<string | null>(null);
  const [newPrice, setNewPrice] = useState("");
  const [newCurrency, setNewCurrency] = useState<"USD" | "UYU">("USD");
  const [editThickness, setEditThickness] = useState(false);
  const [editSize, setEditSize] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newGroupForm, setNewGroupForm] = useState({
    name: "",
    description: "",
    thickness: false,
    size: false,
  });

  // Form states for new price in creation
  const [newGroupPrices, setNewGroupPrices] = useState<
    {
      name: string;
      description: string;
      price_per_kg: string;
      currency: "USD" | "UYU";
      is_active: boolean;
    }[]
  >([]);
  const [showAddPriceForm, setShowAddPriceForm] = useState(false);
  const [newPriceName, setNewPriceName] = useState("");
  const [newPriceDescription, setNewPriceDescription] = useState("");
  const [newPricePerKg, setNewPricePerKg] = useState("");
  const [newPriceCurrency, setNewPriceCurrency] = useState<"USD" | "UYU">(
    "USD"
  );

  const { success, error } = useNotifications();

  // Handle adding price to new group
  const handleAddPriceToNewGroup = () => {
    if (!newPriceName.trim() || !newPricePerKg) {
      error("Campos requeridos", "Por favor completa el nombre y precio");
      return;
    }

    // Validate unique name
    if (
      newGroupPrices.some(
        (price) =>
          price.name.toLowerCase() === newPriceName.trim().toLowerCase()
      )
    ) {
      error("Nombre duplicado", "Ya existe un precio con ese nombre");
      return;
    }

    const priceValue = parseFloat(newPricePerKg);
    if (isNaN(priceValue) || priceValue <= 0) {
      error("Precio inválido", "El precio debe ser un número mayor a 0");
      return;
    }

    const newPrice = {
      name: newPriceName.trim(),
      description: newPriceDescription.trim(),
      price_per_kg: newPricePerKg,
      currency: newPriceCurrency,
      is_active: true,
    };

    setNewGroupPrices((prev) => [...prev, newPrice]);

    // Clear form
    setNewPriceName("");
    setNewPriceDescription("");
    setNewPricePerKg("");
    setNewPriceCurrency("USD");
    setShowAddPriceForm(false);

    success("Precio agregado", `Precio "${newPrice.name}" agregado al grupo`);
  };

  const handleRemovePriceFromNewGroup = (index: number) => {
    const price = newGroupPrices[index];
    if (confirm(`¿Eliminar el precio "${price.name}"?`)) {
      setNewGroupPrices((prev) => prev.filter((_, i) => i !== index));
      success("Precio eliminado", `Precio "${price.name}" eliminado del grupo`);
    }
  };

  const categories = [
    "Chapas",
    "Hierros",
    "Aceros",
    "Caños",
    "Perfiles",
    "Alambres",
    "Mallas",
    "Electrodos",
    "Herramientas",
    "Otros",
  ];

  const currencies = [
    { value: "USD", label: "USD ($)", symbol: "$" },
    { value: "UYU", label: "UYU ($U)", symbol: "$U" },
  ];

  useEffect(() => {
    loadPriceGroups();
    loadProducts();
  }, []);

  const loadPriceGroups = async () => {
    try {
      const response = await fetch("/api/admin/price-groups");
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setPriceGroups(result.data);
        } else {
          console.error("Error loading price groups:", result.error);
          error("Error al cargar grupos", result.error);
        }
      } else {
        console.error("Error loading price groups:", response.statusText);
        error("Error al cargar grupos de precios");
      }
    } catch (err) {
      console.error("Error loading price groups:", err);
      error("Error al cargar grupos de precios");
    } finally {
      // Terminar loading después de cargar los grupos de precios
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await fetch("/api/admin/products");
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error("Error loading products:", error);
    }
  };

  const getProductMetadata = (product: Product) => {
    try {
      if (
        product.description?.startsWith("{") ||
        product.description?.startsWith("[")
      ) {
        const parsed = JSON.parse(product.description);
        return parsed.meta || parsed;
      }
      return null;
    } catch {
      return null;
    }
  };

  const getProfileProducts = () => {
    return products.filter((product) => {
      const metadata = getProductMetadata(product);
      return metadata && metadata.product_type === "perfiles";
    });
  };

  const handleUpdatePrice = async (
    groupId: string,
    newPriceValue: number,
    newCurrencyValue?: "USD" | "UYU"
  ) => {
    setSaving(true);
    try {
      const updateData: {
        price_per_kg: number;
        currency?: "USD" | "UYU";
        thickness?: boolean;
        size?: boolean;
      } = {
        price_per_kg: newPriceValue,
      };

      // Solo incluir currency si se proporcionó
      if (newCurrencyValue) {
        updateData.currency = newCurrencyValue;
      }

      // Incluir thickness y size
      updateData.thickness = editThickness;
      updateData.size = editSize;

      const response = await fetch(`/api/admin/price-groups/${groupId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Actualizar el estado local
          setPriceGroups((prev) =>
            prev.map((group) =>
              group.id === groupId
                ? {
                    ...group,
                    price_per_kg: newPriceValue,
                    currency: newCurrencyValue || group.currency,
                    thickness: editThickness,
                    size: editSize,
                    updated_at: new Date().toISOString().split("T")[0],
                  }
                : group
            )
          );

          // Mostrar mensaje específico según si se actualizaron productos
          if (
            result.data?.products_updated &&
            result.data.products_updated > 0
          ) {
            success(
              "Precio y productos actualizados",
              `Precio del grupo actualizado y ${result.data.products_updated} productos actualizados automáticamente`
            );
          } else {
            success(
              "Precio actualizado",
              "Precio del grupo actualizado exitosamente"
            );
          }

          setEditingGroup(null);
          setNewPrice("");
          setNewCurrency("USD");
          setEditThickness(false);
          setEditSize(false);

          // Recargar datos para mostrar cambios
          loadPriceGroups();
        } else {
          error("Error al actualizar", result.error);
        }
      } else {
        error("Error al actualizar el precio");
      }
    } catch (err) {
      console.error("Error updating price:", err);
      error("Error al actualizar el precio");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroupForm.name.trim()) {
      error("Campos requeridos", "Por favor completa el nombre del grupo");
      return;
    }

    if (newGroupPrices.length === 0) {
      error("Precios requeridos", "Debes agregar al menos un precio al grupo");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/admin/price-groups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newGroupForm.name.trim(),
          description: newGroupForm.description.trim(),
          thickness: newGroupForm.thickness,
          size: newGroupForm.size,
          prices: newGroupPrices.map((price) => ({
            name: price.name.trim(),
            description: price.description.trim(),
            price_per_kg: parseFloat(price.price_per_kg),
            currency: price.currency,
            is_active: price.is_active,
          })),
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Recargar la lista de grupos
          loadPriceGroups();

          // Limpiar formulario
          setNewGroupForm({
            name: "",
            description: "",
            thickness: false,
            size: false,
          });
          setNewGroupPrices([]);
          setShowCreateForm(false);
          success("Grupo creado", "Grupo de precios creado exitosamente");
        } else {
          error("Error al crear grupo", result.error);
        }
      } else {
        error("Error al crear el grupo de precios");
      }
    } catch (err) {
      console.error("Error creating price group:", err);
      error("Error al crear el grupo de precios");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteGroup = async (
    groupId: string,
    groupName: string,
    productCount: number
  ) => {
    // Verificar si el grupo tiene productos asociados
    let forceDelete = false;
    if (productCount > 0) {
      const confirmMessage = `El grupo "${groupName}" tiene ${productCount} producto${
        productCount > 1 ? "s" : ""
      } asociado${
        productCount > 1 ? "s" : ""
      }.\n\n¿Estás seguro que quieres eliminarlo? Los productos quedarán sin grupo de precios.`;
      if (!confirm(confirmMessage)) {
        return;
      }
      forceDelete = true;
    } else {
      if (
        !confirm(`¿Estás seguro que quieres eliminar el grupo "${groupName}"?`)
      ) {
        return;
      }
    }

    setSaving(true);
    try {
      const url = forceDelete
        ? `/api/admin/price-groups/${groupId}?force=true`
        : `/api/admin/price-groups/${groupId}`;

      const response = await fetch(url, {
        method: "DELETE",
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Eliminar del estado local
          setPriceGroups((prev) =>
            prev.filter((group) => group.id !== groupId)
          );
          success(
            "Grupo eliminado",
            result.message || `Grupo "${groupName}" eliminado exitosamente`
          );
        } else {
          error("Error al eliminar", result.error);
        }
      } else {
        error("Error al eliminar el grupo de precios");
      }
    } catch (err) {
      console.error("Error deleting price group:", err);
      error("Error al eliminar el grupo de precios");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <div className="space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Gestión de Precios
            </h1>
            <p className="text-gray-600 mt-2 text-sm sm:text-base">
              Administra precios por kilogramo para productos similares
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <button
              onClick={() => setShowCreateForm(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Nuevo Grupo de Precios
            </button>
          </div>
        </div>

        {/* Crear nuevo grupo */}
        {showCreateForm && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Crear Nuevo Grupo de Precios
              </h2>
              <button
                onClick={() => setShowCreateForm(false)}
                className="p-2 hover:bg-gray-100 rounded-md"
              >
                ✕
              </button>
            </div>
            <div className="p-4 sm:p-6 space-y-6">
              {/* Información básica del grupo */}
              <div>
                <h3 className="text-md font-medium text-gray-900 mb-4">
                  Información Básica
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre del Grupo *
                    </label>
                    <Input
                      type="text"
                      value={newGroupForm.name}
                      onChange={(e) =>
                        setNewGroupForm((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      placeholder="Ej: Caños Estructurales"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción
                  </label>
                  <Textarea
                    value={newGroupForm.description}
                    onChange={(e) =>
                      setNewGroupForm((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Descripción opcional del grupo de precios"
                    rows={3}
                  />
                </div>
              </div>

              {/* Configuración de campos adicionales */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-900 mb-3">
                  Configuración de Campos en Productos
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  Selecciona qué campos adicionales deben mostrarse al crear
                  productos de este grupo
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <input
                      id="thickness-checkbox"
                      type="checkbox"
                      checked={newGroupForm.thickness}
                      onChange={(e) =>
                        setNewGroupForm((prev) => ({
                          ...prev,
                          thickness: e.target.checked,
                        }))
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="thickness-checkbox"
                      className="ml-2 block text-sm text-gray-900"
                    >
                      Mostrar campo "Espesor"
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="size-checkbox"
                      type="checkbox"
                      checked={newGroupForm.size}
                      onChange={(e) =>
                        setNewGroupForm((prev) => ({
                          ...prev,
                          size: e.target.checked,
                        }))
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="size-checkbox"
                      className="ml-2 block text-sm text-gray-900"
                    >
                      Mostrar campo "Tamaño"
                    </label>
                  </div>
                </div>
              </div>

              {/* Precios del grupo */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-md font-medium text-gray-900">
                    Precios del Grupo
                  </h3>
                  <button
                    onClick={() => setShowAddPriceForm(true)}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <PlusIcon className="h-4 w-4 mr-1" />
                    Agregar Precio
                  </button>
                </div>

                {/* Lista de precios agregados */}
                {newGroupPrices.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {newGroupPrices.map((price, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                      >
                        <div>
                          <div className="font-medium text-gray-900">
                            {price.name}
                          </div>
                          <div className="text-sm text-gray-600">
                            {price.currency === "USD" ? "$" : "$U"}{" "}
                            {price.price_per_kg} por kg
                            {price.description && ` • ${price.description}`}
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemovePriceFromNewGroup(index)}
                          className="p-1 hover:bg-red-100 text-red-600 rounded"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {newGroupPrices.length === 0 && (
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                    <DollarSignIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      No hay precios agregados
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Agrega al menos un precio para crear el grupo.
                    </p>
                  </div>
                )}

                {/* Formulario para agregar precio */}
                {showAddPriceForm && (
                  <div className="border border-gray-200 rounded-lg p-4 bg-white">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-gray-900">
                        Nuevo Precio
                      </h4>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Nombre del Precio *
                        </label>
                        <Input
                          type="text"
                          value={newPriceName}
                          onChange={(e) => setNewPriceName(e.target.value)}
                          placeholder="Ej: Lista, Mayorista, Distribuidor"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Precio por Kg *
                        </label>
                        <div className="flex">
                          <Select
                            value={newPriceCurrency}
                            onValueChange={(value: "USD" | "UYU") =>
                              setNewPriceCurrency(value)
                            }
                          >
                            <SelectTrigger className="w-20">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="USD">$</SelectItem>
                              <SelectItem value="UYU">$U</SelectItem>
                            </SelectContent>
                          </Select>
                          <Input
                            type="number"
                            step="0.01"
                            value={newPricePerKg}
                            onChange={(e) => setNewPricePerKg(e.target.value)}
                            placeholder="0.00"
                            className="flex-1 ml-1"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="mt-3">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Descripción
                      </label>
                      <Textarea
                        value={newPriceDescription}
                        onChange={(e) => setNewPriceDescription(e.target.value)}
                        placeholder="Descripción opcional del precio"
                        rows={2}
                      />
                    </div>
                    <div className="flex justify-end space-x-2 mt-4">
                      <button
                        onClick={() => {
                          setShowAddPriceForm(false);
                          setNewPriceName("");
                          setNewPriceDescription("");
                          setNewPricePerKg("");
                          setNewPriceCurrency("USD");
                        }}
                        className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleAddPriceToNewGroup}
                        className="px-3 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                      >
                        Agregar Precio
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Botones de acción */}
              <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-4 border-t">
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewGroupForm({
                      name: "",
                      description: "",
                      thickness: false,
                      size: false,
                    });
                    setNewGroupPrices([]);
                    setShowAddPriceForm(false);
                  }}
                  className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateGroup}
                  disabled={saving || newGroupPrices.length === 0}
                  className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400"
                >
                  {saving ? "Creando..." : "Crear Grupo"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Lista de grupos de precios */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Grupos de Precios Actuales
            </h2>
          </div>

          {/* Vista de tabla para desktop */}
          <div className="hidden sm:block">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                      Grupo
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                      Precio por Kg
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                      Moneda
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                      Categoría
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                      Productos
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                      Última Actualización
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {priceGroups.map((group) => (
                    <tr key={group.id} className="hover:bg-gray-50">
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <DollarSignIcon className="h-5 w-5 text-green-500 mr-3" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {group.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        {editingGroup === group.id ? (
                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              step="0.01"
                              value={newPrice}
                              onChange={(e) => setNewPrice(e.target.value)}
                              className="w-20 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
                              placeholder={
                                group.price_per_kg?.toString() || "0"
                              }
                            />
                            <Select
                              value={newCurrency}
                              onValueChange={(value: "USD" | "UYU") =>
                                setNewCurrency(value)
                              }
                            >
                              <SelectTrigger className="w-20">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {currencies.map((currency) => (
                                  <SelectItem
                                    key={currency.value}
                                    value={currency.value}
                                  >
                                    {currency.value}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <button
                              onClick={() =>
                                handleUpdatePrice(
                                  group.id,
                                  parseFloat(newPrice),
                                  newCurrency
                                )
                              }
                              disabled={saving || !newPrice}
                              className="inline-flex items-center px-2 py-1 border border-transparent rounded text-xs font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400"
                            >
                              <SaveIcon className="h-3 w-3 mr-1" />
                              {saving ? "..." : "Guardar"}
                            </button>
                            <button
                              onClick={() => {
                                setEditingGroup(null);
                                setNewPrice("");
                                setNewCurrency("USD");
                                setEditThickness(false);
                                setEditSize(false);
                              }}
                              className="text-gray-600 hover:text-gray-900"
                            >
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <div className="text-sm">
                              {group.price_count && group.price_count > 0 ? (
                                <div>
                                  <span className="font-medium text-green-600">
                                    {group.price_count} precio
                                    {group.price_count !== 1 ? "s" : ""}
                                  </span>
                                  {group.min_price && group.max_price && (
                                    <div className="text-xs text-gray-500 mt-1">
                                      {group.main_currency
                                        ? `${
                                            currencies.find(
                                              (c) =>
                                                c.value === group.main_currency
                                            )?.symbol || "$"
                                          }${group.min_price.toFixed(2)} - ${
                                            currencies.find(
                                              (c) =>
                                                c.value === group.main_currency
                                            )?.symbol || "$"
                                          }${group.max_price.toFixed(2)}`
                                        : `Rango: ${group.min_price.toFixed(
                                            2
                                          )} - ${group.max_price.toFixed(2)}`}
                                    </div>
                                  )}
                                </div>
                              ) : group.price_per_kg ? (
                                <span className="text-gray-600">
                                  {currencies.find(
                                    (c) => c.value === group.currency
                                  )?.symbol || "$"}
                                  {group.price_per_kg.toFixed(2)}
                                </span>
                              ) : (
                                <span className="text-gray-400">
                                  Sin precios
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {group.main_currency || group.currency || "Múltiples"}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {group.category}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {group.product_count} productos
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(group.updated_at).toLocaleDateString("es-UY")}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() =>
                              router.push(`/admin/precios/grupo/${group.id}`)
                            }
                            className="text-blue-600 hover:text-blue-900"
                            title="Editar grupo de precios"
                          >
                            <EditIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteGroup(
                                group.id,
                                group.name,
                                group.product_count
                              )
                            }
                            className="text-red-600 hover:text-red-900"
                            title="Eliminar grupo"
                            disabled={saving}
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                          <button className="text-gray-600 hover:text-gray-900">
                            Ver Productos
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Vista de cards para mobile */}
          <div className="sm:hidden">
            <div className="divide-y divide-gray-200">
              {priceGroups.map((group) => (
                <div key={group.id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center">
                      <DollarSignIcon className="h-5 w-5 text-green-500 mr-2" />
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">
                          {group.name}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                          {group.product_count} productos •{" "}
                          {group.currency || "Múltiples monedas"}
                        </p>
                      </div>
                    </div>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {group.category}
                    </span>
                  </div>

                  <div className="mb-3">
                    {editingGroup === group.id ? (
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            step="0.01"
                            value={newPrice}
                            onChange={(e) => setNewPrice(e.target.value)}
                            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
                            placeholder={group.price_per_kg?.toString() || "0"}
                          />
                          <Select
                            value={newCurrency}
                            onValueChange={(value: "USD" | "UYU") =>
                              setNewCurrency(value)
                            }
                          >
                            <SelectTrigger className="w-20">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {currencies.map((currency) => (
                                <SelectItem
                                  key={currency.value}
                                  value={currency.value}
                                >
                                  {currency.value}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center space-x-4 mt-2">
                          <label className="flex items-center space-x-2 text-sm">
                            <input
                              type="checkbox"
                              checked={editThickness}
                              onChange={(e) =>
                                setEditThickness(e.target.checked)
                              }
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span>Espesor</span>
                          </label>
                          <label className="flex items-center space-x-2 text-sm">
                            <input
                              type="checkbox"
                              checked={editSize}
                              onChange={(e) => setEditSize(e.target.checked)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span>Tamaño</span>
                          </label>
                        </div>
                        <button
                          onClick={() =>
                            handleUpdatePrice(
                              group.id,
                              parseFloat(newPrice),
                              newCurrency
                            )
                          }
                          disabled={saving || !newPrice}
                          className="w-full inline-flex items-center justify-center px-3 py-2 border border-transparent rounded text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400"
                        >
                          <SaveIcon className="h-4 w-4 mr-2" />
                          {saving ? "Guardando..." : "Guardar Cambios"}
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-green-600">
                          {group.currency
                            ? currencies.find((c) => c.value === group.currency)
                                ?.symbol || "$"
                            : ""}
                          {group.price_count && group.price_count > 0
                            ? `${group.price_count} precio${
                                group.price_count !== 1 ? "s" : ""
                              }`
                            : group.price_per_kg
                            ? `${group.price_per_kg.toFixed(2)} ${
                                group.currency
                              }/kg`
                            : "Sin precios"}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(group.updated_at).toLocaleDateString(
                            "es-UY"
                          )}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Mostrar configuración de campos adicionales */}
                  <div className="mb-3 flex items-center space-x-4 text-sm">
                    <span className="text-gray-600">Configuración:</span>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        (group as any).thickness
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      Espesor: {(group as any).thickness ? "Sí" : "No"}
                    </span>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        (group as any).size
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      Tamaño: {(group as any).size ? "Sí" : "No"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() =>
                          router.push(`/admin/precios/grupo/${group.id}`)
                        }
                        className="text-blue-600 hover:text-blue-900"
                        title="Editar grupo de precios"
                      >
                        <EditIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() =>
                          handleDeleteGroup(
                            group.id,
                            group.name,
                            group.product_count
                          )
                        }
                        className="text-red-600 hover:text-red-900"
                        title="Eliminar grupo"
                        disabled={saving}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                    <button className="text-sm text-gray-600 hover:text-gray-900">
                      Ver Productos
                    </button>
                  </div>

                  {editingGroup === group.id && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <button
                        onClick={() => {
                          setEditingGroup(null);
                          setNewPrice("");
                          setNewCurrency("USD");
                          setEditThickness(false);
                          setEditSize(false);
                        }}
                        className="w-full px-3 py-2 text-sm text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
                      >
                        Cancelar Edición
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Información adicional */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Productos por Perfiles
            </h3>
            <div className="text-sm text-gray-600">
              <p>
                Total de productos tipo perfil:{" "}
                <span className="font-medium">
                  {getProfileProducts().length}
                </span>
              </p>
              <p className="mt-2">
                Estos productos se beneficiarán de la gestión centralizada de
                precios por kilogramo.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Cómo Funciona
            </h3>
            <div className="text-sm text-gray-600 space-y-2">
              <p>• Agrupa productos similares por precio por kg</p>
              <p>
                • Actualiza el precio de un grupo para afectar todos los
                productos
              </p>
              <p>
                • Los precios finales se calculan automáticamente: precio_kg ×
                peso_unidad
              </p>
              <p>• Ideal para caños, perfiles y productos metálicos</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
