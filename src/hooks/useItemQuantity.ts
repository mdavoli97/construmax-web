import { useEffect, useState } from "react";
import { useCartStore } from "@/store/cartStore";

/**
 * Hook que maneja la hidratación de la cantidad de un producto específico en el carrito
 * Retorna 0 durante el renderizado del servidor y el valor real después de la hidratación
 */
export function useItemQuantity(productId: string) {
  const [isClient, setIsClient] = useState(false);
  const getItemQuantity = useCartStore((state) => state.getItemQuantity);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return 0; // Durante SSR, siempre retorna 0
  }

  return getItemQuantity(productId);
}
