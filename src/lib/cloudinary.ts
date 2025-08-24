import { v2 as cloudinary } from "cloudinary";

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Sube una imagen a Cloudinary
 * @param file - El archivo de imagen (File object)
 * @param folder - Carpeta donde guardar (opcional, default: 'products')
 * @returns URL de la imagen subida
 */
export async function uploadImageToCloudinary(
  file: File,
  folder: string = "products"
): Promise<string> {
  try {
    // Convertir File a base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");
    const dataURI = `data:${file.type};base64,${base64}`;

    // Subir a Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: folder,
      resource_type: "image",
      transformation: [
        {
          width: 800,
          height: 800,
          crop: "limit",
          quality: "auto:good",
          format: "auto",
        },
      ],
    });

    return result.secure_url;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw new Error("Error al subir imagen a Cloudinary");
  }
}

/**
 * Sube múltiples imágenes a Cloudinary
 * @param files - Array de archivos
 * @param folder - Carpeta donde guardar
 * @param onProgress - Callback para progreso (opcional)
 * @returns Array de URLs
 */
export async function uploadMultipleImagesToCloudinary(
  files: File[],
  folder: string = "products",
  onProgress?: (progress: number, fileName: string) => void
): Promise<string[]> {
  const urls: string[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    try {
      if (onProgress) {
        onProgress((i / files.length) * 100, file.name);
      }

      const url = await uploadImageToCloudinary(file, folder);
      urls.push(url);
    } catch (error) {
      console.error(`Error uploading ${file.name}:`, error);
      throw error;
    }
  }

  if (onProgress) {
    onProgress(100, "Completado");
  }

  return urls;
}

/**
 * Elimina una imagen de Cloudinary usando su public_id
 * @param publicId - ID público de la imagen en Cloudinary
 */
export async function deleteImageFromCloudinary(
  publicId: string
): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
    throw new Error("Error al eliminar imagen de Cloudinary");
  }
}

/**
 * Extrae el public_id de una URL de Cloudinary
 * @param url - URL de Cloudinary
 * @returns public_id o null si no es una URL válida
 */
export function extractPublicIdFromCloudinaryUrl(url: string): string | null {
  try {
    const regex = /\/v\d+\/(.+)\./;
    const match = url.match(regex);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}
