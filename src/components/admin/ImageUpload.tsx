"use client";

import { useState, useRef, useCallback } from "react";
import { ProductImage } from "@/types";
import ProductImageComponent from "../ProductImage";
import {
  CloudArrowUpIcon,
  PhotoIcon,
  XMarkIcon,
  StarIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import { useNotifications } from "./NotificationProvider";

interface ImageUploadProps {
  productId: string;
  images: ProductImage[];
  onImagesChange: (images: ProductImage[]) => void;
  maxImages?: number;
  maxFileSize?: number; // MB
}

interface UploadingFile {
  file: File;
  progress: number;
  status: "uploading" | "success" | "error";
  error?: string;
  url?: string;
}

export default function ImageUpload({
  productId,
  images,
  onImagesChange,
  maxImages = 10,
  maxFileSize = 5,
}: ImageUploadProps) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [manualUrl, setManualUrl] = useState("");
  const [isAddingUrl, setIsAddingUrl] = useState(false);
  const [editingImage, setEditingImage] = useState<string | null>(null);
  const [editAltText, setEditAltText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { success, error } = useNotifications();

  // Función para subir archivo a Cloudinary
  const uploadFileToCloudinary = async (
    file: File,
    onProgress: (progress: number) => void
  ): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const xhr = new XMLHttpRequest();

    return new Promise((resolve, reject) => {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = (event.loaded / event.total) * 100;
          onProgress(progress);
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          resolve(response.url);
        } else {
          const error = JSON.parse(xhr.responseText);
          reject(new Error(error.error || "Error al subir imagen"));
        }
      };

      xhr.onerror = () => reject(new Error("Error de conexión"));

      xhr.open("POST", "/api/upload");
      xhr.send(formData);
    });
  };

  // Validar archivos
  const validateFile = (file: File): string | null => {
    if (!file.type.startsWith("image/")) {
      return "El archivo debe ser una imagen";
    }
    if (file.size > maxFileSize * 1024 * 1024) {
      return `El archivo es muy grande. Máximo ${maxFileSize}MB`;
    }
    return null;
  };

  // Validar URL
  const validateImageUrl = (url: string): string | null => {
    if (!url.trim()) return "La URL es requerida";
    if (url.length > 1000)
      return "La URL es demasiado larga (máximo 1000 caracteres)";

    try {
      new URL(url);
      return null;
    } catch {
      return "La URL no es válida";
    }
  };

  // Manejar archivos seleccionados
  const handleFiles = useCallback(
    async (files: FileList) => {
      const fileArray = Array.from(files);

      // Validar cantidad máxima
      if (
        images.length + uploadingFiles.length + fileArray.length >
        maxImages
      ) {
        error("Límite excedido", `Máximo ${maxImages} imágenes permitidas`);
        return;
      }

      // Validar cada archivo
      const validFiles = fileArray.filter((file) => {
        const validationError = validateFile(file);
        if (validationError) {
          error("Archivo inválido", `${file.name}: ${validationError}`);
          return false;
        }
        return true;
      });

      if (validFiles.length === 0) return;

      // Inicializar archivos en subida
      const newUploadingFiles = validFiles.map((file) => ({
        file,
        progress: 0,
        status: "uploading" as const,
      }));

      setUploadingFiles((prev) => [...prev, ...newUploadingFiles]);

      // Subir cada archivo
      for (const uploadingFile of newUploadingFiles) {
        try {
          const url = await uploadFileToCloudinary(
            uploadingFile.file,
            (progress) => {
              setUploadingFiles((prev) =>
                prev.map((f) =>
                  f.file === uploadingFile.file ? { ...f, progress } : f
                )
              );
            }
          );

          // Marcar como exitoso
          setUploadingFiles((prev) =>
            prev.map((f) =>
              f.file === uploadingFile.file
                ? { ...f, status: "success", url, progress: 100 }
                : f
            )
          );

          // Agregar a la base de datos
          const newImage = await fetch(`/api/products/${productId}/images`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              image_url: url,
              alt_text: uploadingFile.file.name.split(".")[0],
              is_primary: images.length === 0, // Primera imagen es principal
              display_order: images.length,
            }),
          }).then((res) => res.json());

          onImagesChange([...images, newImage]);
        } catch (error) {
          console.error("Error uploading file:", error);
          setUploadingFiles((prev) =>
            prev.map((f) =>
              f.file === uploadingFile.file
                ? {
                    ...f,
                    status: "error",
                    error:
                      error instanceof Error
                        ? error.message
                        : "Error desconocido",
                  }
                : f
            )
          );
        }
      }

      // Limpiar archivos completados después de un tiempo
      setTimeout(() => {
        setUploadingFiles((prev) =>
          prev.filter((f) => f.status === "uploading")
        );
      }, 3000);
    },
    [images, uploadingFiles, maxImages, productId, onImagesChange]
  );

  // Drag & Drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      if (e.dataTransfer.files) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles]
  );

  // Click para seleccionar archivos
  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  // Agregar URL manual
  const handleAddUrl = async () => {
    const validationError = validateImageUrl(manualUrl);
    if (validationError) {
      error("URL inválida", validationError);
      return;
    }

    if (images.length >= maxImages) {
      error("Límite excedido", `Máximo ${maxImages} imágenes permitidas`);
      return;
    }

    setIsAddingUrl(true);

    try {
      const newImage = await fetch(`/api/products/${productId}/images`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image_url: manualUrl,
          alt_text: "Imagen del producto",
          is_primary: images.length === 0,
          display_order: images.length,
        }),
      }).then((res) => res.json());

      onImagesChange([...images, newImage]);
      setManualUrl("");
    } catch (err) {
      console.error("Error adding URL:", err);
      error("Error al agregar imagen", "No se pudo agregar la imagen por URL");
    } finally {
      setIsAddingUrl(false);
    }
  };

  // Establecer como imagen principal
  const handleSetPrimary = async (imageId: string) => {
    try {
      // Actualizar en la base de datos
      await fetch(`/api/products/${productId}/images`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageId,
          action: "setPrimary",
        }),
      });

      // Actualizar estado local
      const updatedImages = images.map((img) => ({
        ...img,
        is_primary: img.id === imageId,
      }));
      onImagesChange(updatedImages);
    } catch (err) {
      console.error("Error setting primary image:", err);
      error(
        "Error al establecer principal",
        "No se pudo establecer la imagen principal"
      );
    }
  };

  // Editar texto alternativo
  const handleEditAltText = async (imageId: string) => {
    if (!editAltText.trim()) {
      error("Campo requerido", "El texto alternativo es requerido");
      return;
    }

    try {
      await fetch(`/api/products/${productId}/images`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageId,
          action: "updateAltText",
          altText: editAltText.trim(),
        }),
      });

      const updatedImages = images.map((img) =>
        img.id === imageId ? { ...img, alt_text: editAltText.trim() } : img
      );
      onImagesChange(updatedImages);
      setEditingImage(null);
      setEditAltText("");
    } catch (err) {
      console.error("Error updating alt text:", err);
      error(
        "Error al actualizar",
        "No se pudo actualizar el texto alternativo"
      );
    }
  };

  // Eliminar imagen
  const handleDeleteImage = async (imageId: string) => {
    if (!confirm("¿Estás seguro de eliminar esta imagen?")) return;

    try {
      await fetch(`/api/products/${productId}/images?imageId=${imageId}`, {
        method: "DELETE",
      });

      const updatedImages = images.filter((img) => img.id !== imageId);
      onImagesChange(updatedImages);
    } catch (err) {
      console.error("Error deleting image:", err);
      error("Error al eliminar", "No se pudo eliminar la imagen");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Imágenes del Producto
        </h3>
        <span className="text-sm text-gray-500">
          {images.length} de {maxImages} imágenes
        </span>
      </div>

      {/* Zona de subida */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragOver
            ? "border-orange-500 bg-orange-50"
            : "border-gray-300 hover:border-gray-400"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
        <div className="mt-4">
          <button
            type="button"
            onClick={handleFileSelect}
            className="font-medium text-orange-600 hover:text-orange-500"
          >
            Seleccionar archivos
          </button>
          <span className="text-gray-500"> o arrastra aquí</span>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          PNG, JPG, GIF hasta {maxFileSize}MB
        </p>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          className="hidden"
        />
      </div>

      {/* Agregar por URL */}
      <div className="border rounded-lg p-4 bg-gray-50">
        <h4 className="font-medium text-gray-900 mb-3">O agregar por URL</h4>
        <div className="flex gap-2">
          <input
            type="url"
            value={manualUrl}
            onChange={(e) => setManualUrl(e.target.value)}
            placeholder="https://ejemplo.com/imagen.jpg"
            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
            maxLength={1000}
          />
          <button
            type="button"
            onClick={handleAddUrl}
            disabled={isAddingUrl || !manualUrl.trim()}
            className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAddingUrl ? "Agregando..." : "Agregar"}
          </button>
        </div>
        {manualUrl && (
          <p className="text-xs text-gray-500 mt-1">
            {manualUrl.length}/1000 caracteres
          </p>
        )}
      </div>

      {/* Archivos subiendo */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Subiendo archivos...</h4>
          {uploadingFiles.map((uploadingFile, index) => (
            <div key={index} className="bg-white border rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">
                  {uploadingFile.file.name}
                </span>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    uploadingFile.status === "uploading"
                      ? "bg-blue-100 text-blue-800"
                      : uploadingFile.status === "success"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {uploadingFile.status === "uploading"
                    ? `${Math.round(uploadingFile.progress)}%`
                    : uploadingFile.status === "success"
                    ? "Completado"
                    : "Error"}
                </span>
              </div>
              {uploadingFile.status === "uploading" && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadingFile.progress}%` }}
                  />
                </div>
              )}
              {uploadingFile.status === "error" && uploadingFile.error && (
                <p className="text-xs text-red-600 mt-1">
                  {uploadingFile.error}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Grid de imágenes */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image) => (
            <div
              key={image.id}
              className="relative group bg-white border rounded-lg overflow-hidden"
            >
              {/* Imagen */}
              <div className="aspect-square relative">
                <ProductImageComponent
                  src={image.image_url}
                  alt={image.alt_text || "Imagen del producto"}
                  fill
                  sizes="200px"
                />

                {/* Badge de imagen principal */}
                {image.is_primary && (
                  <div className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                    <StarIconSolid className="h-3 w-3" />
                    Principal
                  </div>
                )}

                {/* Controles overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex gap-2">
                    {!image.is_primary && (
                      <button
                        onClick={() => handleSetPrimary(image.id)}
                        className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                        title="Establecer como principal"
                      >
                        <StarIcon className="h-4 w-4 text-gray-600" />
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setEditingImage(image.id);
                        setEditAltText(image.alt_text || "");
                      }}
                      className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                      title="Editar texto alternativo"
                    >
                      <PencilIcon className="h-4 w-4 text-gray-600" />
                    </button>
                    <button
                      onClick={() => handleDeleteImage(image.id)}
                      className="p-2 bg-white rounded-full hover:bg-red-100 transition-colors"
                      title="Eliminar imagen"
                    >
                      <TrashIcon className="h-4 w-4 text-red-600" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Información */}
              <div className="p-3">
                {editingImage === image.id ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={editAltText}
                      onChange={(e) => setEditAltText(e.target.value)}
                      placeholder="Texto alternativo"
                      className="w-full text-xs border rounded px-2 py-1"
                    />
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEditAltText(image.id)}
                        className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                      >
                        Guardar
                      </button>
                      <button
                        onClick={() => {
                          setEditingImage(null);
                          setEditAltText("");
                        }}
                        className="text-xs bg-gray-600 text-white px-2 py-1 rounded hover:bg-gray-700"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-gray-600 truncate">
                    {image.alt_text || "Sin descripción"}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Estado vacío */}
      {images.length === 0 && uploadingFiles.length === 0 && (
        <div className="text-center py-8">
          <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Sin imágenes
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Sube archivos o agrega URLs para comenzar
          </p>
        </div>
      )}
    </div>
  );
}
