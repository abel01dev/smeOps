import { z } from "zod";

export const PAYMENT_METHODS = ["CASH", "MOBILE_MONEY", "CARD"] as const;
export const paymentMethodSchema = z.enum(PAYMENT_METHODS);
export type PaymentMethod = z.infer<typeof paymentMethodSchema>;

export const saleItemInputSchema = z.object({
  productId: z.string().cuid(),
  quantity: z.coerce
    .number()
    .int("Quantity must be a whole number")
    .positive("Quantity must be greater than 0")
    .max(100_000),
});

export const createSaleSchema = z.object({
  customerId: z.string().cuid().optional().nullable(),
  items: z
    .array(saleItemInputSchema)
    .min(1, "At least one item is required")
    .max(200, "Too many items in one sale"),
  discount: z.coerce
    .number()
    .nonnegative("Discount cannot be negative")
    .max(99_999_999.99)
    .default(0),
  paymentMethod: paymentMethodSchema.default("CASH"),
  note: z.string().trim().max(300).optional().nullable(),
});

export type CreateSaleInput = z.infer<typeof createSaleSchema>;
export type SaleItemInput = z.infer<typeof saleItemInputSchema>;

export interface SaleItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  buyPriceAtSale: string;
  sellPriceAtSale: string;
  lineTotal: string;
  lineProfit: string;
}

export interface Sale {
  id: string;
  customerId: string | null;
  customer?: { id: string; name: string } | null;
  cashierId: string;
  cashier?: { id: string; name: string };
  subtotal: string;
  discount: string;
  total: string;
  profit: string;
  paymentMethod: PaymentMethod;
  note: string | null;
  items: SaleItem[];
  createdAt: string;
}
