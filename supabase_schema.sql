-- Crear tabla de categorías
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(50) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de productos
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category VARCHAR(100) NOT NULL REFERENCES categories(slug),
  image VARCHAR(500),
  stock INTEGER NOT NULL DEFAULT 0,
  unit VARCHAR(50) NOT NULL,
  brand VARCHAR(100),
  sku VARCHAR(100) UNIQUE NOT NULL,
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de usuarios
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

-- Crear tabla de órdenes
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

-- Crear tabla de items de orden
CREATE TABLE order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_featured ON products(featured);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear triggers para actualizar updated_at
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insertar datos de ejemplo para categorías (con manejo de conflictos)
INSERT INTO categories (name, description, icon, slug) VALUES
('Construcción', 'Materiales para construcción y obra', '🏗️', 'construccion'),
('Metalúrgica', 'Productos de acero y metal', '⚙️', 'metalurgica'),
('Herramientas', 'Herramientas manuales y eléctricas', '🔧', 'herramientas'),
('Herrería', 'Materiales de herrería', '⚡', 'herreria')
ON CONFLICT (slug) DO NOTHING;

-- Insertar datos de ejemplo para productos (con manejo de conflictos)
INSERT INTO products (name, description, price, category, image, stock, unit, brand, sku, featured) VALUES
('Cemento Portland', 'Cemento Portland de alta calidad para construcción', 850.00, 'construccion', '/images/cemento.jpg', 100, 'bolsa 50kg', 'ANCAP', 'CEM-001', true),
('Ladrillos Comunes', 'Ladrillos comunes para mampostería', 12.00, 'construccion', '/images/ladrillos.jpg', 5000, 'unidad', NULL, 'LAD-001', false),
('Arena Fina', 'Arena fina para construcción', 1200.00, 'construccion', '/images/arena.jpg', 50, 'm³', NULL, 'ARE-001', false),
('Piedra Partida', 'Piedra partida para hormigón', 1800.00, 'construccion', '/images/piedra.jpg', 30, 'm³', NULL, 'PIE-001', false),
('Hierro 6mm', 'Hierro de construcción 6mm', 45.00, 'metalurgica', '/images/hierro-6mm.jpg', 200, 'm', NULL, 'HIE-006', true),
('Hierro 8mm', 'Hierro de construcción 8mm', 80.00, 'metalurgica', '/images/hierro-8mm.jpg', 150, 'm', NULL, 'HIE-008', false),
('Hierro 12mm', 'Hierro de construcción 12mm', 180.00, 'metalurgica', '/images/hierro-12mm.jpg', 100, 'm', NULL, 'HIE-012', false),
('Alambre de Atar', 'Alambre galvanizado para atar hierros', 2800.00, 'metalurgica', '/images/alambre.jpg', 20, 'rollo 25kg', NULL, 'ALA-001', false),
('Martillo de Obra', 'Martillo de obra con mango de madera', 1200.00, 'herramientas', '/images/martillo.jpg', 25, 'unidad', 'Stanley', 'MAR-001', false),
('Taladro Eléctrico', 'Taladro eléctrico 13mm con maletín', 8500.00, 'herramientas', '/images/taladro.jpg', 10, 'unidad', 'Black & Decker', 'TAL-001', true),
('Nivel de Burbuja', 'Nivel de burbuja 60cm', 800.00, 'herramientas', '/images/nivel.jpg', 15, 'unidad', NULL, 'NIV-001', false),
('Alambre de Amarre', 'Alambre de amarre 1.5mm', 1200.00, 'herreria', '/images/alambre-herreria.jpg', 20, 'rollo 25kg', NULL, 'ALA-002', false)
ON CONFLICT (sku) DO NOTHING;

-- Configurar Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Políticas para productos (lectura pública)
CREATE POLICY "Productos visibles públicamente" ON products
  FOR SELECT USING (true);

-- Políticas para categorías (lectura pública)
CREATE POLICY "Categorías visibles públicamente" ON categories
  FOR SELECT USING (true);

-- Políticas para usuarios
CREATE POLICY "Usuarios pueden ver su propio perfil" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Usuarios pueden actualizar su propio perfil" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Usuarios pueden insertar su propio perfil" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Políticas para órdenes
CREATE POLICY "Usuarios pueden ver sus propias órdenes" ON orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden crear sus propias órdenes" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas para items de orden
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
