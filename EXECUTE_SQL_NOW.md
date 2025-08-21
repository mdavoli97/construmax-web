🚨 **ACCIÓN REQUERIDA: Actualizar Base de Datos**

## Error actual:

```
Error adding product image: {
  code: '22001',
  details: null,
  hint: null,
  message: 'value too long for type character varying(500)'
}
```

## ⚡ SOLUCIÓN INMEDIATA

**DEBES ejecutar este comando en tu Supabase SQL Editor AHORA:**

```sql
-- Copia y pega esto en Supabase SQL Editor y haz clic en "Run"
ALTER TABLE product_images ALTER COLUMN image_url TYPE VARCHAR(1000);
ALTER TABLE products ALTER COLUMN primary_image TYPE VARCHAR(1000);
```

## 📍 Pasos detallados:

1. **Ve a tu panel de Supabase**

   - Abre https://app.supabase.com
   - Selecciona tu proyecto

2. **Navega al SQL Editor**

   - En el menú lateral, busca "SQL Editor"
   - Haz clic en él

3. **Ejecuta el comando**

   - Copia el SQL de arriba
   - Pégalo en el editor
   - Haz clic en "Run" o presiona Ctrl+Enter

4. **Verifica que funcionó**
   - Deberías ver un mensaje de éxito
   - Prueba subir una imagen nuevamente

## ✅ Una vez ejecutado:

- ✅ Los API routes ya están actualizados para Next.js 15
- ✅ Las validaciones en frontend ya están implementadas
- ✅ El sistema manejará URLs de hasta 1000 caracteres
- ✅ El drag & drop funcionará correctamente

**¡Ejecuta el SQL ahora y prueba de nuevo!**
