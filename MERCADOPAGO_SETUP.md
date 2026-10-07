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

## Checklist de prueba (sandbox)

1. Configurar **credenciales de prueba** en `.env.local` / Vercel preview.
2. Exponer la app con URL pública (`NEXT_PUBLIC_BASE_URL` = deploy o túnel tipo ngrok). Localhost puro: el usuario vuelve con el botón “Volver al sitio”; el webhook necesita URL pública.
3. Comprar con **tarjeta de prueba** de Mercado Pago hasta el final.
4. Al volver a `/checkout/return`:
   - UI muestra “Pago aprobado”
   - Carrito queda vacío
   - En admin, la orden pasa a **Pagado** (`paid`) con `payment_id` / `external_reference`
5. Confirmar que el webhook recibió el evento (logs del servidor) o que el backup `confirm=1` sincronizó la orden.
6. Con `MERCADOPAGO_WEBHOOK_SECRET` configurado: una firma inválida debe responder **401** y no actualizar la orden.
7. En producción, `/api/mercadopago/debug` y `/api/mercadopago/test` deben responder **404**.
