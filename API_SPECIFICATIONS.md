# APIs Necesarias para Gestión de Precios por Grupos

## 📋 Resumen

Este documento especifica todas las APIs que necesitan ser implementadas para completar el sistema de gestión de precios por grupos.

## 🛠️ APIs de Grupos de Precios

### 1. GET /api/admin/price-groups

**Descripción**: Obtener todos los grupos de precios
**Método**: GET
**Autenticación**: Requerida (Admin)

**Parámetros de consulta**:

- `category` (opcional): Filtrar por categoría
- `active` (opcional): Filtrar por estado activo/inactivo
- `page` (opcional): Número de página
- `limit` (opcional): Límite de resultados

**Respuesta exitosa (200)**:

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Caños Estructurales",
      "description": "Caños tubulares para estructura metálica",
      "price_per_kg_usd": 1.25,
      "category": "metalurgica",
      "is_active": true,
      "product_count": 15,
      "created_at": "2025-08-20T10:00:00Z",
      "updated_at": "2025-08-23T14:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

### 2. POST /api/admin/price-groups

**Descripción**: Crear nuevo grupo de precios
**Método**: POST
**Autenticación**: Requerida (Admin)

**Body**:

```json
{
  "name": "Nuevo Grupo",
  "description": "Descripción del grupo",
  "price_per_kg_usd": 1.3,
  "category": "metalurgica"
}
```

**Validaciones**:

- `name`: Requerido, máximo 255 caracteres, único por categoría
- `price_per_kg_usd`: Requerido, número positivo
- `category`: Requerido, uno de: construction, metalurgica, herramientas, herreria

**Respuesta exitosa (201)**:

```json
{
  "success": true,
  "data": {
    "id": "nuevo-uuid",
    "name": "Nuevo Grupo",
    "description": "Descripción del grupo",
    "price_per_kg_usd": 1.3,
    "category": "metalurgica",
    "is_active": true,
    "product_count": 0,
    "created_at": "2025-08-23T15:00:00Z",
    "updated_at": "2025-08-23T15:00:00Z"
  }
}
```

### 3. GET /api/admin/price-groups/:id

**Descripción**: Obtener grupo específico con estadísticas
**Método**: GET
**Autenticación**: Requerida (Admin)

**Respuesta exitosa (200)**:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Caños Estructurales",
    "description": "Caños tubulares para estructura metálica",
    "price_per_kg_usd": 1.25,
    "category": "metalurgica",
    "is_active": true,
    "product_count": 15,
    "avg_product_price": 45.5,
    "min_product_price": 12.3,
    "max_product_price": 125.8,
    "products": [
      {
        "id": "product-uuid",
        "name": "Caño Estructural 40x40",
        "price": 45.5,
        "weight_per_unit": 2.5
      }
    ],
    "created_at": "2025-08-20T10:00:00Z",
    "updated_at": "2025-08-23T14:30:00Z"
  }
}
```

### 4. PUT /api/admin/price-groups/:id

**Descripción**: Actualizar grupo de precios
**Método**: PUT
**Autenticación**: Requerida (Admin)

**Body**:

```json
{
  "name": "Nombre Actualizado",
  "description": "Nueva descripción",
  "price_per_kg_usd": 1.4,
  "category": "metalurgica"
}
```

**Comportamiento especial**:

- Si se cambia `price_per_kg_usd`, actualizar automáticamente todos los productos asociados
- Registrar el cambio en auditoría

**Respuesta exitosa (200)**:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Nombre Actualizado",
    "price_per_kg_usd": 1.4,
    "products_updated": 15
  },
  "message": "Grupo actualizado y 15 productos actualizados automáticamente"
}
```

### 5. DELETE /api/admin/price-groups/:id

**Descripción**: Eliminar grupo de precios (soft delete)
**Método**: DELETE
**Autenticación**: Requerida (Admin)

**Validaciones**:

- No se puede eliminar si tiene productos asociados
- O solicitar confirmación para desvincular productos

**Respuesta exitosa (200)**:

```json
{
  "success": true,
  "message": "Grupo eliminado exitosamente"
}
```

**Error si tiene productos (400)**:

```json
{
  "success": false,
  "error": "No se puede eliminar el grupo porque tiene 15 productos asociados",
  "data": {
    "product_count": 15,
    "suggestion": "Desvincule los productos primero o use force=true"
  }
}
```

### 6. PATCH /api/admin/price-groups/:id/bulk-update-products

**Descripción**: Actualizar precios de todos los productos del grupo
**Método**: PATCH
**Autenticación**: Requerida (Admin)

**Body**:

```json
{
  "new_price_per_kg_usd": 1.35,
  "apply_immediately": true
}
```

**Respuesta exitosa (200)**:

```json
{
  "success": true,
  "data": {
    "group_id": "uuid",
    "old_price": 1.25,
    "new_price": 1.35,
    "products_updated": 15,
    "price_change_percentage": 8.0
  }
}
```

