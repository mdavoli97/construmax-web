import React from "react";

// Servicio para obtener cotización del dólar desde dolarapi.com
interface CotizacionDolarAPI {
  moneda: string;
  nombre: string;
  compra: number;
  venta: number;
  fechaActualizacion: string;
}

interface ExchangeRateData {
  usd_to_uyu: number;
  last_updated: string;
  source: "dolarapi" | "cache";
  compra?: number;
  venta?: number;
}

// Cache para evitar demasiadas consultas a la API
let exchangeRateCache: ExchangeRateData | null = null;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hora en milisegundos

/**
 * Obtiene la cotización del dólar desde dolarapi.com
 */
export async function getUSDToUYURate(): Promise<ExchangeRateData> {
  // Verificar cache
  if (exchangeRateCache) {
    const cacheAge =
      Date.now() - new Date(exchangeRateCache.last_updated).getTime();
    if (cacheAge < CACHE_DURATION) {
      return exchangeRateCache;
    }
  }

  try {
    // API de dolarapi.com para Uruguay
    const response = await fetch(
      "https://uy.dolarapi.com/v1/cotizaciones/usd",
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: CotizacionDolarAPI = await response.json();

    // Validar que los datos son correctos
    if (
      !data.venta ||
      !data.compra ||
      isNaN(data.venta) ||
      isNaN(data.compra)
    ) {
      throw new Error("Cotización inválida recibida de dolarapi.com");
    }

    // Usar el tipo de cambio vendedor ya que es el que pagaría el cliente
    const rate = data.venta;

    const exchangeData: ExchangeRateData = {
      usd_to_uyu: rate,
      last_updated: data.fechaActualizacion || new Date().toISOString(),
      source: "dolarapi",
      compra: data.compra,
      venta: data.venta,
    };

    // Actualizar cache
    exchangeRateCache = exchangeData;

    return exchangeData;
  } catch (error) {
    console.error("Error fetching exchange rate from dolarapi.com:", error);

    // Si hay error y tenemos cache, usar cache aunque esté vencido
    if (exchangeRateCache) {
      console.warn("Using expired cache due to API error");
      return {
        ...exchangeRateCache,
        source: "cache",
      };
    }

    // Fallback con cotización aproximada (actualizar manualmente si es necesario)
    console.warn("Using fallback exchange rate");
    return {
      usd_to_uyu: 41.25, // Cotización aproximada de fallback (valor de venta típico)
      last_updated: new Date().toISOString(),
      source: "cache",
      compra: 38.65,
      venta: 41.25,
    };
  }
}

export type DisplayCurrency = "USD" | "UYU";

/**
 * Formatea un precio según moneda de origen y moneda de visualización
 * @param price - El precio a formatear
 * @param currency - La moneda original del precio ('USD' | 'UYU')
 * @param exchangeRate - La tasa de cambio USD a UYU
 * @param showOriginal - Si mostrar la moneda original entre paréntesis cuando se convierte
 * @param displayCurrency - Moneda en la que el usuario quiere ver precios
 */
export function formatPriceWithCurrency(
  price: number,
  currency: "USD" | "UYU" = "USD",
  exchangeRate?: number,
  showOriginal: boolean = true,
  displayCurrency: DisplayCurrency = "UYU"
): string {
  const converted = convertPrice(
    price,
    currency,
    displayCurrency,
    exchangeRate
  );

  const formatted =
    displayCurrency === "UYU" ? formatUYU(converted) : formatUSD(converted);

  if (showOriginal && currency !== displayCurrency && exchangeRate) {
    const original = currency === "UYU" ? formatUYU(price) : formatUSD(price);
    return `${formatted} (${original})`;
  }

  return formatted;
}

/**
 * Convierte un monto entre USD y UYU
 */
export function convertPrice(
  amount: number,
  from: DisplayCurrency,
  to: DisplayCurrency,
  exchangeRate?: number
): number {
  if (from === to) return amount;
  if (!exchangeRate) return amount;

  if (from === "USD" && to === "UYU") {
    return convertUSDToUYU(amount, exchangeRate);
  }
  if (from === "UYU" && to === "USD") {
    return convertUYUToUSD(amount, exchangeRate);
  }
  return amount;
}

/**
 * Convierte un precio de USD a UYU
 */
export function convertUSDToUYU(
  usdAmount: number,
  exchangeRate: number
): number {
  return Math.round(usdAmount * exchangeRate);
}

/**
 * Convierte un precio de UYU a USD
 */
export function convertUYUToUSD(
  uyuAmount: number,
  exchangeRate: number
): number {
  if (!exchangeRate) return uyuAmount;
  return Math.round((uyuAmount / exchangeRate) * 100) / 100;
}

/**
 * Formatea un precio en pesos uruguayos
 */
export function formatUYU(amount: number): string {
  return new Intl.NumberFormat("es-UY", {
    style: "currency",
    currency: "UYU",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Formatea un precio en dólares (US$ para distinguirlo del $ uruguayo)
 */
export function formatUSD(amount: number): string {
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
  return `US$ ${formatted}`;
}

export type PriceSource = {
  lock_to_uyu?: boolean | null;
  price_group?: { currency?: string | null } | null;
};

/** Moneda en la que está cargado el precio. Un producto fijo en pesos se toma como UYU. */
export function sourceCurrencyOf(product?: PriceSource | null): DisplayCurrency {
  if (product?.lock_to_uyu) return "UYU";
  return product?.price_group?.currency === "UYU" ? "UYU" : "USD";
}

/** Moneda que ve el visitante. El switch no mueve los productos marcados como solo pesos. */
export function viewCurrencyOf(
  product: PriceSource | null | undefined,
  displayCurrency: DisplayCurrency
): DisplayCurrency {
  return product?.lock_to_uyu ? "UYU" : displayCurrency;
}

export function formatCatalogPrice(
  amount: number,
  product: PriceSource | null | undefined,
  exchangeRate: number | undefined,
  displayCurrency: DisplayCurrency,
  withIva = false,
  ivaMultiplier = 1.22
): string {
  const source = sourceCurrencyOf(product);
  const view = viewCurrencyOf(product, displayCurrency);
  if (!exchangeRate && source !== view) return "Cargando...";
  return formatPriceWithCurrency(
    withIva ? amount * ivaMultiplier : amount,
    source,
    exchangeRate,
    false,
    view
  );
}

export function formatProductPriceRange(
  products: Array<PriceSource & { price: number }>,
  exchangeRate: number | undefined,
  displayCurrency: DisplayCurrency,
  ivaMultiplier = 1.22
): string {
  const priced = products.filter((product) => product.price > 0);
  if (priced.length === 0) return "Consultar precio";

  const groups = new Map<DisplayCurrency, number[]>();
  for (const product of priced) {
    const source = sourceCurrencyOf(product);
    const view = viewCurrencyOf(product, displayCurrency);
    if (!exchangeRate && source !== view) return "Cargando...";
    const amount = convertPrice(
      product.price * ivaMultiplier,
      source,
      view,
      exchangeRate
    );
    const list = groups.get(view) || [];
    list.push(amount);
    groups.set(view, list);
  }

  const formatGroup = (currency: DisplayCurrency, amounts: number[]) => {
    const min = Math.min(...amounts);
    const max = Math.max(...amounts);
    const format = (value: number) =>
      formatPriceWithCurrency(value, currency, exchangeRate, false, currency);
    return min === max ? format(min) : `${format(min)} - ${format(max)}`;
  };

  const parts: string[] = [];
  if (groups.has("USD")) parts.push(formatGroup("USD", groups.get("USD")!));
  if (groups.has("UYU")) parts.push(formatGroup("UYU", groups.get("UYU")!));
  return parts.join(" · ");
}

export type MoneyBuckets = { usd: number; uyu: number };

export function sumDisplayed(
  lines: Array<{
    amount: number;
    source: DisplayCurrency;
    lockToUyu?: boolean | null;
  }>,
  displayCurrency: DisplayCurrency,
  exchangeRate?: number
): MoneyBuckets {
  const buckets: MoneyBuckets = { usd: 0, uyu: 0 };
  for (const line of lines) {
    if (line.lockToUyu || displayCurrency === "UYU") {
      buckets.uyu +=
        line.lockToUyu || line.source === "UYU"
          ? line.amount
          : exchangeRate
            ? convertUSDToUYU(line.amount, exchangeRate)
            : line.amount;
      continue;
    }
    buckets.usd +=
      line.source === "USD"
        ? line.amount
        : exchangeRate
          ? convertUYUToUSD(line.amount, exchangeRate)
          : line.amount;
  }
  return buckets;
}

export function scaleBuckets(buckets: MoneyBuckets, factor: number): MoneyBuckets {
  return { usd: buckets.usd * factor, uyu: buckets.uyu * factor };
}

export function addBuckets(left: MoneyBuckets, right: MoneyBuckets): MoneyBuckets {
  return { usd: left.usd + right.usd, uyu: left.uyu + right.uyu };
}

export function formatBuckets(
  buckets: MoneyBuckets,
  displayCurrency: DisplayCurrency
): string {
  if (displayCurrency === "UYU" || buckets.usd === 0) return formatUYU(buckets.uyu);
  if (buckets.uyu === 0) return formatUSD(buckets.usd);
  return `${formatUSD(buckets.usd)} + ${formatUYU(buckets.uyu)}`;
}

/**
 * Hook personalizado para usar en componentes React
 */
export function useExchangeRate() {
  const [exchangeRate, setExchangeRate] =
    React.useState<ExchangeRateData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    getUSDToUYURate()
      .then((data) => {
        setExchangeRate(data);
        setError(null);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const refresh = async () => {
    setLoading(true);
    try {
      // Limpiar cache para forzar nueva consulta
      exchangeRateCache = null;
      const data = await getUSDToUYURate();
      setExchangeRate(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  return { exchangeRate, loading, error, refresh };
}
