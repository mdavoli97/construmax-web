-- Actualización del esquema para soporte de imágenes múltiples

-- Modificar la tabla products para cambiar el campo image
ALTER TABLE products 
DROP COLUMN IF EXISTS image;

-- Agregar campos para múltiples imágenes
ALTER TABLE products 
ADD COLUMN primary_image VARCHAR(500),
ADD COLUMN images JSONB DEFAULT '[]'::jsonb;

-- Crear tabla para gestionar imágenes de productos (alternativa más robusta)
CREATE TABLE IF NOT EXISTS product_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url VARCHAR(500) NOT NULL,
  alt_text VARCHAR(255),
  is_primary BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_primary ON product_images(product_id, is_primary);
CREATE INDEX IF NOT EXISTS idx_product_images_order ON product_images(product_id, display_order);

-- Agregar algunas imágenes de ejemplo (puedes cambiar estas URLs por las reales)
-- Ejemplo para productos de construcción
INSERT INTO products (name, description, price, category, primary_image, stock, unit, brand, sku, featured) VALUES
('Cemento Portland Tipo I', 'Cemento de alta calidad para construcción general', 450.00, 'construccion', 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=500', 100, 'bolsa', 'Ancap', 'CEM001', true),
('Arena Fina', 'Arena fina para mezclas y revoques', 280.00, 'construccion', 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?w=500', 500, 'm³', 'Canteras del Sur', 'ARE001', false),
('Ladrillo Hueco', 'Ladrillo hueco 8cm para tabiquería', 25.50, 'construccion', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500', 1000, 'unidad', 'Cerámicas del Norte', 'LAD001', false);

-- Insertar imágenes adicionales para los productos
INSERT INTO product_images (product_id, image_url, alt_text, is_primary, display_order) 
SELECT 
  p.id,
  p.primary_image,
  'Imagen principal de ' || p.name,
  true,
  0
FROM products p 
WHERE p.primary_image IS NOT NULL;

-- Políticas de seguridad para product_images
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

-- Política para lectura pública de imágenes
CREATE POLICY "Las imágenes de productos son públicas" ON product_images
  FOR SELECT USING (true);

-- Política para inserción/actualización por administradores
CREATE POLICY "Solo administradores pueden gestionar imágenes de productos" ON product_images
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'admin@construmax.com'
    )
  );
