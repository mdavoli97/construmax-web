# Panel de Administración - ConstruMax

## Descripción

Panel de administración para gestionar productos, categorías e inventario de la tienda ConstruMax.

## Características

### Gestión de Productos

- ✅ **Listar productos**: Vista completa del inventario con filtros y búsqueda
- ✅ **Agregar productos**: Formulario completo para crear nuevos productos
- ✅ **Editar productos**: Modificar información de productos existentes
- ✅ **Eliminar productos**: Remover productos del inventario
- ✅ **Filtros avanzados**: Por categoría, stock, y búsqueda por texto
- ✅ **Validación de datos**: Verificación de campos requeridos

### Dashboard

- ✅ **Estadísticas**: Resumen de productos, categorías, stock total y valor del inventario
- ✅ **Productos recientes**: Lista de últimos productos agregados
- ✅ **Estado del stock**: Indicadores visuales para productos con poco o sin stock

### Interfaz de Usuario

- ✅ **Diseño responsivo**: Funciona en desktop y móvil
- ✅ **Navegación intuitiva**: Sidebar con navegación clara
- ✅ **Acciones rápidas**: Botones de acceso directo desde el dashboard

## Acceso al Panel

### 🔐 Autenticación Requerida

El panel está protegido con un sistema de login:

**Credenciales de desarrollo:**

- **Usuario**: `admin`
- **Contraseña**: `admin123`

### Desde la aplicación

- **Desktop**: Enlace "Admin" en la esquina superior derecha del header
- **Móvil**: "Panel de Administración" en el menú móvil

### URL directa

```
/admin
```

### Flujo de acceso

1. Ir a `/admin`
2. Ingresar credenciales de administrador
3. La sesión dura 24 horas
4. Cerrar sesión desde el sidebar

## Rutas Disponibles

### Páginas

- `/admin` - Dashboard principal
- `/admin/productos` - Gestión de productos
- `/admin/productos/nuevo` - Agregar nuevo producto
- `/admin/productos/editar/[id]` - Editar producto específico

### API Endpoints

- `GET /api/admin/products` - Obtener todos los productos
- `POST /api/admin/products` - Crear nuevo producto
- `GET /api/admin/products/[id]` - Obtener producto por ID
- `PUT /api/admin/products/[id]` - Actualizar producto
- `DELETE /api/admin/products/[id]` - Eliminar producto

## Estructura de Datos

### Producto

```typescript
{
  id: string
  name: string
  description?: string
  price: number
  category: 'construccion' | 'metalurgica' | 'herramientas' | 'herreria'
  image?: string
  stock: number
  unit: string
  brand?: string
  sku: string
  featured?: boolean
  created_at: string
  updated_at: string
}
```

## Validaciones

### Campos Requeridos

- ✅ Nombre del producto
- ✅ Precio (mayor a 0)
- ✅ Categoría
- ✅ Stock (mayor o igual a 0)
- ✅ Unidad
- ✅ SKU (único)

### Validaciones Automáticas

- ✅ Generación automática de SKU si no se proporciona
- ✅ Conversión de tipos (string a number para precio y stock)
- ✅ Verificación de datos antes de envío

## Seguridad

✅ **Sistema de autenticación implementado**:

- Login con usuario y contraseña
- Tokens de sesión con expiración (24 horas)
- Protección de todas las rutas del admin
- Logout seguro con confirmación

⚠️ **IMPORTANTE**: Las credenciales actuales son para desarrollo. Para producción:

1. **Cambiar credenciales**: Actualizar variables de entorno
2. **Implementar HTTPS**: Asegurar todas las comunicaciones
3. **Tokens JWT reales**: Usar jsonwebtoken para mayor seguridad
4. **Rate limiting**: Limitar intentos de login
5. **Auditoría**: Registrar accesos y acciones administrativas

### Configuración para Producción

1. **Variables de entorno**:

```env
ADMIN_SECRET_KEY=tu_clave_secreta_muy_segura
```

2. **Políticas RLS en Supabase**: Ejecutar `database/admin_policies.sql` y modificar para verificar autenticación real

3. **Middleware de autenticación**: Descomentar las validaciones en `src/lib/auth.ts`

## Próximas Funcionalidades

### Próximas Funcionalidades

### Pendientes de Implementación

- [ ] **Roles de usuario múltiples** (admin, moderador)
- [ ] **Two-factor authentication** (2FA)
- [ ] **Gestión de categorías** con CRUD completo
- [ ] **Gestión de órdenes** y estados
- [ ] **Reportes y analíticas** avanzadas
- [ ] **Carga masiva de productos** (CSV/Excel)
- [ ] **Gestión de imágenes** (upload y optimización)
- [ ] **Historial de cambios** (audit log)
- [ ] **Notificaciones** (stock bajo, nuevas órdenes)
- [ ] **Recuperación de contraseña**

### Mejoras de UX

- [ ] **Confirmaciones modales** para acciones destructivas
- [ ] **Drag & drop** para reordenar productos
- [ ] **Vista previa** de productos antes de publicar
- [ ] **Búsqueda avanzada** con múltiples filtros

## Instalación y Configuración

1. **El panel ya está incluido** en la aplicación principal
2. **Configurar base de datos**: Ejecutar scripts en `database/`
3. **Variables de entorno**: Configurar Supabase
4. **Acceder**: Ir a `/admin` desde tu aplicación

## Soporte Técnico

Para reportar problemas o solicitar nuevas funcionalidades, por favor:

1. Verificar que la base de datos esté correctamente configurada
2. Revisar la consola del navegador para errores
3. Verificar la conexión a Supabase
4. Contactar al equipo de desarrollo con detalles específicos

---

_Panel de Administración v1.0 - Desarrollado para ConstruMax_
