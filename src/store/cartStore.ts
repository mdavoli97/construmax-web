import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Cart, CartItem, Product, CalculationDetail } from "@/types";

interface CartStore {
  cart: Cart;
  addItem: (
    product: Product,
    quantity?: number,
    calculationDetails?: CalculationDetail[]
  ) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getItemQuantity: (productId: string) => number;
  getTotalItems: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      cart: {
        items: [],
        total: 0,
      },

      addItem: (
        product: Product,
        quantity = 1,
        calculationDetails?: CalculationDetail[]
      ) => {
        set((state) => {
          const existingItem = state.cart.items.find(
            (item) => item.product.id === product.id
          );

          if (existingItem) {
            // Update existing item quantity and merge calculation details if applicable
            const updatedItems = state.cart.items.map((item) =>
              item.product.id === product.id
                ? {
                    ...item,
                    quantity: item.quantity + quantity,
                    // Si hay nuevos detalles de cálculo, los agregamos o reemplazamos
                    calculationDetails:
                      calculationDetails || item.calculationDetails,
                  }
                : item
            );

            const total = updatedItems.reduce(
              (sum, item) => sum + item.product.price * item.quantity,
              0
            );

            return {
              cart: {
                items: updatedItems,
                total,
              },
            };
          } else {
            // Add new item
            const newItem: CartItem = {
              product,
              quantity,
              calculationDetails,
            };

            const updatedItems = [...state.cart.items, newItem];
            const total = updatedItems.reduce(
              (sum, item) => sum + item.product.price * item.quantity,
              0
            );

            return {
              cart: {
                items: updatedItems,
                total,
              },
            };
          }
        });
      },

      removeItem: (productId: string) => {
        set((state) => {
          const updatedItems = state.cart.items.filter(
            (item) => item.product.id !== productId
          );
          const total = updatedItems.reduce(
            (sum, item) => sum + item.product.price * item.quantity,
            0
          );

          return {
            cart: {
              items: updatedItems,
              total,
            },
          };
        });
      },

      updateQuantity: (productId: string, quantity: number) => {
        set((state) => {
          if (quantity <= 0) {
            get().removeItem(productId);
            return state;
          }

          const updatedItems = state.cart.items.map((item) =>
            item.product.id === productId ? { ...item, quantity } : item
          );

          const total = updatedItems.reduce(
            (sum, item) => sum + item.product.price * item.quantity,
            0
          );

          return {
            cart: {
              items: updatedItems,
              total,
            },
          };
        });
      },

      clearCart: () => {
        set({
          cart: {
            items: [],
            total: 0,
          },
        });
      },

      getItemQuantity: (productId: string) => {
        const state = get();
        const item = state.cart.items.find(
          (item) => item.product.id === productId
        );
        return item ? item.quantity : 0;
      },

      getTotalItems: () => {
        const state = get();
        const total = state.cart.items.reduce(
          (sum, item) => sum + item.quantity,
          0
        );
        return Math.round(total);
      },
    }),
    {
      name: "cart-storage",
    }
  )
);
