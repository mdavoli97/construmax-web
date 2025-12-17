# Test de Envío de Email

## ⚠️ IMPORTANTE: Reinicia el servidor antes de probar

```powershell
# Detén el servidor (Ctrl+C en la terminal donde corre)
# Luego inicia de nuevo:
npm run dev
```

## Prueba Rápida desde el Navegador

1. Asegúrate que el servidor esté corriendo en `http://localhost:3000`
2. Abre las herramientas de desarrollador (F12)
3. Ve a la pestaña "Console"
4. **CAMBIA TU EMAIL** en la línea `customerEmail` y pega este código:

```javascript
fetch("/api/send-order-email", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    orderNumber: "TEST-001",
    orderDate: new Date().toLocaleDateString("es-UY"),
    customerName: "Cliente de Prueba",
    customerEmail: "tumail@gmail.com", // CAMBIA ESTO POR TU EMAIL
    customerPhone: "+598 99 123 456",
    items: [
      {
        name: "Cemento Portland 50kg",
        quantity: 10,
        price: 450,
        total: 4500,
      },
      {
        name: "Arena Fina (m³)",
        quantity: 2,
        price: 1200,
        total: 2400,
      },
    ],
    subtotal: 6900,
    total: 8418, // Con IVA 22%
    paymentMethod: "Transferencia Bancaria",
    paymentStatus: "Pendiente",
    deliveryAddress: "Calle 123, Montevideo",
  }),
})
  .then((res) => res.json())
  .then((data) => console.log("✅ Email enviado:", data))
  .catch((err) => console.error("❌ Error:", err));
```

### Opción 2: Usando PowerShell

Crea un archivo `test-email.ps1` y ejecuta:

```powershell
$body = @{
    orderNumber = "TEST-001"
    orderDate = (Get-Date).ToString("dd/MM/yyyy")
    customerName = "Cliente de Prueba"
    customerEmail = "tumail@gmail.com"  # CAMBIA ESTO
    customerPhone = "+598 99 123 456"
    items = @(
        @{
            name = "Cemento Portland 50kg"
            quantity = 10
            price = 450
            total = 4500
        },
        @{
            name = "Arena Fina (m³)"
            quantity = 2
            price = 1200
            total = 2400
        }
    )
    subtotal = 6900
    total = 8418
    paymentMethod = "Transferencia Bancaria"
    paymentStatus = "Pendiente"
    deliveryAddress = "Calle 123, Montevideo"
} | ConvertTo-Json -Depth 10

Invoke-WebRequest -Uri "http://localhost:3000/api/send-order-email" `
    -Method POST `
    -Headers @{"Content-Type"="application/json"} `
    -Body $body
```

## Verificación

Después de ejecutar la prueba, deberías:

1. ✅ Ver un mensaje de éxito en la consola
2. ✅ Recibir un email en el correo del cliente de prueba
3. ✅ Recibir un email en los correos de administradores configurados

## Troubleshooting

### No recibo emails

1. **Verifica las variables de entorno en `.env.local`:**
   - `RESEND_API_KEY` debe ser válida
   - `RESEND_FROM_EMAIL` debe estar configurado
   - `ADMIN_EMAILS` debe tener al menos un email

2. **Revisa los logs del servidor:**
   - En la terminal donde corre `npm run dev`
   - Busca mensajes de error de Resend

3. **Verifica en el dashboard de Resend:**
   - Ve a https://resend.com/emails
   - Revisa el estado de los emails enviados

4. **Revisa la carpeta de spam:**
   - A veces los emails llegan a spam la primera vez

### Error 500

- Verifica que el servidor esté corriendo
- Revisa que la API key de Resend sea correcta
- Chequea los logs del servidor para más detalles
