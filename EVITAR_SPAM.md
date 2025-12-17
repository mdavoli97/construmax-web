# Mejoras para Evitar que los Emails Lleguen a Spam

## ✅ Mejoras Implementadas

### 1. **Versión en Texto Plano**

- Agregada versión `text` en todos los emails
- Ayuda a los filtros de spam a validar el contenido
- Mejora la compatibilidad con clientes de email antiguos

### 2. **Headers de Email Mejorados**

- `replyTo`: Para que las respuestas vayan al lugar correcto
- `X-Entity-Ref-ID`: Identificador único de la orden
- Mejor estructura de subject lines

### 3. **Subject Lines Optimizados**

- Cliente: "Confirmación de pedido #ORD-123 - Construmax"
- Admin: "🔔 Nueva Orden #ORD-123 - Nombre Cliente"

## 🎯 Próximos Pasos para Mejor Deliverability

### PASO 1: Verificar tu Dominio en Resend (IMPORTANTE)

El dominio `onboarding@resend.dev` es para pruebas y **siempre** va a spam en producción.

**Para producción:**

1. Ve a [Resend Domains](https://resend.com/domains)
2. Haz clic en "Add Domain"
3. Ingresa tu dominio (ej: `construmax.com.uy`)
4. Resend te dará registros DNS:
   - **SPF**: `v=spf1 include:_spf.resend.com ~all`
   - **DKIM**: Un registro TXT largo
   - **DMARC**: `v=DMARC1; p=none;`

5. Agrega estos registros en tu proveedor de DNS (GoDaddy, Namecheap, etc.)
6. Espera verificación (5-30 minutos)
7. Actualiza `.env.local`:
   ```env
   RESEND_FROM_EMAIL="Construmax <pedidos@construmax.com.uy>"
   ```

### PASO 2: Configuración DNS Completa

Necesitas agregar estos registros DNS en tu dominio:

#### Registro SPF (TXT)

```
Nombre: @
Tipo: TXT
Valor: v=spf1 include:_spf.resend.com ~all
TTL: 3600
```

#### Registro DKIM (proporcionado por Resend)

```
Nombre: resend._domainkey
Tipo: TXT
Valor: [Lo proporciona Resend]
TTL: 3600
```

#### Registro DMARC (TXT)

```
Nombre: _dmarc
Tipo: TXT
Valor: v=DMARC1; p=quarantine; rua=mailto:admin@construmax.com.uy
TTL: 3600
```

### PASO 3: Agregar Email a Contactos (Temporal)

Mientras verificas el dominio:

1. Agrega `onboarding@resend.dev` a tus contactos en Gmail
2. Marca el email como "No es spam"
3. Mueve un email a la bandeja de entrada
4. Gmail aprenderá que estos emails son legítimos

### PASO 4: Calentar el Dominio (Warm-up)

Cuando tengas tu dominio verificado:

1. **Primeros 3 días**: Envía ~10-20 emails/día
2. **Días 4-7**: Incrementa a 50-100 emails/día
3. **Semana 2+**: Uso normal

Esto ayuda a construir reputación del dominio.

## 📊 Métricas a Monitorear

En el [Dashboard de Resend](https://resend.com/emails):

- ✅ **Delivered**: Debe ser >95%
- ⚠️ **Bounced**: Debe ser <2%
- ❌ **Complained**: Debe ser <0.1%

## 🔍 Verificar si Estás en Listas Negras

Herramientas para verificar reputación:

- [MXToolbox](https://mxtoolbox.com/blacklists.aspx)
- [Mail Tester](https://www.mail-tester.com/)
- [Google Postmaster](https://postmaster.google.com/)

## 💡 Tips Adicionales

### Contenido del Email

✅ **HACER:**

- Usar un nombre "De:" reconocible
- Incluir dirección física (opcional)
- Tener botón de "unsubscribe" si envías marketing
- Mantener ratio texto/imagen balanceado
- Incluir versión en texto plano

❌ **EVITAR:**

- MAYÚSCULAS EXCESIVAS
- Muchos signos de exclamación!!!
- Palabras spam: "GRATIS", "URGENTE", "GANA DINERO"
- Links acortados (bit.ly, etc.)
- Archivos adjuntos en el primer email

### Gmail Específico

Para Gmail, es especialmente importante:

1. **SPF, DKIM, DMARC** configurados correctamente
2. **Engagement positivo**: Que los usuarios abran y lean
3. **Baja tasa de rebote**: Emails válidos
4. **No reportes de spam**: Mantener <0.1%

## 🧪 Probar Mejoras

Después de los cambios, prueba enviando un email a:

1. **Tu email personal**
2. **Gmail**
3. **Outlook/Hotmail**
4. **Yahoo** (si tienes)

Y verifica que lleguen a bandeja de entrada.

## 📝 Resumen de Prioridades

### 🔴 CRÍTICO (Hacer AHORA)

1. ✅ Agregar versión texto plano (YA HECHO)
2. ✅ Mejorar headers (YA HECHO)
3. ⏳ Marcar como "No spam" en Gmail

### 🟡 IMPORTANTE (Hacer PRONTO)

1. ⏳ Verificar dominio propio en Resend
2. ⏳ Configurar registros DNS (SPF, DKIM, DMARC)

### 🟢 RECOMENDADO (Hacer DESPUÉS)

1. ⏳ Calentar el dominio gradualmente
2. ⏳ Monitorear métricas en Resend
3. ⏳ Implementar unsubscribe (si envías newsletters)

## 🎯 Resultado Esperado

Con el dominio verificado y DNS configurado correctamente:

- ✅ **99%+ deliverability** a bandeja de entrada
- ✅ **<1% a spam**
- ✅ **Mejor reputación del remitente**
- ✅ **Confianza del cliente**
