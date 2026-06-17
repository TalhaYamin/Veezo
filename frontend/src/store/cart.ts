import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, Product } from '../types';
import { imageUrl } from '../lib/images';

type CartState = {
  items: CartItem[];
  addItem: (product: Product, size: string, quantity?: number) => void;
  removeItem: (productId: string, size: string) => void;
  updateQuantity: (productId: string, size: string, quantity: number) => void;
  clearCart: () => void;
  total: () => number;
  count: () => number;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, size, quantity = 1) => {
        const chosenSize = size || product.sizes[0] || 'One size';
        const qty = Math.max(1, quantity);
        set((state) => {
          const existing = state.items.find((item) => item.productId === product.id && item.size === chosenSize);
          if (existing) {
            const nextQty = Math.min(product.stock, existing.quantity + qty);
            return {
              items: state.items.map((item) =>
                item.productId === product.id && item.size === chosenSize
                  ? { ...item, quantity: nextQty, stock: product.stock }
                  : item
              ),
            };
          }
          return {
            items: [
              ...state.items,
              {
                productId: product.id,
                name: product.name,
                price: product.price,
                quantity: Math.min(product.stock, qty),
                size: chosenSize,
                image: imageUrl(product.image),
                stock: product.stock,
              },
            ],
          };
        });
      },
      removeItem: (productId, size) => {
        set((state) => ({
          items: state.items.filter((item) => !(item.productId === productId && item.size === size)),
        }));
      },
      updateQuantity: (productId, size, quantity) => {
        if (quantity < 1) {
          set((state) => ({
            items: state.items.filter((item) => !(item.productId === productId && item.size === size)),
          }));
          return;
        }
        const qty = Math.max(1, quantity);
        set((state) => ({
          items: state.items.map((item) =>
            item.productId === productId && item.size === size
              ? { ...item, quantity: Math.min(item.stock, qty) }
              : item
          ),
        }));
      },
      clearCart: () => set({ items: [] }),
      total: () => get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      count: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
    }),
    { name: 'veezo-cart' }
  )
);