## 🔍 APIs de Consulta Pública

### 7. GET /api/price-groups

**Descripción**: Obtener grupos activos (para formularios)
**Método**: GET
**Autenticación**: No requerida

**Parámetros**:

- `category` (opcional): Filtrar por categoría

**Respuesta exitosa (200)**:

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Caños Estructurales",
      "price_per_kg_usd": 1.25,
      "category": "metalurgica"
    }
  ]
}
```

### 8. GET /api/price-groups/:id/products

**Descripción**: Obtener productos de un grupo específico
**Método**: GET
**Autenticación**: No requerida

**Respuesta exitosa (200)**:

```json
{
  "success": true,
  "data": {
    "group": {
      "id": "uuid",
      "name": "Caños Estructurales",
      "price_per_kg_usd": 1.25
    },
    "products": [
      {
        "id": "product-uuid",
        "name": "Caño Estructural 40x40",
        "price": 45.5,
        "weight_per_unit": 2.5,
        "stock_available": true
      }
    ]
  }
}
```

## 📊 APIs de Estadísticas

### 9. GET /api/admin/price-groups/stats

**Descripción**: Estadísticas generales de grupos de precios
**Método**: GET
**Autenticación**: Requerida (Admin)

**Respuesta exitosa (200)**:

```json
{
  "success": true,
  "data": {
    "total_groups": 8,
    "total_products_with_groups": 145,
    "total_products_without_groups": 12,
    "avg_price_per_kg": 1.28,
    "categories": {
      "metalurgica": {
        "groups": 6,
        "products": 120,
        "avg_price": 1.3
      },
      "construccion": {
        "groups": 2,
        "products": 25,
        "avg_price": 1.2
      }
    }
  }
}
```

## 🔄 APIs de Sincronización

### 10. POST /api/admin/products/:id/sync-with-group

**Descripción**: Sincronizar precio de producto con su grupo
**Método**: POST
**Autenticación**: Requerida (Admin)

**Respuesta exitosa (200)**:

```json
{
  "success": true,
  "data": {
    "product_id": "uuid",
    "old_price": 42.3,
    "new_price": 45.5,
    "group_price_per_kg": 1.25,
    "weight_per_unit": 2.5
  }
}
```

### 11. POST /api/admin/migrate-products-to-groups

**Descripción**: Migrar productos existentes a grupos automáticamente
**Método**: POST
**Autenticación**: Requerida (Admin)

**Body**:

```json
{
  "dry_run": true,
  "category_filter": "metalurgica"
}
```

**Respuesta (dry_run=true)**:

```json
{
  "success": true,
  "data": {
    "products_to_migrate": 45,
    "mapping_preview": [
      {
        "product_name": "Caño 40x40",
        "current_category": "metalurgica",
        "suggested_group": "Caños Estructurales",
        "confidence": 0.95
      }
    ]
  }
}
```

## 🛡️ Middleware y Validaciones

### Middleware de Autenticación Admin

```typescript
export async function requireAdmin(req: NextRequest) {
  const token = req.headers.get("authorization");
  const user = await verifyToken(token);

  if (!user || !user.isAdmin) {
    throw new Error("Admin access required");
  }

  return user;
}
```

### Validaciones de Entrada

```typescript
const priceGroupSchema = {
  name: { type: "string", required: true, maxLength: 255 },
  description: { type: "string", maxLength: 1000 },
  price_per_kg_usd: { type: "number", required: true, min: 0 },
  category: {
    type: "string",
    required: true,
    enum: ["construccion", "metalurgica", "herramientas", "herreria"],
  },
};
```

## 📝 Ejemplos de Implementación

### Archivo: `/api/admin/price-groups/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    const { data, error } = await supabase
      .from("price_groups_with_stats")
      .select("*")
      .eq("is_active", true)
      .order("category", { ascending: true })
      .order("name", { ascending: true });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const body = await request.json();

    // Validar datos
    const { name, description, price_per_kg_usd, category } = body;

    if (!name || !price_per_kg_usd || !category) {
      return NextResponse.json(
        {
          success: false,
          error: "Campos requeridos: name, price_per_kg_usd, category",
        },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("price_groups")
      .insert({
        name,
        description,
        price_per_kg_usd,
        category,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(
      {
        success: true,
        data,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
```

## ⚡ Optimizaciones de Performance

1. **Caché**: Implementar caché Redis para grupos frecuentemente consultados
2. **Índices**: Asegurar índices en columnas de filtrado frecuente
3. **Paginación**: Implementar paginación en todas las listas
4. **Lazy Loading**: Cargar productos de grupo solo cuando se soliciten
5. **Batch Updates**: Actualizar productos en lotes para mejor performance

## 🔄 Estados de Implementación

- ✅ **Documentación**: Completa
- 🔄 **APIs Base**: Por implementar
- 🔄 **Validaciones**: Por implementar
- 🔄 **Tests**: Por escribir
- 🔄 **Documentación API**: Por generar (Swagger/OpenAPI)
