-- =============================================================================
-- SCRIPT COMPLETO PARA RECREAR BASE DE DATOS SUPABASE
-- =============================================================================
-- Descripción: Script completo que incluye esquema base + cambios pendientes
-- Fecha: 24 de Agosto, 2025
-- Uso: Ejecutar en nueva cuenta de Supabase para recrear toda la BD
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. EXTENSIONES NECESARIAS
-- -----------------------------------------------------------------------------

-- Habilitar extensiones UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------------------
-- 2. CREAR TABLA DE CATEGORÍAS
-- -----------------------------------------------------------------------------

CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(50) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 3. CREAR TABLA DE PRODUCTOS (CON CAMPOS EXTENDIDOS)
-- -----------------------------------------------------------------------------

CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category VARCHAR(100) NOT NULL REFERENCES categories(slug),
  primary_image VARCHAR(500),
  images JSONB DEFAULT '[]'::jsonb,
  stock INTEGER NOT NULL DEFAULT 0,
  unit VARCHAR(50) NOT NULL,
  brand VARCHAR(100),
  sku VARCHAR(100) UNIQUE NOT NULL,
  featured BOOLEAN DEFAULT FALSE,
  
  -- CAMPOS NUEVOS PARA TIPOS DE PRODUCTOS
  product_type VARCHAR(20) DEFAULT 'standard',
  weight_per_unit DECIMAL(10,3), -- Para perfiles: peso por unidad en kg
  price_per_kg DECIMAL(10,2), -- Para perfiles: precio por kilogramo
  stock_type VARCHAR(20) DEFAULT 'quantity', -- 'quantity' o 'availability'
  is_available BOOLEAN DEFAULT true, -- Para stock tipo availability
  price_group_id UUID REFERENCES price_groups(id), -- Referencia al grupo de precios
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 4. TABLA DE IMÁGENES DE PRODUCTOS
-- -----------------------------------------------------------------------------

CREATE TABLE product_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url VARCHAR(500) NOT NULL,
  alt_text VARCHAR(255),
  is_primary BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 5. TABLA DE GRUPOS DE PRECIOS
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
  created_by UUID,
  updated_by UUID,
  
  -- Constraints
  CONSTRAINT check_positive_price CHECK (price_per_kg_usd > 0),
  CONSTRAINT check_valid_category CHECK (category IN ('construccion', 'metalurgica', 'herramientas', 'herreria'))
);

-- -----------------------------------------------------------------------------
-- 6. CREAR TABLA DE USUARIOS
-- -----------------------------------------------------------------------------

CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  address TEXT,
  city VARCHAR(100),
  zip_code VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 7. CREAR TABLA DE ÓRDENES
-- -----------------------------------------------------------------------------

CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'shipped', 'delivered', 'cancelled')),
  total DECIMAL(10,2) NOT NULL,
  shipping_address TEXT NOT NULL,
  shipping_city VARCHAR(100) NOT NULL,
  shipping_zip VARCHAR(20) NOT NULL,
  payment_method VARCHAR(100) NOT NULL,
  payment_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 8. CREAR TABLA DE ITEMS DE ORDEN
-- -----------------------------------------------------------------------------

CREATE TABLE order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 9. CONSTRAINTS Y VALIDACIONES PARA PRODUCTOS
-- -----------------------------------------------------------------------------

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
COMMENT ON COLUMN products.price_group_id IS 'Referencia al grupo de precios (para perfiles)';

-- -----------------------------------------------------------------------------
-- 10. CREAR ÍNDICES PARA OPTIMIZAR CONSULTAS
-- -----------------------------------------------------------------------------

-- Índices para productos
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_featured ON products(featured);
CREATE INDEX idx_products_type ON products(product_type);
CREATE INDEX idx_products_stock_type ON products(stock_type);
CREATE INDEX idx_products_availability ON products(is_available) WHERE stock_type = 'availability';
CREATE INDEX idx_products_price_group ON products(price_group_id);

-- Índices para imágenes de productos
CREATE INDEX idx_product_images_product_id ON product_images(product_id);
CREATE INDEX idx_product_images_primary ON product_images(product_id, is_primary);
CREATE INDEX idx_product_images_order ON product_images(product_id, display_order);

-- Índices para grupos de precios
CREATE INDEX idx_price_groups_category ON price_groups(category);
CREATE INDEX idx_price_groups_active ON price_groups(is_active);
CREATE INDEX idx_price_groups_category_active ON price_groups(category, is_active);
CREATE UNIQUE INDEX idx_price_groups_unique_name_category 
ON price_groups(name, category) 
WHERE is_active = true;

-- Índices para órdenes
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- -----------------------------------------------------------------------------
-- 11. FUNCIONES Y TRIGGERS
-- -----------------------------------------------------------------------------

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Función para validar datos de productos
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

