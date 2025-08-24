-- Migración: Agregar price_group_id a la tabla products
-- Fecha: 2025-08-24
-- Descripción: Agregar columna price_group_id para asociar productos con grupos de precios

-- Agregar la columna price_group_id a la tabla products
ALTER TABLE products 
ADD COLUMN price_group_id UUID REFERENCES price_groups(id) ON DELETE SET NULL;

-- Crear índice para mejorar el rendimiento de consultas por grupo de precios
CREATE INDEX idx_products_price_group_id ON products(price_group_id);

-- Comentario explicativo
COMMENT ON COLUMN products.price_group_id IS 'Referencia al grupo de precios al que pertenece el producto';
