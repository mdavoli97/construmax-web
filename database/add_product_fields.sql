-- Migración: Agregar campos para perfiles a la tabla products
-- Fecha: 2025-08-24
-- Descripción: Agregar columnas para manejar perfiles de hierro con precios por kg

-- Agregar columnas para productos tipo perfiles
ALTER TABLE products 
ADD COLUMN product_type VARCHAR(50) DEFAULT 'standard',
ADD COLUMN weight_per_unit DECIMAL(10,4),
ADD COLUMN price_per_kg DECIMAL(10,4),
ADD COLUMN stock_type VARCHAR(50) DEFAULT 'quantity',
ADD COLUMN is_available BOOLEAN DEFAULT true;

-- Crear índices para mejorar rendimiento
CREATE INDEX idx_products_product_type ON products(product_type);
CREATE INDEX idx_products_stock_type ON products(stock_type);

-- Comentarios explicativos
COMMENT ON COLUMN products.product_type IS 'Tipo de producto: standard, perfiles, etc.';
COMMENT ON COLUMN products.weight_per_unit IS 'Peso por unidad en kg (para perfiles)';
COMMENT ON COLUMN products.price_per_kg IS 'Precio por kilogramo en USD (para perfiles)';
COMMENT ON COLUMN products.stock_type IS 'Tipo de manejo de stock: quantity, availability';
COMMENT ON COLUMN products.is_available IS 'Disponibilidad del producto (para stock tipo availability)';
