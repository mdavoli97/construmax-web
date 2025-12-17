# Sistema de Envío de Emails - Resend

Se ha implementado el sistema de envío de emails de confirmación de compra usando **Resend**.

## Archivos creados

### 1. Template de Email

- **Archivo**: `emails/OrderConfirmation.tsx`
- **Descripción**: Template React Email con diseño profesional que incluye:
  - Datos de la orden (número, fecha, estado)
  - Información del cliente
  - Lista de productos comprados
  - Totales y métodos de pago
  - Footer con información de contacto

### 2. API Route para envío

- **Archivo**: `src/app/api/send-order-email/route.ts`
- **Descripción**: Endpoint que envía emails tanto al cliente como a los administradores

### 3. Integración con Webhook

- **Archivo**: `src/app/api/webhook/route.ts` (modificado)
- **Descripción**: Actualizado para enviar automáticamente emails cuando un pago es aprobado

## Configuración necesaria

### 1. Obtener API Key de Resend

1. Regístrate en [https://resend.com/signup](https://resend.com/signup)
2. Verifica tu email
3. Ve a [API Keys](https://resend.com/api-keys)
4. Crea una nueva API key
5. Copia la key (empieza con `re_`)

### 2. Configurar variables de entorno

Agrega estas variables a tu archivo `.env.local`:

```env
# Resend API Key
RESEND_API_KEY=re_tu_api_key_aqui

# Email desde el cual se enviarán los correos
# Para desarrollo/pruebas usa:
RESEND_FROM_EMAIL="Construmax <onboarding@resend.dev>"

# Para producción (necesitas verificar tu dominio):
# RESEND_FROM_EMAIL="Construmax <pedidos@tudominio.com>"

# Emails de administradores (separados por coma)
ADMIN_EMAILS=admin@construmax.com,ventas@construmax.com

# URL base de tu aplicación (ya debería estar configurada)
NEXT_PUBLIC_BASE_URL=https://tudominio.com
```

### 3. Verificar dominio (para producción)

En el plan gratuito puedes usar `onboarding@resend.dev`, pero para producción debes:

1. Ir a [Domains](https://resend.com/domains) en Resend
2. Agregar tu dominio
3. Configurar los registros DNS (SPF, DKIM, DMARC)
4. Esperar verificación
5. Actualizar `RESEND_FROM_EMAIL` con tu dominio verificado

## Límites del plan gratuito

- ✅ **3,000 emails/mes**
- ✅ **100 emails/día**
- ✅ Sin tarjeta de crédito requerida
- ✅ Dominio onboarding@resend.dev incluido

## Cómo funciona

### Flujo de envío de emails

1. Cliente completa el pedido (con cualquier método de pago)
2. Se llama al endpoint `/api/send-order-email`
3. Se envía automáticamente:
   - Email al cliente con confirmación
   - Email a todos los administradores

### Flujo manual (cualquier método de pago)

Para otros métodos de pago, puedes llamar manualmente al endpoint:

```typescript
await fetch("/api/send-order-email", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    orderNumber: "ORD-12345",
    orderDate: new Date().toLocaleDateString("es-UY"),
    customerName: "Juan Pérez",
    customerEmail: "cliente@email.com",
    customerPhone: "+598 99 123 456",
    items: [
      {
        name: "Cemento Portland",
        quantity: 10,
        price: 450,
        total: 4500,
      },
    ],
    subtotal: 4500,
    total: 4500,
    paymentMethod: "Transferencia Bancaria",
    paymentStatus: "Aprobado",
    deliveryAddress: "Calle 123, Montevideo",
  }),
});
```

## Previsualizar emails localmente

Para ver cómo se verán los emails antes de enviarlos:

```bash
npm install -g react-email
cd emails
react-email dev
```

Abre `http://localhost:3000` y verás el template en vivo.

## Próximos pasos

1. Obtener API key de Resend
2. Configurar variables de entorno
3. Probar con una compra de prueba
4. Verificar dominio para producción
5. Personalizar template según necesidades

## Soporte

Si tienes problemas:

- Revisa los logs en la consola del servidor
- Verifica que las variables de entorno estén configuradas
- Confirma que la API key de Resend es válida
- Revisa el dashboard de Resend para ver el estado de los emails
