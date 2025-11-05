import { useEffect, useState } from "react";
import { useCartStore } from "@/store/cartStore";

/**
 * Hook que maneja la hidratación de la cantidad de un producto específico en el carrito
 * Se suscribe directamente a los items del carrito para garantizar reactividad
 */
export function useItemQuantity(productId: string) {
  const [isClient, setIsClient] = useState(false);
  // Suscribirse a los items del carrito directamente para garantizar reactividad
  const items = useCartStore((state) => state.cart.items);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return 0; // Durante SSR, siempre retorna 0
  }

  // Encontrar el item específico y retornar su cantidad
  const item = items.find((item) => item.product.id === productId);
  return item ? item.quantity : 0;
}
