"use client";

import type { PaymentMethod, Product, SalePaymentStatus } from "@sme/shared";
import { create } from "zustand";

export type PosCheckoutMode = "pay_now" | "pay_later" | "partial";

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
  checkoutMode: PosCheckoutMode;
  paymentMethod: Exclude<PaymentMethod, "CREDIT">;
  depositAmount: number;
  dueDate: string | null;
  addProduct: (product: Product) => void;
  setQuantity: (productId: string, quantity: number) => void;
  removeLine: (productId: string) => void;
  setCustomer: (id: string | null, name: string | null) => void;
  setDiscount: (amount: number) => void;
  setCheckoutMode: (mode: PosCheckoutMode) => void;
  setPaymentMethod: (method: Exclude<PaymentMethod, "CREDIT">) => void;
  setDepositAmount: (amount: number) => void;
  setDueDate: (isoDate: string | null) => void;
  clearCart: () => void;
}

const INITIAL_CHECKOUT = {
  checkoutMode: "pay_now" as const,
  paymentMethod: "CASH" as const,
  depositAmount: 0,
  dueDate: null as string | null,
};

export const usePosCartStore = create<PosCartState>((set, get) => ({
  lines: [],
  customerId: null,
  customerName: null,
  discount: 0,
  ...INITIAL_CHECKOUT,

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

  setCheckoutMode: (mode) => set({ checkoutMode: mode }),

  setPaymentMethod: (method) => set({ paymentMethod: method }),

  setDepositAmount: (amount) =>
    set({
      depositAmount: Number.isFinite(amount) && amount >= 0 ? amount : 0,
    }),

  setDueDate: (isoDate) => set({ dueDate: isoDate }),

  clearCart: () =>
    set({
      lines: [],
      customerId: null,
      customerName: null,
      discount: 0,
      ...INITIAL_CHECKOUT,
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

export function buildSaleCheckoutPayload(
  state: Pick<
    PosCartState,
    "checkoutMode" | "paymentMethod" | "depositAmount" | "dueDate"
  >,
  total: number,
): {
  paymentStatus: SalePaymentStatus;
  paymentMethod: PaymentMethod;
  amountPaid: number;
  dueDate?: string;
} {
  const dueDate = state.dueDate
    ? new Date(`${state.dueDate}T12:00:00`).toISOString()
    : undefined;

  if (state.checkoutMode === "pay_later") {
    return {
      paymentStatus: "UNPAID",
      paymentMethod: "CREDIT",
      amountPaid: 0,
      ...(dueDate ? { dueDate } : {}),
    };
  }

  if (state.checkoutMode === "partial") {
    return {
      paymentStatus: "PARTIAL",
      paymentMethod: state.paymentMethod,
      amountPaid: state.depositAmount,
      ...(dueDate ? { dueDate } : {}),
    };
  }

  return {
    paymentStatus: "PAID",
    paymentMethod: state.paymentMethod,
    amountPaid: 0,
  };
}
