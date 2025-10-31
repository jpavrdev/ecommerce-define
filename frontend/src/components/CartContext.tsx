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

function storageKeyFor(owner: string) {
  return `cart:v1:${owner || 'guest'}`;
}

function readOwner(): string {
  try {
    return localStorage.getItem('currentUserId') || 'guest';
  } catch {
    return 'guest';
  }
}

function loadFrom(owner: string): CartItem[] {
  try {
    let raw = localStorage.getItem(storageKeyFor(owner));
    if (!raw && owner === 'guest') {
      // migrate legacy key if present
      raw = localStorage.getItem('cart:v1');
      if (raw) {
        try { localStorage.setItem(storageKeyFor('guest'), raw); localStorage.removeItem('cart:v1'); } catch {}
      }
    }
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartItem[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(Boolean);
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [owner, setOwner] = useState<string>(readOwner());
  const [items, setItems] = useState<CartItem[]>(() => loadFrom(readOwner()));

  useEffect(() => {
    try {
      localStorage.setItem(storageKeyFor(owner), JSON.stringify(items));
    } catch {
      // ignore storage errors
    }
  }, [items, owner]);

  // When auth changes, switch the storage namespace
  useEffect(() => {
    function onAuthChanged() {
      const newOwner = readOwner();
      setOwner(newOwner);
      setItems(loadFrom(newOwner));
    }
    window.addEventListener('auth:user-changed', onAuthChanged as any);
    window.addEventListener('storage', onAuthChanged as any);
    return () => {
      window.removeEventListener('auth:user-changed', onAuthChanged as any);
      window.removeEventListener('storage', onAuthChanged as any);
    };
  }, []);

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
