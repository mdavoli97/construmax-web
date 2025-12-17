# ⚠️ PROBLEMA IDENTIFICADO: Limitación de Resend

## 🔍 Diagnóstico

Resend está bloqueando los emails porque estás en modo de prueba:

```
Error 403: You can only send testing emails to your own email address (mdavoli97@gmail.com)
```

## ✅ Solución Temporal (Para Desarrollo)

Usa tu email registrado para todas las pruebas:

- Email registrado en Resend: **mdavoli97@gmail.com**
- Solo puedes enviar a este email en modo prueba

## 🚀 Solución Permanente (Para Producción)

### PASO 1: Verificar un Dominio en Resend

1. Ve a https://resend.com/domains
2. Haz clic en "Add Domain"
3. Ingresa tu dominio (ej: `construmax.com.uy`)

### PASO 2: Configurar DNS

Resend te dará estos registros para agregar en tu DNS:

#### SPF (TXT)

```
Host: @
Type: TXT
Value: v=spf1 include:_spf.resend.com ~all
TTL: 3600
```

#### DKIM (TXT)

```
Host: resend._domainkey
Type: TXT
Value: [Resend te lo proporciona]
TTL: 3600
```

### PASO 3: Actualizar Variables de Entorno

Una vez verificado el dominio, actualiza `.env.local`:

```env
RESEND_FROM_EMAIL="Construmax <pedidos@construmax.com.uy>"
```

### PASO 4: Listo!

Después de verificar el dominio podrás enviar a cualquier email.

## 📊 Limitaciones del Plan Gratuito

- ✅ 3,000 emails/mes
- ✅ 100 emails/día
- ⚠️ **Solo a tu email registrado SIN dominio verificado**
- ✅ Envío a cualquier email CON dominio verificado

## 🧪 Probar Ahora (Temporal)

Mientras verificas el dominio, usa `mdavoli97@gmail.com` para pruebas:

```javascript
// En checkout, temporalmente usa:
customerEmail: "mdavoli97@gmail.com";
```

O actualiza el `.env.local`:

```env
ADMIN_EMAILS=mdavoli97@gmail.com
```

## 🔗 Links Útiles

- Dashboard de Resend: https://resend.com/emails
- Verificar dominios: https://resend.com/domains
- Documentación: https://resend.com/docs

## ⏭️ Próximos Pasos

1. ✅ Comprobado que el sistema funciona (enviaste email a mdavoli97@gmail.com)
2. ⏳ Verificar dominio en Resend
3. ⏳ Configurar DNS
4. ⏳ Actualizar FROM_EMAIL con tu dominio
5. ✅ Enviar a cualquier cliente
