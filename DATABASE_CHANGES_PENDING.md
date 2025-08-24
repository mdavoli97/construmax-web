# 📝 CAMBIOS PENDIENTES EN BASE DE DATOS

## **Nuevos Campos Requeridos para Tipos de Productos**

### **Tabla `products` - Campos Adicionales Necesarios**

```sql
-- Agregar campos para manejar diferentes tipos de productos
ALTER TABLE products
ADD COLUMN product_type VARCHAR(20) DEFAULT 'standard',
ADD COLUMN weight_per_unit DECIMAL(10,3), -- Para perfiles: peso por unidad en kg
ADD COLUMN price_per_kg DECIMAL(10,2), -- Para perfiles: precio por kilogramo
ADD COLUMN stock_type VARCHAR(20) DEFAULT 'quantity', -- 'quantity' o 'availability'
ADD COLUMN is_available BOOLEAN DEFAULT true; -- Para stock tipo availability

-- Agregar índices para optimizar consultas
CREATE INDEX idx_products_type ON products(product_type);
CREATE INDEX idx_products_stock_type ON products(stock_type);
CREATE INDEX idx_products_availability ON products(is_available) WHERE stock_type = 'availability';

-- Agregar constraints para validar datos
ALTER TABLE products
ADD CONSTRAINT chk_product_type CHECK (product_type IN ('standard', 'perfiles', 'otros')),
ADD CONSTRAINT chk_stock_type CHECK (stock_type IN ('quantity', 'availability')),
ADD CONSTRAINT chk_weight_per_unit CHECK (weight_per_unit IS NULL OR weight_per_unit > 0),
ADD CONSTRAINT chk_price_per_kg CHECK (price_per_kg IS NULL OR price_per_kg > 0);

-- Comentarios para documentar los campos
COMMENT ON COLUMN products.product_type IS 'Tipo de producto: standard, perfiles, otros';
COMMENT ON COLUMN products.weight_per_unit IS 'Peso por unidad en kg (solo para perfiles)';
COMMENT ON COLUMN products.price_per_kg IS 'Precio por kilogramo (solo para perfiles)';
COMMENT ON COLUMN products.stock_type IS 'Tipo de stock: quantity (numérico) o availability (disponible/no disponible)';
COMMENT ON COLUMN products.is_available IS 'Disponibilidad del producto (usado cuando stock_type = availability)';
```

### **Script de Migración de Datos Existentes**

```sql
-- Actualizar productos existentes para que tengan los nuevos campos por defecto
UPDATE products
SET
  product_type = 'standard',
  stock_type = 'quantity',
  is_available = CASE WHEN stock > 0 THEN true ELSE false END
WHERE product_type IS NULL;
```

### **Validaciones Adicionales Recomendadas**

```sql
-- Trigger para validar consistencia de datos
CREATE OR REPLACE FUNCTION validate_product_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Para perfiles, validar que tengan weight_per_unit y price_per_kg
  IF NEW.product_type = 'perfiles' THEN
    IF NEW.weight_per_unit IS NULL OR NEW.price_per_kg IS NULL THEN
      RAISE EXCEPTION 'Los perfiles deben tener weight_per_unit y price_per_kg definidos';
    END IF;
    -- Para perfiles, el precio debe calcularse automáticamente
    NEW.price = NEW.weight_per_unit * NEW.price_per_kg;
    -- Para perfiles, la unidad debe ser kg
    NEW.unit = 'kg';
  END IF;

  -- Para productos con stock_type = 'availability', validar que tengan is_available
  IF NEW.stock_type = 'availability' AND NEW.is_available IS NULL THEN
    NEW.is_available = true;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_validate_product_data
  BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION validate_product_data();
```

## **Estado Actual (Solución Temporal)**

Mientras no se pueden hacer estos cambios en la base de datos, estamos usando:

### **📦 Almacenamiento en Campo `description`**

Los datos adicionales se guardan como JSON en el campo `description`:

```json
{
  "description": "Descripción del producto",
  "meta": {
    "product_type": "perfiles",
    "weight_per_unit": 2.5,
    "price_per_kg": 150.0,
    "stock_type": "availability",
    "is_available": true
  }
}
```

### **🔧 Funciones de Frontend**

- ✅ **Formulario adaptativo** por tipo de producto
- ✅ **Cálculo automático** de precio para perfiles
- ✅ **Validaciones específicas** según tipo
- ✅ **Stock como disponibilidad** para perfiles
- ✅ **Unidad automática** (kg) para perfiles

### **📋 Pasos para Migrar**

1. **Ejecutar scripts SQL** cuando sea posible actualizar la BD
2. **Crear función de migración** de datos desde description JSON a campos nuevos
3. **Actualizar el frontend** para usar los campos reales
4. **Limpiar campo description** removiendo metadata

## **🎯 Beneficios de los Cambios**

- **Consultas más eficientes** con índices específicos
- **Validaciones a nivel de BD** para integridad de datos
- **Cálculos automáticos** de precios para perfiles
- **Escalabilidad** para agregar más tipos de productos
- **Reportes y filtros** más precisos

---

**Estado:** ⏳ Pendiente de ejecución en base de datos  
**Prioridad:** 🔴 Alta - Necesario para producción completa
