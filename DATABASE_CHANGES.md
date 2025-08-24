# Cambios Necesarios en la Base de Datos

## 📋 Resumen

Este documento detalla los cambios necesarios en la base de datos para implementar completamente el sistema de gestión de precios por grupos de productos.

## 🆕 Nueva Tabla: `price_groups`

### Estructura de la tabla

```sql
CREATE TABLE price_groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price_per_kg_usd DECIMAL(10,4) NOT NULL,
  category VARCHAR(100) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);
```

### Índices recomendados

```sql
-- Índice para búsquedas por categoría
CREATE INDEX idx_price_groups_category ON price_groups(category);

-- Índice para grupos activos
CREATE INDEX idx_price_groups_active ON price_groups(is_active);

-- Índice compuesto para búsquedas frecuentes
CREATE INDEX idx_price_groups_category_active ON price_groups(category, is_active);
```

### Datos iniciales

```sql
INSERT INTO price_groups (name, description, price_per_kg_usd, category) VALUES
('Caños Estructurales', 'Caños tubulares para estructura metálica', 1.25, 'metalurgica'),
('Perfiles Tubulares', 'Perfiles tubulares rectangulares y cuadrados', 1.35, 'metalurgica'),
('Hierros de Construcción', 'Hierros y varillas para construcción', 1.10, 'construccion'),
('Perfiles Angulares', 'Ángulos y perfiles en L', 1.20, 'metalurgica'),
('Chapas Metálicas', 'Chapas de diferentes espesores', 1.40, 'metalurgica');
```

## 🔄 Modificaciones a la tabla `products`

### Nuevas columnas

```sql
-- Agregar columna para vincular con grupos de precios
ALTER TABLE products
ADD COLUMN price_group_id UUID REFERENCES price_groups(id);

-- Agregar índice para la nueva columna
CREATE INDEX idx_products_price_group ON products(price_group_id);
```

### Actualización de metadatos existentes

Los productos existentes que tengan `product_type = "perfiles"` en su metadata JSON deberán ser actualizados para incluir el `price_group_id`.

```sql
-- Script para actualizar productos existentes (ejemplo)
UPDATE products
SET price_group_id = (
  SELECT id FROM price_groups
  WHERE category = products.category
  AND name ILIKE '%estructura%'
  LIMIT 1
)
WHERE description::json->>'product_type' = 'perfiles'
AND category = 'metalurgica';
```

## 🔐 Políticas de Seguridad (RLS)

### Para tabla `price_groups`

```sql
-- Habilitar RLS
ALTER TABLE price_groups ENABLE ROW LEVEL SECURITY;

-- Política para lectura (usuarios autenticados)
CREATE POLICY "Usuarios pueden ver grupos de precios" ON price_groups
FOR SELECT TO authenticated
USING (true);

-- Política para administradores (crear, actualizar, eliminar)
CREATE POLICY "Solo admins pueden modificar grupos de precios" ON price_groups
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);
```

### Actualizar políticas de `products`

```sql
-- Permitir lectura de price_group_id en productos
-- (Las políticas existentes de products ya deberían cubrir esto)
```

## 🛠️ Funciones de Base de Datos

### Función para actualizar timestamps automáticamente

```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  NEW.updated_by = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para price_groups
CREATE TRIGGER price_groups_updated_at
  BEFORE UPDATE ON price_groups
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
```

### Función para contar productos por grupo

```sql
CREATE OR REPLACE FUNCTION get_product_count_by_price_group(group_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM products
    WHERE price_group_id = group_id
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql;
```

### Vista para gestión de precios

```sql
CREATE VIEW price_groups_with_stats AS
SELECT
  pg.*,
  COUNT(p.id) as product_count,
  AVG(p.price) as avg_product_price,
  MIN(p.price) as min_product_price,
  MAX(p.price) as max_product_price
FROM price_groups pg
LEFT JOIN products p ON pg.id = p.price_group_id AND p.is_active = true
GROUP BY pg.id, pg.name, pg.description, pg.price_per_kg_usd, pg.category,
         pg.is_active, pg.created_at, pg.updated_at, pg.created_by, pg.updated_by;
```

## 📊 Migración de Datos Existentes

### Script de migración

