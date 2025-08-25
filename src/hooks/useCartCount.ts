import { useEffect, useState } from "react";
import { useCartStore } from "@/store/cartStore";

/**
 * Hook que maneja la hidratación del carrito para evitar errores de SSR
 * Retorna undefined durante el renderizado del servidor y el valor real después de la hidratación
 */
export function useCartCount() {
  const [isClient, setIsClient] = useState(false);
  const getTotalItems = useCartStore((state) => state.getTotalItems);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return 0; // Durante SSR, siempre retorna 0
  }

  return getTotalItems();
}
