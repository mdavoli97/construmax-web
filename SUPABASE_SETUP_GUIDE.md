# 🚀 GUÍA COMPLETA PARA RECREAR SUPABASE

## 📋 Pasos para Configurar Nueva Cuenta Supabase

### 1. **Crear Nueva Cuenta Supabase**

- Ve a [supabase.com](https://supabase.com)
- Regístrate con tu email
- Verifica tu cuenta

### 2. **Crear Nuevo Proyecto**

- Haz clic en "New Project"
- Elige un nombre para tu proyecto (ej: "construmax-web")
- Selecciona región más cercana (ej: South America)
- Genera una contraseña segura para la base de datos
- **⚠️ IMPORTANTE: Guarda la contraseña en lugar seguro**

### 3. **Ejecutar Script de Base de Datos**

Una vez que el proyecto esté listo:

1. Ve a **SQL Editor** en el panel izquierdo
2. Copia todo el contenido del archivo `SUPABASE_COMPLETE_SETUP.sql`
3. Pégalo en el editor SQL
4. Haz clic en **"Run"** para ejecutar todo el script

### 4. **Configurar Variables de Entorno**

Después de crear el proyecto, obtén las credenciales:

1. Ve a **Settings** → **API**
2. Copia los siguientes valores:
   - **Project URL**
   - **anon public key**
   - **service_role key** (mantén esta secreta)

### 5. **Actualizar Archivo `.env.local`**

Crea o actualiza el archivo `.env.local` en la raíz del proyecto:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=tu_project_url_aquí
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aquí
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aquí

# Otras variables que ya tenías
CLOUDINARY_CLOUD_NAME=tu_cloudinary_name
CLOUDINARY_API_KEY=tu_cloudinary_key
CLOUDINARY_API_SECRET=tu_cloudinary_secret
MERCADO_PAGO_ACCESS_TOKEN=tu_mp_token
```

### 6. **Verificar Configuración**

Ejecuta estos comandos para verificar que todo funciona:

```bash
# Instalar dependencias
npm install

# Probar conexión a base de datos
npm run dev
```

### 7. **Probar Funcionalidades**

1. Ve a `http://localhost:3000/api/test-db` para probar conexión
2. Ve a `http://localhost:3000/admin` para probar panel de administración
3. Prueba crear, editar y eliminar productos

## 📊 ¿Qué Incluye el Script?

El script `SUPABASE_COMPLETE_SETUP.sql` incluye:

### ✅ **Esquema Base Completo**

- ✅ Tabla `categories` con datos iniciales
- ✅ Tabla `products` con campos extendidos
- ✅ Tabla `product_images` para múltiples imágenes
- ✅ Tabla `users` para usuarios
- ✅ Tabla `orders` y `order_items` para órdenes
- ✅ Tabla `price_groups` para gestión de precios

### ✅ **Campos Nuevos en Products**

- ✅ `product_type` (standard, perfiles, otros)
- ✅ `weight_per_unit` (peso por unidad en kg)
- ✅ `price_per_kg` (precio por kilogramo)
- ✅ `stock_type` (quantity o availability)
- ✅ `is_available` (disponibilidad booleana)
- ✅ `primary_image` y `images` (JSONB)

### ✅ **Funciones y Triggers**

- ✅ Validación automática de datos de productos
- ✅ Cálculo automático de precios para perfiles
- ✅ Actualización automática de `updated_at`
- ✅ Validaciones de tipos de productos

### ✅ **Políticas de Seguridad (RLS)**

- ✅ Lectura pública para productos y categorías
- ✅ Operaciones CRUD para admin (temporal)
- ✅ Políticas de usuarios para órdenes

### ✅ **Datos Iniciales**

- ✅ 4 categorías base
- ✅ 11 grupos de precios para metalúrgica y herrería
- ✅ Productos de ejemplo (estándar y perfiles)
- ✅ Imágenes de ejemplo

## 🔧 Configuraciones Post-Instalación

### **Configurar Cloudinary** (Opcional)

Si vas a usar imágenes:

1. Crea cuenta en [Cloudinary](https://cloudinary.com)
2. Obtén las credenciales
3. Actualiza `.env.local` con tus keys

### **Configurar MercadoPago** (Opcional)

Para pagos:

1. Crea cuenta de desarrollador en MercadoPago
2. Obtén tu Access Token
3. Actualiza `.env.local`

## 🚨 Notas Importantes

### **Seguridad en Desarrollo vs Producción**

- ⚠️ **Las políticas actuales permiten operaciones sin autenticación**
- ⚠️ **Esto es OK para desarrollo, pero CAMBIAR en producción**
- ⚠️ **Implementar autenticación de admin real antes de producción**

### **Backup de Datos**

- 💾 El script incluye datos de ejemplo
- 💾 Puedes agregar más productos después
- 💾 Considera hacer backup regular de la BD

### **Variables de Entorno Sensibles**

- 🔐 **NUNCA** commitees el archivo `.env.local`
- 🔐 El archivo ya está en `.gitignore`
- 🔐 Usa variables de entorno en producción (Vercel, etc.)

## 📞 Si Tienes Problemas

### **Error de Conexión a Supabase**

1. Verifica que las URLs y keys sean correctas
2. Asegúrate de que el proyecto Supabase esté activo
3. Revisa que no haya espacios extra en las variables

### **Error al Ejecutar Script SQL**

1. Ejecuta el script en partes si es muy largo
2. Revisa errores específicos en el SQL Editor
3. Asegúrate de que no haya conflictos de nombres

### **Error en el Frontend**

1. Verifica que `npm install` se ejecutó correctamente
2. Revisa la consola del navegador para errores
3. Verifica que todas las variables de entorno estén configuradas

## 🎯 Próximos Pasos

Una vez que todo esté funcionando:

1. **Agregar Productos Reales**: Usar el panel de admin para agregar productos
2. **Configurar Imágenes**: Subir imágenes reales de productos
3. **Personalizar Diseño**: Ajustar colores, logos, etc.
4. **Configurar Dominio**: Si tienes dominio propio
5. **Deploy a Producción**: Cuando esté listo para usuarios reales

---

**¡Listo!** Con estos pasos tendrás tu base de datos completamente funcional con todas las características avanzadas implementadas. 🚀
