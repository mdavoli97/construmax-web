# Guía de Verificación de Dominio: construmax.com.uy

## 📋 Paso 1: Agregar el dominio en Resend

1. Ve a https://resend.com/domains
2. Haz clic en **"Add Domain"**
3. Ingresa: `construmax.com.uy`
4. Haz clic en **"Add"**

---

## 📝 Paso 2: Obtener los registros DNS

Resend te mostrará 3 registros DNS que necesitas agregar. Serán algo así:

### Registro SPF (TXT)

```
Tipo: TXT
Nombre: @ (o construmax.com.uy)
Valor: v=spf1 include:_spf.resend.com ~all
TTL: 3600
```

### Registro DKIM (TXT)

```
Tipo: TXT
Nombre: resend._domainkey
Valor: p=MIGfMA0GCSqGSIb3DQEBA... (un texto muy largo)
TTL: 3600
```

### Registro DMARC (TXT)

```
Tipo: TXT
Nombre: _dmarc
Valor: v=DMARC1; p=none
TTL: 3600
```

**⚠️ IMPORTANTE:** Copia los valores EXACTOS que te muestre Resend, especialmente el DKIM que es único para tu dominio.

---

## 🌐 Paso 3: Configurar DNS en tu proveedor

### ¿Dónde tienes registrado construmax.com.uy?

El proveedor donde compraste el dominio (puede ser uno de estos):

- **ANTEL** (si lo compraste en Uruguay)
- **GoDaddy**
- **Namecheap**
- **Google Domains**
- **Cloudflare**
- **Otro**

### Instrucciones generales:

1. **Inicia sesión** en el panel de tu proveedor de dominio
2. **Busca la sección de DNS** (puede llamarse):
   - "DNS Management"
   - "Manage DNS"
   - "DNS Records"
   - "Zone File"
3. **Agrega los 3 registros TXT** que te dio Resend

#### Para cada registro:

**SPF:**

- Tipo: `TXT`
- Nombre/Host: `@` (o deja en blanco, o `construmax.com.uy`)
- Valor: `v=spf1 include:_spf.resend.com ~all`
- TTL: `3600` (o "Automatic")

**DKIM:**

- Tipo: `TXT`
- Nombre/Host: `resend._domainkey`
- Valor: [El que te dio Resend - texto muy largo]
- TTL: `3600`

**DMARC:**

- Tipo: `TXT`
- Nombre/Host: `_dmarc`
- Valor: `v=DMARC1; p=none`
- TTL: `3600`

4. **Guarda los cambios**

---

## ⏱️ Paso 4: Esperar propagación DNS

- La verificación puede tomar entre **5 minutos a 48 horas**
- Generalmente es rápido (15-30 minutos)
- Resend verificará automáticamente cada cierto tiempo

---

## ✅ Paso 5: Verificar en Resend

1. Ve a https://resend.com/domains
2. Deberías ver `construmax.com.uy` con estado:
   - ⏳ **Pending** (esperando verificación)
   - ✅ **Verified** (¡listo!)

---

## 🔧 Paso 6: Actualizar .env.local

Una vez verificado el dominio, actualiza tu archivo `.env.local`:

```env
RESEND_FROM_EMAIL="Construmax <pedidos@construmax.com.uy>"
```

O puedes usar otros subdominios:

- `ventas@construmax.com.uy`
- `tienda@construmax.com.uy`
- `noreply@construmax.com.uy`

---

## 🧪 Paso 7: Probar el email

Después de verificar, prueba con cualquier email:

```powershell
$testData = '{"orderNumber":"ORD-VERIFIED","orderDate":"09/12/2025","customerName":"Cliente Test","customerEmail":"CUALQUIER_EMAIL@gmail.com","customerPhone":"+598991234567","items":[{"name":"Test","quantity":1,"price":100,"total":100}],"subtotal":100,"total":122,"paymentMethod":"Test","paymentStatus":"Aprobado","deliveryAddress":"Test"}';
Invoke-WebRequest -Uri "http://localhost:3000/api/send-order-email" -Method POST -Headers @{"Content-Type"="application/json"} -Body $testData
```

---

## 📞 Ayuda Específica por Proveedor

### Si tienes el dominio en ANTEL:

1. Entra a https://www.antel.com.uy/
2. Login con tu cuenta
3. Ve a "Mis Servicios" → "Dominios"
4. Selecciona `construmax.com.uy`
5. Busca "Administrar DNS" o "Registros DNS"

### Si tienes el dominio en GoDaddy:

1. Ve a https://dcc.godaddy.com/manage/
2. Click en "DNS" junto a tu dominio
3. Scroll hasta "Records" (Registros)
4. Click en "Add" (Agregar)

### Si tienes el dominio en Namecheap:

1. Ve a https://ap.www.namecheap.com/
2. Click en "Domain List"
3. Click en "Manage" junto a tu dominio
4. Ve a "Advanced DNS"
5. Click en "Add New Record"

---

## ❓ Problemas Comunes

### "El registro SPF ya existe"

- Algunos proveedores ya tienen un registro SPF
- Modifícalo para incluir Resend: `v=spf1 include:_spf.resend.com include:existente.com ~all`

### "No puedo agregar @ en el nombre"

- Algunos proveedores usan diferentes notaciones:
  - Deja el campo vacío
  - Usa `construmax.com.uy`
  - Usa `@`
  - Usa el dominio completo

### "La verificación no funciona"

- Espera al menos 30 minutos
- Verifica que los valores estén copiados exactamente
- Asegúrate de no tener espacios extras
- Usa una herramienta como https://mxtoolbox.com/SuperTool.aspx para verificar los registros

---

## 📧 Resultado Final

Una vez verificado, podrás:

- ✅ Enviar emails desde `@construmax.com.uy`
- ✅ Enviar a CUALQUIER email de cliente
- ✅ Mejor deliverability (menos spam)
- ✅ Imagen profesional

---

**🚀 ¡Empieza ahora!**

1. Ve a https://resend.com/domains
2. Agrega `construmax.com.uy`
3. Copia los registros DNS que te muestre
4. Avísame cuando los tengas para ayudarte a configurarlos
