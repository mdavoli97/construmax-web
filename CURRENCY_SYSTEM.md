# Sistema de Conversión de Moneda USD → UYU

## 📋 Resumen

Se implementó un sistema completo de conversión de moneda que permite:

- **Admins**: Cargan precios en USD
- **Usuarios**: Ven precios convertidos automáticamente a UYU según la cotización actual del BCU

## 🚀 Funcionalidades Implementadas

### 1. **Servicio de Cotización (`src/lib/currency.ts`)**

- ✅ Obtiene cotización en tiempo real del Banco Central del Uruguay
- ✅ Sistema de cache (1 hora) para optimizar consultas
- ✅ Fallback automático con cotización aproximada si la API falla
- ✅ Funciones de formateo para USD y UYU
- ✅ Hook personalizado `useExchangeRate()` para React

### 2. **API Endpoint (`src/app/api/exchange-rate/route.ts`)**

- ✅ Endpoint REST para obtener cotización: `GET /api/exchange-rate`
- ✅ Manejo de errores y respuestas consistentes
- ✅ Integración con el servicio de cotización

### 3. **Formulario de Productos Mejorado**

- ✅ Precios se cargan en **USD** (dólares)
- ✅ Muestra cotización actual del BCU en tiempo real
- ✅ Conversión automática y visualización de precios en **UYU** (pesos)
- ✅ Para **Perfiles**: precio por kg en USD → muestra equivalente en UYU
- ✅ Para **Productos Estándar**: precio directo en USD → muestra equivalente en UYU
- ✅ Botón de actualización manual de cotización

### 4. **Componentes de Visualización**

- ✅ `ProductCard`: Convierte precios USD → UYU automáticamente
- ✅ `PriceDisplay`: Componente reutilizable para mostrar precios convertidos
- ✅ Actualización en tiempo real de precios en toda la aplicación

## 💰 Flujo de Precios

```
ADMIN CARGA:
Producto → $50 USD

SISTEMA OBTIENE:
BCU → 1 USD = $43.50 UYU

USUARIO VE:
$2,175 (pesos uruguayos)
```

## 🔧 Uso en el Formulario de Productos

### Para Productos Estándar:

1. **Admin ingresa**: `$50` USD en el campo "Precio (USD)"
2. **Sistema muestra**: `$2,175` UYU automáticamente debajo
3. **Usuario final ve**: `$2,175` en toda la aplicación

### Para Perfiles (precio por kg):

1. **Admin ingresa**: `$180` USD por kg + `2.35` kg peso
2. **Sistema calcula**: `$423` USD total
3. **Sistema muestra**: `$18,400` UYU total
4. **Usuario final ve**: `$18,400` en toda la aplicación

## 📊 Información de Cotización

La interfaz muestra:

- **Cotización actual**: `$43.50 UYU`
- **Fuente**: `BCU` (Banco Central) o `Cache`
- **Última actualización**: Fecha y hora
- **Botón de actualización**: Para obtener cotización fresca

## 🔄 Sistema de Cache y Fallback

### Cache Inteligente:

- ⏰ **Duración**: 1 hora
- 🔄 **Actualización**: Automática al vencer
- 📱 **Manual**: Botón "Actualizar cotización"

### Fallback Robusto:

1. **Primario**: API del BCU en tiempo real
2. **Secundario**: Cache expirado (si la API falla)
3. **Terciario**: Cotización fija de $43.00 (configurable)

## 🛡️ Manejo de Errores

- **API no disponible**: Usa cache o fallback
- **Conexión lenta**: Muestra "Cargando precio..."
- **Error general**: Muestra "Error al cargar precio"
- **Logs detallados**: Para debugging en consola

## 📝 Archivos Modificados/Creados

### Nuevos Archivos:

- `src/lib/currency.ts` - Servicio principal de cotización
- `src/app/api/exchange-rate/route.ts` - API endpoint
- `src/components/PriceDisplay.tsx` - Componente de precios

### Archivos Modificados:

- `src/app/admin/productos/nuevo/page.tsx` - Formulario con conversión USD→UYU
- `src/components/ProductCard.tsx` - Muestra precios convertidos

## 🧪 Testing

### Probar el Sistema:

1. **Ir a**: `http://localhost:3001/admin/productos/nuevo`
2. **Verificar**: Cotización del BCU aparece en la parte superior
3. **Ingresar precio**: En USD, ver conversión automática a UYU
4. **Probar perfiles**: Precio por kg + peso = total en ambas monedas

### Probar API:

- **URL**: `http://localhost:3001/api/exchange-rate`
- **Respuesta esperada**:

```json
{
  "success": true,
  "data": {
    "usd_to_uyu": 43.5,
    "last_updated": "2025-08-23T...",
    "source": "bcu"
  }
}
```

## 🎯 Beneficios del Sistema

### Para Admins:

- ✅ Cargan precios en USD (moneda estable)
- ✅ No necesitan calcular conversiones manualmente
- ✅ Ven conversión automática en tiempo real

### Para Usuarios:

- ✅ Ven precios en pesos uruguayos (moneda local)
- ✅ Precios siempre actualizados según cotización oficial
- ✅ Transparencia en la conversión

### Para el Negocio:

- ✅ Precios competitivos y actualizados
- ✅ Gestión simplificada de inventario
- ✅ Adaptación automática a fluctuaciones cambiarias

## 🔮 Próximos Pasos Sugeridos

1. **Base de Datos**: Actualizar schema para guardar precios USD/UYU
2. **Historial**: Guardar histórico de cotizaciones
3. **Notificaciones**: Alertas por cambios significativos en cotización
4. **Dashboard**: Panel de control con estadísticas de conversión
5. **API Cache**: Implementar cache en Redis para mejor performance

---

> **Estado**: ✅ **FUNCIONANDO** - Sistema completamente implementado y operativo
> **Ambiente**: Desarrollo en `localhost:3001` > **Última prueba**: 23/08/2025 - ✅ API BCU funcional con fallback
