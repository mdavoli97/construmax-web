import { useEffect, useState } from "react";
import { useCartStore } from "@/store/cartStore";

/**
 * Hook que maneja la hidratación del carrito para evitar errores de SSR
 * Se suscribe directamente a los items del carrito para garantizar reactividad
 */
export function useCartCount() {
  const [isClient, setIsClient] = useState(false);
  // Suscribirse a los items del carrito directamente para garantizar reactividad
  const items = useCartStore((state) => state.cart.items);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return 0; // Durante SSR, siempre retorna 0
  }

  // Calcular el total directamente desde los items para asegurar reactividad
  return items.reduce((sum, item) => sum + item.quantity, 0);
}
