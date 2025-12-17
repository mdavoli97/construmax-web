# Integración PlaceToPay - Guía de Configuración

## 📋 Resumen

Se ha implementado la integración completa con PlaceToPay para procesar pagos con tarjeta de crédito y débito.

## 🔧 Configuración

### 1. Variables de Entorno

Abrí el archivo `.env.local` y completá las credenciales que te envió PlaceToPay:

```env
# PlaceToPay Configuration
PLACETOPAY_LOGIN=tu_login_aqui
PLACETOPAY_SECRET_KEY=tu_secret_key_aqui
PLACETOPAY_BASE_URL=https://checkout-test.placetopay.com/api
# Para producción usar: https://checkout.placetopay.com/api
```

### 2. Migración de Base de Datos

Ejecutá la migración SQL en Supabase para agregar los campos necesarios:

1. Ingresá a tu proyecto de Supabase
2. Andá a SQL Editor
3. Copiá y ejecutá el contenido de `database/migrations/add_placetopay_fields.sql`

O ejecutá este comando desde la terminal si tenés Supabase CLI:

```bash
supabase db push
```

## 🏗️ Estructura Implementada

### Archivos Creados

1. **`src/lib/placetopay.ts`**
   - Funciones helper para autenticación
   - `generateAuth()`: Genera el objeto de autenticación requerido
   - `createPaymentSession()`: Crea una sesión de pago
   - `getSessionInfo()`: Consulta el estado de un pago
   - `isPaymentApproved()`: Verifica si un pago fue aprobado

2. **`src/types/index.ts`**
   - Tipos TypeScript para PlaceToPay
   - Interfaces para requests y responses

3. **`src/app/api/placetopay/create-session/route.ts`**
   - API endpoint para crear sesiones de pago
   - POST `/api/placetopay/create-session`

4. **`src/app/api/placetopay/session/[requestId]/route.ts`**
   - API endpoint para consultar estado de pago
   - GET/POST `/api/placetopay/session/{requestId}`

5. **`src/app/checkout/return/page.tsx`**
   - Página de retorno después del pago en PlaceToPay
   - Verifica automáticamente el estado y redirige

6. **Modificaciones en `src/app/checkout/page.tsx`**
   - Habilitada la opción de pago con tarjeta
   - Integración con PlaceToPay cuando se selecciona tarjeta
   - Redirección automática a la pasarela de pago

## 🔄 Flujo de Pago

### Usuario selecciona "Pago con Tarjeta"

1. Usuario completa el formulario de checkout
2. Al confirmar, se crea una sesión en PlaceToPay
3. Usuario es redirigido a la página de pago de PlaceToPay
4. Usuario completa los datos de su tarjeta
5. PlaceToPay procesa el pago
6. Usuario es redirigido a `/checkout/return?requestId={id}`
7. Sistema verifica el estado del pago automáticamente
8. Redirige a `/success` si fue aprobado, `/failure` si fue rechazado, o `/pending` si está pendiente

## 💳 Métodos de Pago Soportados

- ✅ **Efectivo**: Pago en puntos autorizados
- ✅ **Transferencia**: Pago mediante transferencia bancaria
- ✅ **Tarjeta**: Débito y crédito vía PlaceToPay (NUEVO)

## 🧪 Testing

### Modo de Prueba (Test)

La URL actual está configurada para ambiente de pruebas:

```
https://checkout-test.placetopay.com/api
```

PlaceToPay provee tarjetas de prueba para testing. Consultá su documentación para obtener los números de tarjeta de prueba.

### Modo Producción

Cuando estés listo para producción:

1. Cambiá la URL en `.env.local`:

```env
PLACETOPAY_BASE_URL=https://checkout.placetopay.com/api
```

2. Usá las credenciales de producción que te provea PlaceToPay

## 📊 Base de Datos

Se agregaron los siguientes campos a la tabla `orders`:

- `placetopay_request_id`: ID de la sesión de PlaceToPay
- `placetopay_payment_reference`: Referencia de autorización del pago
- `payment_status`: Estado del pago (pending, approved, rejected, pending_payment)

## 🔐 Seguridad

- ✅ Las credenciales se manejan en variables de entorno del servidor
- ✅ La autenticación usa SHA-256 según el estándar de PlaceToPay
- ✅ No se almacenan datos de tarjetas (PCI compliant)
- ✅ Toda la comunicación es via HTTPS

## 📝 Notas Importantes

1. **Moneda**: El sistema convierte automáticamente a UYU antes de enviar a PlaceToPay
2. **Redondeo**: PlaceToPay no acepta decimales, se redondea el total
3. **IVA**: El IVA (22%) ya está incluido en el monto enviado
4. **Expiración**: Las sesiones expiran en 1 hora por defecto

## 🐛 Troubleshooting

### Error 101: Login incorrecto

- Verificá que `PLACETOPAY_LOGIN` esté correcto

### Error 102: TranKey incorrecto

- Verificá que `PLACETOPAY_SECRET_KEY` esté correcto
- Asegurate que no haya espacios en blanco

### Error 103: Fecha de la semilla mayor de 5 minutos

- Verificá que la hora del servidor esté sincronizada
- Podría ser un problema de zona horaria

### Pago no se refleja

- Verificá que la migración SQL se haya ejecutado correctamente
- Revisá los logs en el servidor para ver errores

## 📚 Documentación Adicional

- [PlaceToPay Checkout Docs](https://docs.placetopay.dev/checkout/)
- [Autenticación](https://docs.placetopay.dev/checkout/authentication/)
- [Crear Sesión](https://docs.placetopay.dev/checkout/create-session/)

## ✅ Checklist de Deployment

Antes de lanzar a producción:

- [ ] Configurar credenciales de producción en `.env.local`
- [ ] Cambiar `PLACETOPAY_BASE_URL` a producción
- [ ] Ejecutar migración SQL en Supabase de producción
- [ ] Probar un pago completo en ambiente de pruebas
- [ ] Verificar que los emails de confirmación funcionan
- [ ] Configurar webhook de notificaciones (opcional)
- [ ] Verificar que las redirecciones funcionen correctamente

## 🎯 Próximos Pasos Sugeridos

1. **Webhooks**: Implementar webhooks para notificaciones asíncronas
2. **Reintento de Pagos**: Permitir reintentar pagos fallidos
3. **Historial**: Agregar visualización de historial de pagos en panel admin
4. **Reportes**: Crear reportes de ventas con filtros por método de pago
