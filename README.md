# ConstruMax - E-commerce

Una plataforma de e-commerce completa para una barraca de materiales de construcción y metalúrgica en Uruguay, construida con Next.js 15, TypeScript, Tailwind CSS y MercadoPago.

## 🚀 Características

- **Landing Page** atractiva con hero section y productos destacados
- **Catálogo de productos** con filtros por categoría y búsqueda
- **Carrito de compras** persistente con Zustand
- **Checkout** completo con formulario de datos del cliente
- **Integración con MercadoPago** para Uruguay
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
- **MercadoPago SDK** - Pasarela de pagos
- **Heroicons** - Iconografía
- **Lucide React** - Iconos adicionales

## 📋 Requisitos Previos

- Node.js 18+
- npm o yarn
- Cuenta de MercadoPago para Uruguay

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
   MERCADOPAGO_ACCESS_TOKEN=TEST-12345678-1234-1234-1234-123456789012
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

## 🔑 Configuración de MercadoPago

### 1. Crear cuenta en MercadoPago

- Registrarse en [MercadoPago Uruguay](https://www.mercadopago.com.uy/)
- Completar la verificación de cuenta

### 2. Obtener credenciales

- Ir a [Credenciales](https://www.mercadopago.com.uy/developers/panel/credentials)
- Copiar el **Access Token** de producción o sandbox

### 3. Configurar webhooks

- En el panel de desarrolladores, configurar la URL del webhook:
  ```
  https://tu-dominio.com/api/webhook
  ```

### 4. Actualizar variables de entorno

```env
MERCADOPAGO_ACCESS_TOKEN=APP_USR-1234567890123456789012345678901234-123456-1234567890123456789012345678901234
NEXT_PUBLIC_BASE_URL=https://tu-dominio.com
```

## 📁 Estructura del Proyecto

```
src/
├── app/                    # App Router de Next.js
│   ├── api/               # API Routes
│   │   ├── create-preference/
│   │   └── webhook/
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
│   └── MercadoPagoButton.tsx
├── lib/                   # Utilidades y datos
│   └── data.ts
├── store/                 # Estado global (Zustand)
│   └── cartStore.ts
└── types/                 # Tipos TypeScript
    └── index.ts
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
   - `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY`
   - `MERCADOPAGO_ACCESS_TOKEN`
   - `NEXT_PUBLIC_BASE_URL` (URL de tu dominio en Vercel)

4. **Configurar webhooks de MercadoPago**:
   - URL: `https://tu-dominio.vercel.app/api/webhook`

### Otros proveedores

- **Netlify**: Configurar build command `npm run build`
- **Railway**: Conectar repositorio y configurar variables
- **DigitalOcean App Platform**: Desplegar desde GitHub

## 🔒 Seguridad

- Las credenciales de MercadoPago están en variables de entorno
- Validación de webhooks implementada
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
