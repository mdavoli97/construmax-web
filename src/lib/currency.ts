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

/**
 * Formatea un precio teniendo en cuenta la moneda original
 * @param price - El precio a formatear
 * @param currency - La moneda original del precio ('USD' | 'UYU')
 * @param exchangeRate - La tasa de cambio USD a UYU (opcional si currency es UYU)
 * @param showOriginal - Si mostrar la moneda original entre paréntesis cuando se convierte
 */
export function formatPriceWithCurrency(
  price: number,
  currency: "USD" | "UYU" = "USD",
  exchangeRate?: number,
  showOriginal: boolean = true
): string {
  // Si el precio ya está en UYU, mostrarlo directamente
  if (currency === "UYU") {
    return formatUYU(price);
  }

  // Si está en USD y no tenemos tasa de cambio, mostrar en USD
  if (currency === "USD" && !exchangeRate) {
    return formatUSD(price);
  }

  // Si está en USD y tenemos tasa de cambio, convertir a UYU
  if (currency === "USD" && exchangeRate) {
    const priceInUYU = convertUSDToUYU(price, exchangeRate);

    if (showOriginal) {
      return `${formatUYU(priceInUYU)} (${formatUSD(price)})`;
    } else {
      return formatUYU(priceInUYU);
    }
  }

  // Fallback
  return formatUSD(price);
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
 * Formatea un precio en dólares
 */
export function formatUSD(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
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
