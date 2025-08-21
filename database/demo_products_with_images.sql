-- Script de demostración con productos e imágenes reales

-- Limpiar datos existentes
DELETE FROM product_images;
DELETE FROM products;

-- Insertar productos con imágenes de Unsplash
INSERT INTO products (id, name, description, price, category, primary_image, stock, unit, brand, sku, featured, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Cemento Portland Tipo I', 'Cemento de alta calidad para construcción general. Ideal para fundaciones, estructuras y obras de hormigón armado.', 450.00, 'construccion', 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&q=80', 100, 'bolsa', 'Ancap', 'CEM001', true, NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'Arena Fina Lavada', 'Arena fina de río lavada, perfecta para mezclas de hormigón y revoques finos.', 280.00, 'construccion', 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?w=800&q=80', 500, 'm³', 'Canteras del Sur', 'ARE001', false, NOW()),
('550e8400-e29b-41d4-a716-446655440003', 'Ladrillo Hueco 8cm', 'Ladrillo hueco de 8cm para tabiquería interior. Excelente aislación térmica y acústica.', 25.50, 'construccion', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80', 1000, 'unidad', 'Cerámicas del Norte', 'LAD001', true, NOW()),
('550e8400-e29b-41d4-a716-446655440004', 'Hierro del 8', 'Barra de hierro corrugado de 8mm de diámetro. Ideal para estructuras de hormigón armado.', 85.00, 'metalurgica', 'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=800&q=80', 200, 'barra', 'Siderúrgica Nacional', 'HIE008', false, NOW()),
('550e8400-e29b-41d4-a716-446655440005', 'Chapa Galvanizada', 'Chapa galvanizada ondulada de 0.5mm. Resistente a la corrosión.', 1200.00, 'metalurgica', 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80', 50, 'm²', 'Metalúrgica del Este', 'CHA005', false, NOW()),
('550e8400-e29b-41d4-a716-446655440006', 'Taladro Percutor', 'Taladro percutor profesional 850W con portabrocas de 13mm.', 3500.00, 'herramientas', 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=800&q=80', 25, 'unidad', 'Bosch', 'TAL850', true, NOW()),
('550e8400-e29b-41d4-a716-446655440007', 'Amoladora Angular', 'Amoladora angular 115mm 900W para corte y desbaste.', 2800.00, 'herramientas', 'https://images.unsplash.com/photo-1609464158594-74e7d0c57c74?w=800&q=80', 15, 'unidad', 'Makita', 'AMO115', false, NOW()),
('550e8400-e29b-41d4-a716-446655440008', 'Soldadora Inverter', 'Soldadora inverter 200A profesional. Ideal para electrodo y TIG.', 15500.00, 'herreria', 'https://images.unsplash.com/photo-1610578239812-ea11ba59c30d?w=800&q=80', 8, 'unidad', 'Lincoln Electric', 'SOL200', true, NOW());

-- Insertar imágenes adicionales para algunos productos
INSERT INTO product_images (product_id, image_url, alt_text, is_primary, display_order, created_at) VALUES
-- Cemento Portland - imágenes adicionales
('550e8400-e29b-41d4-a716-446655440001', 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&q=80', 'Cemento Portland Tipo I - Vista principal', true, 0, NOW()),
('550e8400-e29b-41d4-a716-446655440001', 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80', 'Cemento Portland - Aplicación en obra', false, 1, NOW()),
('550e8400-e29b-41d4-a716-446655440001', 'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=800&q=80', 'Cemento Portland - Detalle del producto', false, 2, NOW()),

-- Arena Fina - imágenes adicionales  
('550e8400-e29b-41d4-a716-446655440002', 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?w=800&q=80', 'Arena Fina Lavada - Vista principal', true, 0, NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&q=80', 'Arena Fina - Textura y granulometría', false, 1, NOW()),

-- Taladro Percutor - imágenes adicionales
('550e8400-e29b-41d4-a716-446655440006', 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=800&q=80', 'Taladro Percutor Bosch - Vista principal', true, 0, NOW()),
('550e8400-e29b-41d4-a716-446655440006', 'https://images.unsplash.com/photo-1609464158594-74e7d0c57c74?w=800&q=80', 'Taladro Percutor - Accesorios incluidos', false, 1, NOW()),
('550e8400-e29b-41d4-a716-446655440006', 'https://images.unsplash.com/photo-1610578239812-ea11ba59c30d?w=800&q=80', 'Taladro Percutor - En uso', false, 2, NOW()),

-- Soldadora Inverter - imágenes adicionales
('550e8400-e29b-41d4-a716-446655440008', 'https://images.unsplash.com/photo-1610578239812-ea11ba59c30d?w=800&q=80', 'Soldadora Inverter Lincoln - Vista principal', true, 0, NOW()),
('550e8400-e29b-41d4-a716-446655440008', 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=800&q=80', 'Soldadora Inverter - Panel de control', false, 1, NOW());