-- -----------------------------------------------------------------------------
-- 12. CREAR TRIGGERS
-- -----------------------------------------------------------------------------

-- Triggers para actualizar updated_at
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_price_groups_updated_at BEFORE UPDATE ON price_groups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger para validar datos de productos
CREATE TRIGGER trigger_validate_product_data
  BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION validate_product_data();

-- -----------------------------------------------------------------------------
-- 13. CONFIGURAR ROW LEVEL SECURITY (RLS)
-- -----------------------------------------------------------------------------

-- Habilitar RLS en todas las tablas
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- 14. POLÍTICAS DE SEGURIDAD - LECTURA PÚBLICA
-- -----------------------------------------------------------------------------

-- Productos visibles públicamente
CREATE POLICY "Productos visibles públicamente" ON products
  FOR SELECT USING (true);

-- Categorías visibles públicamente
CREATE POLICY "Categorías visibles públicamente" ON categories
  FOR SELECT USING (true);

-- Imágenes de productos visibles públicamente
CREATE POLICY "Las imágenes de productos son públicas" ON product_images
  FOR SELECT USING (true);

-- Grupos de precios visibles públicamente (solo activos)
CREATE POLICY "Grupos de precios públicos" ON price_groups
  FOR SELECT USING (is_active = true);

-- -----------------------------------------------------------------------------
-- 15. POLÍTICAS DE SEGURIDAD - ADMINISTRACIÓN
-- -----------------------------------------------------------------------------

-- IMPORTANTE: Estas son políticas temporales para desarrollo
-- En producción implementar autenticación de admin adecuada

-- Permitir operaciones CRUD en productos
CREATE POLICY "Permitir insertar productos" ON products
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir actualizar productos" ON products
  FOR UPDATE USING (true);

CREATE POLICY "Permitir eliminar productos" ON products
  FOR DELETE USING (true);

-- Permitir operaciones CRUD en categorías
CREATE POLICY "Permitir insertar categorías" ON categories
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir actualizar categorías" ON categories
  FOR UPDATE USING (true);

CREATE POLICY "Permitir eliminar categorías" ON categories
  FOR DELETE USING (true);

-- Permitir operaciones CRUD en imágenes de productos
CREATE POLICY "Permitir gestionar imágenes de productos" ON product_images
  FOR ALL USING (true);

-- Permitir operaciones CRUD en grupos de precios
CREATE POLICY "Permitir gestionar grupos de precios" ON price_groups
  FOR ALL USING (true);

-- -----------------------------------------------------------------------------
-- 16. POLÍTICAS DE SEGURIDAD - USUARIOS
-- -----------------------------------------------------------------------------

-- Usuarios pueden ver su propio perfil
CREATE POLICY "Usuarios pueden ver su propio perfil" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Usuarios pueden actualizar su propio perfil" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Usuarios pueden insertar su propio perfil" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Usuarios pueden ver sus propias órdenes
CREATE POLICY "Usuarios pueden ver sus propias órdenes" ON orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden crear sus propias órdenes" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Usuarios pueden ver items de sus órdenes
CREATE POLICY "Usuarios pueden ver items de sus órdenes" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Usuarios pueden crear items en sus órdenes" ON order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

-- -----------------------------------------------------------------------------
-- 17. DATOS INICIALES - CATEGORÍAS
-- -----------------------------------------------------------------------------

INSERT INTO categories (name, description, icon, slug) VALUES
('Construcción', 'Materiales para construcción y obra', '🏗️', 'construccion'),
('Metalúrgica', 'Productos de acero y metal', '⚙️', 'metalurgica'),
('Herramientas', 'Herramientas manuales y eléctricas', '🔧', 'herramientas'),
('Herrería', 'Materiales de herrería', '⚡', 'herreria')
ON CONFLICT (slug) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 18. DATOS INICIALES - GRUPOS DE PRECIOS
-- -----------------------------------------------------------------------------

INSERT INTO price_groups (name, description, price_per_kg_usd, category) VALUES
-- Grupos para categoría metalúrgica
('Hierros Redondos', 'Hierros redondos de construcción de diferentes diámetros', 0.85, 'metalurgica'),
('Perfiles L', 'Perfiles angulares de hierro', 0.92, 'metalurgica'),
('Perfiles U', 'Perfiles en U de hierro', 0.95, 'metalurgica'),
('Perfiles C', 'Perfiles en C de hierro', 0.95, 'metalurgica'),
('Chapas', 'Chapas de hierro de diferentes espesores', 1.05, 'metalurgica'),
('Tubos Estructurales', 'Tubos cuadrados y rectangulares', 1.15, 'metalurgica'),
('Tubos Redondos', 'Tubos redondos de hierro', 1.20, 'metalurgica'),
('Barras Planas', 'Barras planas de hierro', 0.90, 'metalurgica'),

