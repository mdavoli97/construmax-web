-- =============================================================================
-- MIGRACIÓN PARA SISTEMA DE GESTIÓN DE PRECIOS POR GRUPOS
-- =============================================================================
-- Descripción: Scripts SQL para implementar el sistema de grupos de precios
-- Fecha: 23 de Agosto, 2025
-- Versión: 1.0
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. CREAR TABLA PRICE_GROUPS
-- -----------------------------------------------------------------------------

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
  updated_by UUID REFERENCES auth.users(id),
  
  -- Constraints
  CONSTRAINT check_positive_price CHECK (price_per_kg_usd > 0),
  CONSTRAINT check_valid_category CHECK (category IN ('construccion', 'metalurgica', 'herramientas', 'herreria'))
);

-- -----------------------------------------------------------------------------
-- 2. CREAR ÍNDICES
-- -----------------------------------------------------------------------------

-- Índice para búsquedas por categoría
CREATE INDEX idx_price_groups_category ON price_groups(category);

-- Índice para grupos activos
CREATE INDEX idx_price_groups_active ON price_groups(is_active);

-- Índice compuesto para búsquedas frecuentes
CREATE INDEX idx_price_groups_category_active ON price_groups(category, is_active);

-- Índice único para nombres por categoría (solo activos)
CREATE UNIQUE INDEX idx_price_groups_unique_name_category 
ON price_groups(name, category) 
WHERE is_active = true;

-- -----------------------------------------------------------------------------
-- 3. INSERTAR DATOS INICIALES
-- -----------------------------------------------------------------------------

INSERT INTO price_groups (name, description, price_per_kg_usd, category) VALUES
('Caños Estructurales', 'Caños tubulares para estructura metálica', 1.25, 'metalurgica'),
('Perfiles Tubulares', 'Perfiles tubulares rectangulares y cuadrados', 1.35, 'metalurgica'),
('Hierros de Construcción', 'Hierros y varillas para construcción', 1.10, 'construccion'),
('Perfiles Angulares', 'Ángulos y perfiles en L', 1.20, 'metalurgica'),
('Chapas Metálicas', 'Chapas de diferentes espesores', 1.40, 'metalurgica'),
('Tubos Galvanizados', 'Tubos galvanizados para plomería', 1.30, 'construccion'),
('Perfiles C y U', 'Perfiles en C y U para estructura', 1.28, 'metalurgica'),
('Barras Redondas', 'Barras redondas de acero', 1.15, 'metalurgica');

-- -----------------------------------------------------------------------------
-- 4. MODIFICAR TABLA PRODUCTS
-- -----------------------------------------------------------------------------

-- Agregar columna para vincular con grupos de precios
ALTER TABLE products 
ADD COLUMN price_group_id UUID REFERENCES price_groups(id);

-- Crear índice para la nueva columna
CREATE INDEX idx_products_price_group ON products(price_group_id);

-- -----------------------------------------------------------------------------
-- 5. CONFIGURAR ROW LEVEL SECURITY
-- -----------------------------------------------------------------------------

-- Habilitar RLS en price_groups
ALTER TABLE price_groups ENABLE ROW LEVEL SECURITY;

-- Política para lectura (usuarios autenticados pueden ver grupos)
CREATE POLICY "Usuarios pueden ver grupos de precios" ON price_groups
FOR SELECT TO authenticated
USING (is_active = true);

-- Política para administradores (crear, actualizar, eliminar)
CREATE POLICY "Solo admins pueden modificar grupos de precios" ON price_groups
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- -----------------------------------------------------------------------------
-- 6. CREAR FUNCIONES AUXILIARES
-- -----------------------------------------------------------------------------

-- Función para actualizar timestamps automáticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  IF auth.uid() IS NOT NULL THEN
    NEW.updated_by = auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para price_groups
CREATE TRIGGER price_groups_updated_at
  BEFORE UPDATE ON price_groups
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Función para contar productos por grupo
CREATE OR REPLACE FUNCTION get_product_count_by_price_group(group_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*) 
    FROM products 
    WHERE price_group_id = group_id 
    AND (
      CASE 
        WHEN description ~ '^[\[\{]' THEN 
          (description::json->>'is_available')::boolean 
        ELSE true 
      END
    ) = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- -----------------------------------------------------------------------------
-- 7. CREAR VISTAS
-- -----------------------------------------------------------------------------

CREATE OR REPLACE VIEW price_groups_with_stats AS
SELECT 
  pg.id,
  pg.name,
  pg.description,
  pg.price_per_kg_usd,
  pg.category,
  pg.is_active,
  pg.created_at,
  pg.updated_at,
  pg.created_by,
  pg.updated_by,
  COALESCE(stats.product_count, 0) as product_count,
  COALESCE(stats.avg_product_price, 0) as avg_product_price,
  COALESCE(stats.min_product_price, 0) as min_product_price,
  COALESCE(stats.max_product_price, 0) as max_product_price
FROM price_groups pg
LEFT JOIN (
  SELECT 
    price_group_id,
    COUNT(*) as product_count,
    AVG(price) as avg_product_price,
    MIN(price) as min_product_price,
    MAX(price) as max_product_price
  FROM products 
  WHERE price_group_id IS NOT NULL
  AND (
    CASE 
      WHEN description ~ '^[\[\{]' THEN 
        (description::json->>'is_available')::boolean 
      ELSE true 
    END
  ) = true
  GROUP BY price_group_id
) stats ON pg.id = stats.price_group_id
WHERE pg.is_active = true;

