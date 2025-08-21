# Sistema de Imágenes de Productos

Este documento describe cómo funciona el sistema de gestión de imágenes para los productos en la aplicación.

## Características

- ✅ Soporte para múltiples imágenes por producto
- ✅ Imagen principal y galería de imágenes
- ✅ Componente de carga optimizada con placeholders
- ✅ Galería con navegación y miniaturas
- ✅ Panel de administración para gestionar imágenes
- ✅ Subida por drag & drop
- ✅ Soporte para URLs externas (Unsplash, Cloudinary, etc.)

## Estructura de Base de Datos

### Tabla `products`

- `primary_image`: URL de la imagen principal (VARCHAR 500)
- `images`: Campo JSONB para metadatos adicionales (opcional)

### Tabla `product_images`

- `id`: ID único de la imagen
- `product_id`: Referencia al producto
- `image_url`: URL de la imagen
- `alt_text`: Texto alternativo
- `is_primary`: Boolean para marcar imagen principal
- `display_order`: Orden de visualización

## Componentes

### ProductImage

Componente base para mostrar imágenes de productos con:

- Manejo de errores y estado de carga
- Placeholder automático si no hay imagen
- Soporte para Next.js Image optimization

### ProductImageGallery

Galería completa para páginas de detalle con:

- Navegación entre imágenes
- Miniaturas clicables
- Indicador de imagen actual
- Controles de navegación

### ImageUpload (Admin)

Componente para el panel de administración:

- Subida por drag & drop
- Gestión de múltiples imágenes
- Establecer imagen principal
- Eliminar imágenes

## APIs

### GET /api/products/[id]/images

Obtiene todas las imágenes de un producto.

### POST /api/products/[id]/images

Agrega una nueva imagen al producto.

```json
{
  "image_url": "https://example.com/image.jpg",
  "alt_text": "Descripción de la imagen",
  "is_primary": false,
  "display_order": 1
}
```

### DELETE /api/products/[id]/images?imageId=xxx

Elimina una imagen específica del producto.

## Configuración de Next.js

En `next.config.ts` se han configurado los dominios permitidos para imágenes:

- Unsplash (images.unsplash.com)
- Cloudinary (res.cloudinary.com)
- AWS S3 (\*\*.amazonaws.com)
- Google Cloud Storage (storage.googleapis.com)

## Uso en el Frontend

### Mostrar imagen de producto

```tsx
import ProductImage from "@/components/ProductImage";

<ProductImage
  src={product.primary_image}
  alt={product.name}
  fill
  sizes="(max-width: 768px) 100vw, 50vw"
/>;
```

### Galería completa

```tsx
import ProductImageGallery from "@/components/ProductImageGallery";

<ProductImageGallery product={product} productImages={productImages} />;
```

## Subida de Imágenes

Actualmente el sistema está configurado para:

1. URLs externas (Unsplash, etc.) - ✅ Implementado
2. Subida local con drag & drop - 🔄 En desarrollo

Para implementar subida real de archivos, puedes integrar:

- Cloudinary
- AWS S3
- Google Cloud Storage
- Vercel Blob Storage

## Scripts de Demostración

### `database/images_schema.sql`

Script para crear las tablas y políticas de seguridad.

### `database/demo_products_with_images.sql`

Script con productos de demostración que incluyen imágenes reales de Unsplash.

## Próximos Pasos

1. [ ] Integración con servicio de almacenamiento real
2. [ ] Redimensionado automático de imágenes
3. [ ] Compresión de imágenes
4. [ ] Lazy loading avanzado
5. [ ] Soporte para diferentes formatos (WebP, AVIF)
6. [ ] CDN para optimización de entrega

## Troubleshooting

### Las imágenes no cargan

- Verificar que el dominio esté en `next.config.ts`
- Comprobar CORS si las imágenes son externas
- Revisar que las URLs sean válidas

### Error en subida de imágenes

- Verificar permisos de la API
- Comprobar límites de tamaño de archivo
- Revisar configuración del servicio de almacenamiento