-- Grupos para herrería
('Elementos Decorativos', 'Elementos ornamentales para herrería', 2.50, 'herreria'),
('Barrotes y Rejas', 'Materiales para rejas y portones', 1.30, 'herreria'),
('Herrajes', 'Herrajes y accesorios para puertas y ventanas', 3.00, 'herreria')
ON CONFLICT DO NOTHING;

-- -----------------------------------------------------------------------------
-- 19. DATOS INICIALES - PRODUCTOS DE EJEMPLO
-- -----------------------------------------------------------------------------

INSERT INTO products (name, description, price, category, primary_image, stock, unit, brand, sku, featured, product_type, weight_per_unit, price_per_kg, stock_type, is_available) VALUES
-- Productos estándar
('Cemento Portland', 'Cemento Portland de alta calidad para construcción', 850.00, 'construccion', 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=500', 100, 'bolsa 50kg', 'ANCAP', 'CEM-001', true, 'standard', NULL, NULL, 'quantity', true),
('Ladrillos Comunes', 'Ladrillos comunes para mampostería', 12.00, 'construccion', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500', 5000, 'unidad', 'Cerámicas Norte', 'LAD-001', false, 'standard', NULL, NULL, 'quantity', true),
('Arena Fina', 'Arena fina para construcción', 1200.00, 'construccion', 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?w=500', 50, 'm³', 'Canteras Sur', 'ARE-001', false, 'standard', NULL, NULL, 'quantity', true),

-- Perfiles (precios calculados automáticamente por trigger)
('Hierro Redondo 6mm', 'Hierro de construcción redondo de 6mm', 0.00, 'metalurgica', NULL, 0, 'kg', 'Aceros del Uruguay', 'HIE-006', true, 'perfiles', 0.222, 85.00, 'availability', true),
('Hierro Redondo 8mm', 'Hierro de construcción redondo de 8mm', 0.00, 'metalurgica', NULL, 0, 'kg', 'Aceros del Uruguay', 'HIE-008', false, 'perfiles', 0.395, 85.00, 'availability', true),
('Hierro Redondo 12mm', 'Hierro de construcción redondo de 12mm', 0.00, 'metalurgica', NULL, 0, 'kg', 'Aceros del Uruguay', 'HIE-012', false, 'perfiles', 0.888, 85.00, 'availability', true),
('Perfil L 25x25x3', 'Perfil angular 25x25x3mm', 0.00, 'metalurgica', NULL, 0, 'kg', 'Aceros del Uruguay', 'PL-252503', false, 'perfiles', 1.110, 92.00, 'availability', true),
('Perfil U 50x25x3', 'Perfil en U 50x25x3mm', 0.00, 'metalurgica', NULL, 0, 'kg', 'Aceros del Uruguay', 'PU-502503', false, 'perfiles', 1.780, 95.00, 'availability', true),

-- Herramientas
('Martillo de Obra', 'Martillo de obra con mango de madera', 1200.00, 'herramientas', NULL, 25, 'unidad', 'Stanley', 'MAR-001', false, 'standard', NULL, NULL, 'quantity', true),
('Taladro Eléctrico', 'Taladro eléctrico 13mm con maletín', 8500.00, 'herramientas', NULL, 10, 'unidad', 'Black & Decker', 'TAL-001', true, 'standard', NULL, NULL, 'quantity', true),

-- Herrería
('Alambre de Amarre', 'Alambre de amarre 1.5mm', 1200.00, 'herreria', NULL, 20, 'rollo 25kg', 'Aceros del Uruguay', 'ALA-002', false, 'standard', NULL, NULL, 'quantity', true)
ON CONFLICT (sku) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 20. INSERTAR IMÁGENES PARA PRODUCTOS QUE TENGAN primary_image
-- -----------------------------------------------------------------------------

INSERT INTO product_images (product_id, image_url, alt_text, is_primary, display_order) 
SELECT 
  p.id,
  p.primary_image,
  'Imagen principal de ' || p.name,
  true,
  0
FROM products p 
WHERE p.primary_image IS NOT NULL;

-- =============================================================================
-- SCRIPT COMPLETADO
-- =============================================================================
-- 
-- PRÓXIMOS PASOS DESPUÉS DE EJECUTAR ESTE SCRIPT:
-- 
-- 1. Configurar las variables de entorno con la nueva URL y keys de Supabase
-- 2. Verificar que todas las políticas de seguridad funcionen correctamente
-- 3. Probar el panel de admin y las operaciones CRUD
-- 4. Agregar productos reales con sus respectivas imágenes
-- 5. Configurar autenticación de admin en producción
-- 
-- NOTAS DE SEGURIDAD:
-- - Las políticas actuales permiten operaciones sin autenticación (desarrollo)
-- - Para producción, implementar autenticación de admin robusta
-- - Revisar y ajustar políticas según necesidades específicas
-- 
-- =============================================================================
