"use client";

import type { Product } from "@sme/shared";
import { create } from "zustand";

export interface CartLine {
  productId: string;
  name: string;
  sellPrice: string;
  stockQuantity: number;
  quantity: number;
}

interface PosCartState {
  lines: CartLine[];
  customerId: string | null;
  customerName: string | null;
  discount: number;
  paymentMethod: "CASH" | "MOBILE_MONEY" | "CARD";
  addProduct: (product: Product) => void;
  setQuantity: (productId: string, quantity: number) => void;
  removeLine: (productId: string) => void;
  setCustomer: (id: string | null, name: string | null) => void;
  setDiscount: (amount: number) => void;
  setPaymentMethod: (method: "CASH" | "MOBILE_MONEY" | "CARD") => void;
  clearCart: () => void;
}

export const usePosCartStore = create<PosCartState>((set, get) => ({
  lines: [],
  customerId: null,
  customerName: null,
  discount: 0,
  paymentMethod: "CASH",

  addProduct: (product) => {
    if (product.status !== "ACTIVE" || product.stockQuantity <= 0) return;

    const { lines } = get();
    const existing = lines.find((l) => l.productId === product.id);

    if (existing) {
      if (existing.quantity >= product.stockQuantity) return;
      set({
        lines: lines.map((l) =>
          l.productId === product.id
            ? { ...l, quantity: l.quantity + 1 }
            : l,
        ),
      });
      return;
    }

    set({
      lines: [
        ...lines,
        {
          productId: product.id,
          name: product.name,
          sellPrice: product.sellPrice,
          stockQuantity: product.stockQuantity,
          quantity: 1,
        },
      ],
    });
  },

  setQuantity: (productId, quantity) => {
    const { lines } = get();
    if (quantity <= 0) {
      set({ lines: lines.filter((l) => l.productId !== productId) });
      return;
    }
    set({
      lines: lines.map((l) => {
        if (l.productId !== productId) return l;
        const qty = Math.min(quantity, l.stockQuantity);
        return { ...l, quantity: qty };
      }),
    });
  },

  removeLine: (productId) => {
    set({ lines: get().lines.filter((l) => l.productId !== productId) });
  },

  setCustomer: (id, name) => set({ customerId: id, customerName: name }),

  setDiscount: (amount) =>
    set({ discount: Number.isFinite(amount) && amount >= 0 ? amount : 0 }),

  setPaymentMethod: (method) => set({ paymentMethod: method }),

  clearCart: () =>
    set({
      lines: [],
      customerId: null,
      customerName: null,
      discount: 0,
      paymentMethod: "CASH",
    }),
}));

/** Derived totals in ETB (numbers, not formatted). */
export function cartTotals(lines: CartLine[], discount: number) {
  const subtotal = lines.reduce(
    (sum, l) => sum + Number(l.sellPrice) * l.quantity,
    0,
  );
  const safeDiscount = Math.min(Math.max(0, discount), subtotal);
  const total = subtotal - safeDiscount;
  const itemCount = lines.reduce((sum, l) => sum + l.quantity, 0);
  return { subtotal, discount: safeDiscount, total, itemCount };
}