-- -----------------------------------------------------------------------------
-- 8. MIGRACIÓN DE DATOS EXISTENTES
-- -----------------------------------------------------------------------------

-- Crear tabla temporal para mapeo
CREATE TEMP TABLE product_group_mapping AS
SELECT DISTINCT
  p.id as product_id,
  p.category,
  p.name as product_name,
  CASE 
    WHEN p.category = 'metalurgica' AND (p.name ILIKE '%caño%' OR p.name ILIKE '%tubo%') AND p.name NOT ILIKE '%galvanizado%' THEN 'Caños Estructurales'
    WHEN p.category = 'metalurgica' AND p.name ILIKE '%perfil%' AND (p.name ILIKE '%tubular%' OR p.name ILIKE '%rectangular%' OR p.name ILIKE '%cuadrado%') THEN 'Perfiles Tubulares'
    WHEN p.category = 'construccion' AND (p.name ILIKE '%hierro%' OR p.name ILIKE '%varilla%') THEN 'Hierros de Construcción'
    WHEN p.category = 'metalurgica' AND (p.name ILIKE '%angular%' OR p.name ILIKE '%ángulo%' OR p.name ILIKE '%perfil l%') THEN 'Perfiles Angulares'
    WHEN p.category = 'metalurgica' AND p.name ILIKE '%chapa%' THEN 'Chapas Metálicas'
    WHEN p.category = 'construccion' AND p.name ILIKE '%galvanizado%' THEN 'Tubos Galvanizados'
    WHEN p.category = 'metalurgica' AND (p.name ILIKE '%perfil c%' OR p.name ILIKE '%perfil u%') THEN 'Perfiles C y U'
    WHEN p.category = 'metalurgica' AND (p.name ILIKE '%barra%' OR p.name ILIKE '%redond%') THEN 'Barras Redondas'
    -- Grupos por defecto según categoría
    WHEN p.category = 'metalurgica' THEN 'Caños Estructurales'
    WHEN p.category = 'construccion' THEN 'Hierros de Construcción'
    ELSE 'Caños Estructurales'
  END as group_name
FROM products p
WHERE p.description IS NOT NULL 
AND (
  p.description ~ '^[\[\{]' 
  AND p.description::json->>'product_type' = 'perfiles'
);

-- Mostrar resumen del mapeo (para verificación)
SELECT 
  category,
  group_name,
  COUNT(*) as product_count
FROM product_group_mapping 
GROUP BY category, group_name
ORDER BY category, group_name;

-- Actualizar productos con sus grupos correspondientes
UPDATE products 
SET price_group_id = pg.id
FROM product_group_mapping pgm
JOIN price_groups pg ON pg.name = pgm.group_name
WHERE products.id = pgm.product_id;

-- Verificar la migración
SELECT 
  pg.name as group_name,
  pg.category,
  COUNT(p.id) as products_migrated
FROM price_groups pg
LEFT JOIN products p ON pg.id = p.price_group_id
GROUP BY pg.id, pg.name, pg.category
ORDER BY pg.category, pg.name;

-- Limpiar tabla temporal
DROP TABLE product_group_mapping;

-- -----------------------------------------------------------------------------
-- 9. VERIFICACIONES POST-MIGRACIÓN
-- -----------------------------------------------------------------------------

-- Verificar que no hay precios negativos
SELECT COUNT(*) as invalid_prices 
FROM price_groups 
WHERE price_per_kg_usd <= 0;

-- Verificar que todos los productos perfiles tienen grupo asignado
SELECT COUNT(*) as products_without_group
FROM products 
WHERE description ~ '^[\[\{]' 
AND description::json->>'product_type' = 'perfiles'
AND price_group_id IS NULL;

-- Verificar estadísticas de la vista
SELECT * FROM price_groups_with_stats ORDER BY category, name;

-- -----------------------------------------------------------------------------
-- 10. SCRIPTS DE ROLLBACK (EN CASO DE PROBLEMAS)
-- -----------------------------------------------------------------------------

/*
-- ROLLBACK: Eliminar columna price_group_id de products
ALTER TABLE products DROP COLUMN IF EXISTS price_group_id;

-- ROLLBACK: Eliminar tabla price_groups
DROP TABLE IF EXISTS price_groups CASCADE;

-- ROLLBACK: Eliminar vista
DROP VIEW IF EXISTS price_groups_with_stats;

-- ROLLBACK: Eliminar función
DROP FUNCTION IF EXISTS get_product_count_by_price_group(UUID);
DROP FUNCTION IF EXISTS update_updated_at();
*/

-- =============================================================================
-- FIN DE LA MIGRACIÓN
-- =============================================================================

-- Mensaje de confirmación
DO $$
BEGIN
  RAISE NOTICE 'Migración completada exitosamente!';
  RAISE NOTICE 'Grupos de precios creados: %', (SELECT COUNT(*) FROM price_groups);
  RAISE NOTICE 'Productos migrados: %', (SELECT COUNT(*) FROM products WHERE price_group_id IS NOT NULL);
END $$;
