# ConstruMax - E-commerce

Una plataforma de e-commerce completa para una barraca de materiales de construcción y metalúrgica en Uruguay, construida con Next.js 15, TypeScript, Tailwind CSS y Supabase.

## 🚀 Características

- **Landing Page** atractiva con hero section y productos destacados
- **Catálogo de productos** con filtros por categoría y búsqueda
- **Carrito de compras** persistente con Zustand
- **Sistema de notificaciones por email** con Resend
- **Panel de administración** completo
- **Múltiples métodos de pago** (transferencia, efectivo, tarjeta)
- **Diseño responsive** optimizado para móviles y desktop
- **Tipado completo** con TypeScript
- **UI moderna** con Tailwind CSS

## 📦 Categorías de Productos

- 🏗️ **Construcción**: Cemento, ladrillos, arena, piedra
- ⚙️ **Metalúrgica**: Hierros, alambre, materiales de acero
- 🔧 **Herramientas**: Manuales y eléctricas
- ⚡ **Electricidad**: Cables, cajas de luz, materiales eléctricos
- 🚰 **Plomería**: Caños PVC, codos, accesorios

## 🛠️ Tecnologías Utilizadas

- **Next.js 15** - Framework de React
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Framework de CSS
- **Zustand** - Gestión de estado
- **Supabase** - Base de datos y autenticación
- **Resend** - Envío de emails transaccionales
- **Cloudinary** - Gestión de imágenes
- **Heroicons** - Iconografía
- **Lucide React** - Iconos adicionales

## 📋 Requisitos Previos

- Node.js 18+
- npm o yarn
- Cuenta de Supabase
- Cuenta de Resend (para emails)
- Cuenta de Cloudinary (para imágenes)

## 🔧 Instalación

1. **Clonar el repositorio**

   ```bash
   git clone <url-del-repositorio>
   cd barraca-web
   ```

2. **Instalar dependencias**

   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   Crear un archivo `.env.local` en la raíz del proyecto:

   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key

   # Resend (emails)
   RESEND_API_KEY=re_tu_api_key
   RESEND_FROM_EMAIL="Construmax <onboarding@resend.dev>"
   ADMIN_EMAILS=admin@construmax.com

   # Cloudinary
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=tu_cloud_name
   CLOUDINARY_API_KEY=tu_api_key
   CLOUDINARY_API_SECRET=tu_api_secret

   # App
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   ```

4. **Ejecutar en desarrollo**

   ```bash
   npm run dev
   ```

5. **Abrir en el navegador**
   ```
   http://localhost:3000
   ```

## 🔑 Configuración de Servicios

### Supabase

1. Crear cuenta en [Supabase](https://supabase.com)
2. Crear nuevo proyecto
3. Copiar las credenciales del proyecto
4. Ejecutar las migraciones de la base de datos

### Resend (Emails)

1. Crear cuenta en [Resend](https://resend.com)
2. Obtener API key
3. Configurar dominio (opcional, para producción)
4. Ver `CONFIGURACION_EMAILS.md` para más detalles

### Cloudinary (Imágenes)

1. Crear cuenta en [Cloudinary](https://cloudinary.com)
2. Obtener credenciales del dashboard
3. Configurar upload presets

## 📁 Estructura del Proyecto

```
src/
├── app/                    # App Router de Next.js
│   ├── api/               # API Routes
│   │   ├── send-order-email/
│   │   ├── products/
│   │   └── admin/
│   ├── admin/             # Panel de administración
│   ├── carrito/           # Página del carrito
│   ├── checkout/          # Página de checkout
│   ├── productos/         # Páginas de productos
│   ├── success/           # Página de éxito
│   ├── failure/           # Página de fallo
│   └── pending/           # Página de pendiente
├── components/            # Componentes reutilizables
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── ProductCard.tsx
│   └── admin/
├── lib/                   # Utilidades y configuración
│   ├── supabase.ts
│   └── cloudinary.ts
├── store/                 # Estado global (Zustand)
│   └── cartStore.ts
└── types/                 # Tipos TypeScript
    └── index.ts
emails/                    # Templates de emails
└── OrderConfirmation.tsx
```

## 🎨 Personalización

### Colores

Los colores principales están definidos en Tailwind CSS:

- **Naranja**: `orange-600` (color principal)
- **Gris**: `gray-50`, `gray-900` (fondos y texto)

### Productos

Editar `src/lib/data.ts` para agregar, modificar o eliminar productos.

### Categorías

Modificar el array `categories` en `src/lib/data.ts`.

## 🚀 Despliegue

### Vercel (Recomendado para demos)

1. **Instalar Vercel CLI**:

   ```bash
   npm install -g vercel
   ```

2. **Hacer deploy**:

   ```bash
   vercel
   ```

3. **Configurar variables de entorno en Vercel Dashboard**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `RESEND_API_KEY`
   - `RESEND_FROM_EMAIL`
   - `ADMIN_EMAILS`
   - `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
   - `NEXT_PUBLIC_BASE_URL` (URL de tu dominio en Vercel)

### Otros proveedores

- **Netlify**: Configurar build command `npm run build`
- **Railway**: Conectar repositorio y configurar variables
- **DigitalOcean App Platform**: Desplegar desde GitHub

## 🔒 Seguridad

- Todas las credenciales están en variables de entorno
- Autenticación en panel de administración
- Validación de datos en el servidor
- Sanitización de datos en formularios
- HTTPS requerido en producción

## 📱 Responsive Design

El sitio está optimizado para:

- 📱 Móviles (320px+)
- 📱 Tablets (768px+)
- 💻 Desktop (1024px+)
- 🖥️ Pantallas grandes (1280px+)

## 🧪 Testing

```bash
# Ejecutar tests
npm test

# Ejecutar linting
npm run lint

# Verificar tipos TypeScript
npx tsc --noEmit
```

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Soporte

Para soporte técnico o consultas:

- 📧 Email: info@barraca.com.uy
- 📱 Teléfono: +598 2 123 4567
- 🌐 Sitio web: https://barraca.com.uy

## 🔄 Actualizaciones

### Próximas características

- [ ] Panel de administración
- [ ] Sistema de usuarios
- [ ] Historial de pedidos
- [ ] Notificaciones por email
- [ ] Integración con WhatsApp
- [ ] Múltiples métodos de envío
- [ ] Sistema de cupones
- [ ] Reseñas de productos

---

**Desarrollado con ❤️ para la construcción en Uruguay**