```sql
-- 1. Crear tabla temporal para mapear productos a grupos
CREATE TEMP TABLE product_group_mapping AS
SELECT DISTINCT
  p.id as product_id,
  p.category,
  CASE
    WHEN p.category = 'metalurgica' AND p.name ILIKE '%caño%' THEN 'Caños Estructurales'
    WHEN p.category = 'metalurgica' AND p.name ILIKE '%perfil%' THEN 'Perfiles Tubulares'
    WHEN p.category = 'construccion' AND p.name ILIKE '%hierro%' THEN 'Hierros de Construcción'
    WHEN p.category = 'metalurgica' AND p.name ILIKE '%angular%' THEN 'Perfiles Angulares'
    WHEN p.category = 'metalurgica' AND p.name ILIKE '%chapa%' THEN 'Chapas Metálicas'
    ELSE 'Caños Estructurales' -- Grupo por defecto
  END as group_name
FROM products p
WHERE p.description::json->>'product_type' = 'perfiles';

-- 2. Actualizar productos con sus grupos correspondientes
UPDATE products
SET price_group_id = pg.id
FROM product_group_mapping pgm
JOIN price_groups pg ON pg.name = pgm.group_name
WHERE products.id = pgm.product_id;

-- 3. Limpiar tabla temporal
DROP TABLE product_group_mapping;
```

## 🔌 APIs Necesarias

### Endpoints para grupos de precios

```
GET    /api/admin/price-groups          - Listar todos los grupos
POST   /api/admin/price-groups          - Crear nuevo grupo
GET    /api/admin/price-groups/:id      - Obtener grupo específico
PUT    /api/admin/price-groups/:id      - Actualizar grupo
DELETE /api/admin/price-groups/:id      - Eliminar grupo (soft delete)
PATCH  /api/admin/price-groups/:id/bulk-update-products - Actualizar precios de productos en lote
```

### Endpoints de consulta

```
GET /api/price-groups?category=metalurgica - Grupos por categoría
GET /api/price-groups/:id/products         - Productos del grupo
POST /api/admin/price-groups/:id/apply-to-products - Aplicar precio a productos
```

## 📝 Validaciones y Reglas de Negocio

### En la base de datos

```sql
-- Validar que el precio sea positivo
ALTER TABLE price_groups
ADD CONSTRAINT check_positive_price
CHECK (price_per_kg_usd > 0);

-- Validar categorías válidas
ALTER TABLE price_groups
ADD CONSTRAINT check_valid_category
CHECK (category IN ('construccion', 'metalurgica', 'herramientas', 'herreria'));

-- Nombres únicos por categoría
CREATE UNIQUE INDEX idx_price_groups_unique_name_category
ON price_groups(name, category)
WHERE is_active = true;
```

### En la aplicación

- Validar que al cambiar el precio de un grupo, se actualicen todos los productos asociados
- Verificar permisos de administrador antes de modificar grupos
- Auditar cambios de precios para trazabilidad

## 🎯 Próximos Pasos de Implementación

1. **Fase 1: Base de datos**

   - ✅ Crear tabla `price_groups`
   - ✅ Agregar columna `price_group_id` a `products`
   - ✅ Configurar RLS y políticas de seguridad

2. **Fase 2: Backend**

   - 🔄 Crear APIs para CRUD de grupos de precios
   - 🔄 Implementar lógica de actualización en lote
   - 🔄 Migrar datos existentes

3. **Fase 3: Frontend**

   - ✅ Conectar formularios con API real (actualmente usa mock data)
   - 🔄 Implementar funcionalidad completa en gestión de precios
   - 🔄 Agregar validaciones del lado cliente

4. **Fase 4: Testing y validación**
   - 🔄 Pruebas de integridad de datos
   - 🔄 Validación de precios actualizados
   - 🔄 Testing de performance con muchos productos

## ⚠️ Consideraciones Importantes

1. **Backup**: Realizar backup completo antes de ejecutar las migraciones
2. **Downtime**: Planificar ventana de mantenimiento para la migración
3. **Rollback**: Preparar scripts de rollback en caso de problemas
4. **Performance**: Monitorear performance después de agregar nuevas columnas e índices
5. **Auditoría**: Implementar logging de cambios de precios para trazabilidad

## 📋 Checklist de Migración

- [ ] Backup de base de datos
- [ ] Crear tabla `price_groups`
- [ ] Insertar datos iniciales de grupos
- [ ] Agregar columna `price_group_id` a `products`
- [ ] Configurar políticas RLS
- [ ] Migrar productos existentes
- [ ] Crear APIs backend
- [ ] Conectar frontend con APIs reales
- [ ] Testing completo
- [ ] Deploy a producción
- [ ] Verificación post-deploy

---

_Documentación generada el: 23 de Agosto, 2025_
_Estado: Preparado para implementación_
