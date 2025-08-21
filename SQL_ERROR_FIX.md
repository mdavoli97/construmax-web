# 🚨 SOLUCIÓN AL ERROR DE SINTAXIS SQL

## ❌ Error Recibido:

```
ERROR: 42601: syntax error at or near ";"
LINE 1: ALTER TABLE products ALTER COLUMN primary_image TYPE TEXT;
```

## ⚡ SOLUCIONES (Prueba en este orden):

### **OPCIÓN 1: Comandos Individuales (RECOMENDADO)**

En Supabase SQL Editor, ejecuta **UNA LÍNEA A LA VEZ**:

```sql
ALTER TABLE product_images ALTER COLUMN image_url TYPE text;
```

Presiona Run, luego ejecuta:

```sql
ALTER TABLE products ALTER COLUMN primary_image TYPE text;
```

### **OPCIÓN 2: Si la Opción 1 falla**

Usa el script robusto que maneja errores:

```sql
DO $$
BEGIN
  ALTER TABLE product_images ALTER COLUMN image_url TYPE TEXT;
  RAISE NOTICE 'product_images.image_url cambiado exitosamente';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error: %', SQLERRM;
END $$;
```

### **OPCIÓN 3: Verificar Estado Actual**

Antes de hacer cambios, ejecuta esto para ver el estado:

```sql
SELECT
  table_name,
  column_name,
  data_type,
  character_maximum_length
FROM information_schema.columns
WHERE (table_name = 'product_images' AND column_name = 'image_url')
   OR (table_name = 'products' AND column_name = 'primary_image');
```

## 🔧 SOLUCIÓN TEMPORAL (Sin cambiar DB)

Si no puedes cambiar la base de datos ahora, **usa solo URLs externas**:

1. **En el paso 1:** Deja el campo de imagen en blanco
2. **En el paso 2:** Usa solo "Agregar por URL"
3. **No uses drag & drop** hasta que se arregle la DB

### **Cómo subir tu imagen de 100KB:**

1. Sube la imagen a [imgur.com](https://imgur.com) o [postimg.cc](https://postimg.cc)
2. Copia la URL directa de la imagen
3. Pégala en "Agregar por URL"

## 🎯 Estado Esperado Después del Fix:

```
table_name       | column_name    | data_type | character_maximum_length
product_images   | image_url      | text      | null
products         | primary_image  | text      | null
```

**¡Prueba la Opción 1 primero - debería funcionar!**
