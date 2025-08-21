-- Políticas para permitir operaciones de administración en productos
-- IMPORTANTE: Estas políticas permiten operaciones sin autenticación para el admin panel
-- En producción, deberías implementar autenticación de admin adecuada

-- Política para permitir insertar productos (para el admin)
CREATE POLICY "Permitir insertar productos" ON products
  FOR INSERT WITH CHECK (true);

-- Política para permitir actualizar productos (para el admin)
CREATE POLICY "Permitir actualizar productos" ON products
  FOR UPDATE USING (true);

-- Política para permitir eliminar productos (para el admin)
CREATE POLICY "Permitir eliminar productos" ON products
  FOR DELETE USING (true);

-- Políticas similares para categorías si es necesario
CREATE POLICY "Permitir insertar categorías" ON categories
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir actualizar categorías" ON categories
  FOR UPDATE USING (true);

CREATE POLICY "Permitir eliminar categorías" ON categories
  FOR DELETE USING (true);

-- NOTA: En un entorno de producción, estas políticas deberían verificar
-- que el usuario tenga rol de administrador. Por ejemplo:
-- 
-- CREATE POLICY "Admin puede insertar productos" ON products
--   FOR INSERT WITH CHECK (
--     EXISTS (
--       SELECT 1 FROM user_roles 
--       WHERE user_id = auth.uid() AND role = 'admin'
--     )
--   );
