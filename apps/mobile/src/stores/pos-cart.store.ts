import type { Product } from "@sme/shared";
import { create } from "zustand";

export interface CartLine {
  productId: string;
  name: string;
  sellPrice: number;
  quantity: number;
}

interface PosCartState {
  lines: CartLine[];
  customerId: string | null;
  discount: number;
  paymentMethod: "CASH" | "MOBILE_MONEY" | "CARD";
  addProduct: (product: Product) => void;
  setQuantity: (productId: string, quantity: number) => void;
  removeLine: (productId: string) => void;
  setCustomerId: (id: string | null) => void;
  setDiscount: (discount: number) => void;
  setPaymentMethod: (method: "CASH" | "MOBILE_MONEY" | "CARD") => void;
  clear: () => void;
}

export const usePosCartStore = create<PosCartState>((set, get) => ({
  lines: [],
  customerId: null,
  discount: 0,
  paymentMethod: "CASH",

  addProduct: (product) => {
    const price = Number(product.sellPrice);
    const lines = get().lines;
    const existing = lines.find((l) => l.productId === product.id);
    if (existing) {
      set({
        lines: lines.map((l) =>
          l.productId === product.id
            ? { ...l, quantity: l.quantity + 1 }
            : l,
        ),
      });
    } else {
      set({
        lines: [
          ...lines,
          {
            productId: product.id,
            name: product.name,
            sellPrice: price,
            quantity: 1,
          },
        ],
      });
    }
  },

  setQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      set({ lines: get().lines.filter((l) => l.productId !== productId) });
      return;
    }
    set({
      lines: get().lines.map((l) =>
        l.productId === productId ? { ...l, quantity } : l,
      ),
    });
  },

  removeLine: (productId) => {
    set({ lines: get().lines.filter((l) => l.productId !== productId) });
  },

  setCustomerId: (id) => set({ customerId: id }),
  setDiscount: (discount) => set({ discount: Math.max(0, discount) }),
  setPaymentMethod: (method) => set({ paymentMethod: method }),
  clear: () =>
    set({ lines: [], customerId: null, discount: 0, paymentMethod: "CASH" }),
}));

export function cartTotals(lines: CartLine[], discount: number) {
  const subtotal = lines.reduce(
    (sum, l) => sum + l.sellPrice * l.quantity,
    0,
  );
  const total = Math.max(0, subtotal - discount);
  return { subtotal, total, itemCount: lines.reduce((n, l) => n + l.quantity, 0) };
}
