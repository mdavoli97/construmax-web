# Actualización Formulario de Edición - Pendiente

## 🔧 Cambios Aplicados

### ✅ Backend Logic (Completado)

- **Imports actualizados**: Currency hooks, ImageUpload, nuevos íconos
- **Estado actualizado**: Agregados campos para product_type, weight_per_unit, price_per_kg, stock_type, is_available
- **Carga de datos**: Parsing del JSON en description para extraer metadata
- **Validación**: Lógica específica para perfiles vs productos estándar
- **Guardado**: Reconstrucción del JSON con metadata para diferentes tipos

### 🔄 Frontend Template (Pendiente)

- **Información de cotización**: Panel con cotización USD→UYU
- **Selector de tipo de producto**: Standard vs Perfiles
- **Campos específicos para perfiles**:
  - Precio por kg (USD) con conversión a UYU
  - Peso por unidad
  - Precio total calculado automáticamente
  - Stock por disponibilidad (checkbox)
- **Campos para productos estándar**:
  - Precio (USD) con conversión a UYU
  - Stock numérico
- **Integración de ImageUpload**: Para manejar imágenes del producto

## 📋 Template Actual vs Requerido

### Current Template:

```tsx
// Formulario básico con campos estándar
- Nombre, Marca, Descripción
- Precio (sin conversión)
- Stock (sin tipo)
- Categoría, Unidad
- SKU, Featured
```

### Required Template:

```tsx
// Formulario adaptativo con:
1. Panel de cotización USD→UYU
2. Selector de tipo de producto
3. Campos dinámicos según tipo:
   - Perfiles: precio_per_kg, weight_per_unit, is_available
   - Standard: precio, stock numérico
4. Conversión automática USD→UYU
5. Cálculo automático de precios
6. Gestión de imágenes
```

## 🚀 Próximos Pasos

### 1. Reemplazar Template del Formulario

Copiar el template completo de `/admin/productos/nuevo/page.tsx` y adaptarlo para edición:

- Cambiar título: "Agregar Nuevo Producto" → "Editar Producto"
- Adaptar para modo edición (campos pre-poblados)
- Mantener toda la lógica de conversión de moneda
- Incluir ImageUpload para gestión de imágenes

### 2. Adaptaciones Específicas para Edición

- **Pre-población**: Campos cargados desde metadata JSON
- **Cálculo inicial**: Si es perfil, recalcular precio basado en peso × precio_per_kg
- **Imágenes existentes**: Mostrar imágenes actuales del producto
- **Botón submit**: "Actualizar Producto" en lugar de "Crear Producto"

### 3. Validación de Datos

- **Consistencia**: Validar que metadata coincida con tipo de producto
- **Conversión**: Asegurar que precios se mantengan en USD en backend
- **Stock**: Manejar conversión entre stock numérico y disponibilidad

## 💡 Solución Rápida

Para acelerar el desarrollo, se puede:

1. **Copiar template completo** de nuevo producto
2. **Buscar y reemplazar**:
   - "Agregar Nuevo Producto" → "Editar Producto"
   - "Crear Producto" → "Actualizar Producto"
   - Agregar lógica de pre-población
3. **Mantener toda la lógica** de conversión de moneda y tipos de producto

## 🔧 Estado Backend

El backend ya está completamente funcional:

- ✅ Parsing de JSON correcto
- ✅ Validaciones por tipo de producto
- ✅ Guardado con metadata
- ✅ Conversión de stock según tipo

Solo falta el frontend template completo.

---

> **Prioridad**: Alta - Formulario de edición debe mantener consistencia con creación
> **Estimación**: 1 hora para copia completa del template
> **Dependencias**: Template de creación (ya completado)
