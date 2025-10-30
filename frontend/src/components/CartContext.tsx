import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Product } from './ProductCard';

export type CartItem = {
  product: Product;
  qty: number;
};

type CartContextType = {
  items: CartItem[];
  add: (product: Product, qty?: number) => void;
  remove: (productId: number) => void;
  increment: (productId: number) => void;
  decrement: (productId: number) => void;
  clear: () => void;
  count: number;
  total: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = 'cart:v1';

function loadInitial(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartItem[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(Boolean);
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(loadInitial);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore storage errors
    }
  }, [items]);

  const add = (product: Product, qty: number = 1) => {
    setItems((prev) => {
      const idx = prev.findIndex((it) => it.product.id === product.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: next[idx].qty + qty };
        return next;
      }
      return [...prev, { product, qty }];
    });
  };

  const remove = (productId: number) => {
    setItems((prev) => prev.filter((it) => it.product.id !== productId));
  };

  const increment = (productId: number) => {
    setItems((prev) => prev.map((it) => (it.product.id === productId ? { ...it, qty: it.qty + 1 } : it)));
  };

  const decrement = (productId: number) => {
    setItems((prev) =>
      prev
        .map((it) => (it.product.id === productId ? { ...it, qty: Math.max(0, it.qty - 1) } : it))
        .filter((it) => it.qty > 0)
    );
  };

  const clear = () => setItems([]);

  const { count, total } = useMemo(() => {
    const count = items.reduce((acc, it) => acc + it.qty, 0);
    const total = items.reduce((acc, it) => acc + it.qty * it.product.price, 0);
    return { count, total };
  }, [items]);

  const value = useMemo(
    () => ({ items, add, remove, increment, decrement, clear, count, total }),
    [items, count, total]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart deve ser usado dentro de CartProvider');
  return ctx;
}

