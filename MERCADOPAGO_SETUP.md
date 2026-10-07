# Mercado Pago (Checkout Pro) — Setup

## Variables de entorno

```env
# Obligatorias
MERCADOPAGO_ACCESS_TOKEN=APP_USR-...   # Token de prueba o producción
NEXT_PUBLIC_BASE_URL=https://tu-dominio.com

# Muy recomendada en producción (firma de webhooks)
MERCADOPAGO_WEBHOOK_SECRET=tu_secret_del_panel_mp

# Opcional (Checkout Pro redirect no la usa en el front)
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=APP_USR-...

# Obligatorio si usás credenciales de PRUEBA en el sitio de producción
# (sin esto Vercel redirigía al checkout real y MP muestra
# "Una de las partes con la que intentas hacer el pago es de prueba")
MERCADOPAGO_USE_SANDBOX=true

# Solo desarrollo: permitir /api/mercadopago/debug y /test en producción
# MERCADOPAGO_ALLOW_DEBUG=true
```

También se usan `NEXT_PUBLIC_SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` para actualizar órdenes.

Si `NEXT_PUBLIC_BASE_URL` no está definida en Vercel, se usa `https://$VERCEL_URL`.

## Webhook en el panel de Mercado Pago

URL de notificación:

```
{NEXT_PUBLIC_BASE_URL}/api/mercadopago/webhook
```

Eventos: **Pagos** (`payment`).

## Columnas esperadas en `orders`

- `external_reference` (text)
- `mercadopago_preference_id` (text, nullable)
- `payment_id` (text, nullable)
- `payment_status` (text, nullable)
- `payment_method_id` (text, nullable)
- `payment_type` (text, nullable)
- `updated_at` (timestamptz, nullable)
- `status` puede ser: `pending`, `pending_payment`, `paid`, `payment_failed`, más estados de fulfillment

## Flujo

1. Checkout crea preferencia → guarda orden `pending_payment` → redirect a MP.
2. Usuario paga → vuelve a `/checkout/return`.
3. Return consulta el pago con `?confirm=1` (backup) y vacía el carrito si está aprobado.
4. Webhook actualiza la orden de forma autoritativa (también funciona en sandbox / `live_mode: false`).

## Error 145 — “Una de las partes… es de prueba”

Causa típica: **Public Key y Access Token de ambientes distintos** (uno prueba, otro producción), o pagar con usuario real en checkout de prueba.

En Checkout Pro **no** entres al TESTUSER a sacar credenciales (esa sección está bloqueada a propósito).

Flujo oficial (2025+):

1. Developers (cuenta real) → tu app → **Credenciales de prueba**.
2. Copiá **los dos** del mismo bloque (Public Key + Access Token). Deben coincidir (ambos de prueba).
3. Pegá ambos en Vercel / `.env.local`. No mezcles con Credenciales de producción.
4. Credenciales nuevas suelen ser `APP_USR-…` también en prueba → el checkout usa `init_point` (no `sandbox_init_point`, deprecado).
5. Tokens legacy `TEST-…` todavía van a `sandbox.*`.
6. Pagá en incógnito con el **Comprador** TESTUSER (código 6 dígitos = tabla Cuentas de prueba).

Check rápido: en Vercel, si el Access Token empieza con `TEST-` y la Public Key con `APP_USR-` (o al revés), están desparejos → error 145.

## Checklist de prueba (sandbox)

1. Credenciales de **prueba** de tu app real en `.env.local` / Vercel (`TEST-…` o Access Token de prueba `APP_USR-…`).
2. Exponer la app con URL pública (`NEXT_PUBLIC_BASE_URL` = deploy o túnel tipo ngrok). Localhost puro: el usuario vuelve con el botón “Volver al sitio”; el webhook necesita URL pública.
3. Comprar logueado como **Comprador** de prueba (dinero disponible o tarjeta de prueba) hasta el final.
4. Al volver a `/checkout/return`:
   - UI muestra “Pago aprobado”
   - Carrito queda vacío
   - En admin, la orden pasa a **Pagado** (`paid`) con `payment_id` / `external_reference`
5. Confirmar que el webhook recibió el evento (logs del servidor) o que el backup `confirm=1` sincronizó la orden.
6. Con `MERCADOPAGO_WEBHOOK_SECRET` configurado: una firma inválida debe responder **401** y no actualizar la orden.
7. En producción, `/api/mercadopago/debug` y `/api/mercadopago/test` deben responder **404**.
