import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Cart item interface
export interface CartItem {
  id: number | string;
  product_id: number;
  variant_id?: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  variant?: {
    size?: string;
    color?: string;
  };
}

// Auth store interface
interface AuthState {
  isAuthenticated: boolean;
  user: any | null;
  token: string | null;
  login: (user: any, token: string) => void;
  logout: () => void;
}

// Cart store interface
interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: number | string) => void;
  updateQuantity: (id: number | string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotal: () => number;
}

// Auth store
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      token: null,
      login: (user, token) => set({ isAuthenticated: true, user, token }),
      logout: () => set({ isAuthenticated: false, user: null, token: null }),
    }),
    {
      name: 'auth-storage',
    }
  )
);

// Cart store
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const { items } = get();
        const existingItem = items.find(
          (i) => i.product_id === item.product_id && 
                 i.variant_id === item.variant_id
        );

        if (existingItem) {
          set({
            items: items.map((i) =>
              i.product_id === item.product_id && i.variant_id === item.variant_id
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            ),
          });
        } else {
          set({ items: [...items, item] });
        }
      },
      removeItem: (id) => {
        const { items } = get();
        set({ items: items.filter((i) => i.id !== id) });
      },
      updateQuantity: (id, quantity) => {
        const { items } = get();
        set({
          items: items.map((i) => (i.id === id ? { ...i, quantity } : i)),
        });
      },
      clearCart: () => set({ items: [] }),
      getTotalItems: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.quantity, 0);
      },
      getTotal: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.price * item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);