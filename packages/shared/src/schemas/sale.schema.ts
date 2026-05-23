import { z } from "zod";

export const PAYMENT_METHODS = [
  "CASH",
  "MOBILE_MONEY",
  "CARD",
  "CREDIT",
] as const;
export const paymentMethodSchema = z.enum(PAYMENT_METHODS);
export type PaymentMethod = z.infer<typeof paymentMethodSchema>;

export const SALE_PAYMENT_STATUSES = ["PAID", "PARTIAL", "UNPAID"] as const;
export const salePaymentStatusSchema = z.enum(SALE_PAYMENT_STATUSES);
export type SalePaymentStatus = z.infer<typeof salePaymentStatusSchema>;

export const saleItemInputSchema = z.object({
  productId: z.string().cuid(),
  quantity: z.coerce
    .number()
    .int("Quantity must be a whole number")
    .positive("Quantity must be greater than 0")
    .max(100_000),
});

export const createSaleSchema = z
  .object({
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
    paymentStatus: salePaymentStatusSchema.default("PAID"),
    amountPaid: z.coerce
      .number()
      .nonnegative("Amount paid cannot be negative")
      .max(99_999_999.99)
      .default(0),
    dueDate: z.coerce.date().optional().nullable(),
    note: z.string().trim().max(300).optional().nullable(),
  })
  .superRefine((data, ctx) => {
    const isCredit =
      data.paymentStatus === "UNPAID" || data.paymentStatus === "PARTIAL";
    if (isCredit && !data.customerId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "A customer is required for pay-later sales",
        path: ["customerId"],
      });
    }
    if (data.paymentStatus === "UNPAID" && data.amountPaid > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Unpaid sales cannot include an upfront payment",
        path: ["amountPaid"],
      });
    }
    if (data.paymentStatus === "PAID" && data.amountPaid > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Do not set amountPaid for fully paid sales",
        path: ["amountPaid"],
      });
    }
    if (data.paymentStatus === "PARTIAL" && data.amountPaid <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Partial payment requires an upfront amount",
        path: ["amountPaid"],
      });
    }
    if (isCredit && data.paymentMethod === "CREDIT" && data.amountPaid > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Use cash, mobile money, or card for the deposit",
        path: ["paymentMethod"],
      });
    }
  });

export type CreateSaleInput = z.infer<typeof createSaleSchema>;
export type SaleItemInput = z.infer<typeof saleItemInputSchema>;

/** Query params for GET /sales. Merge with paginationQuerySchema in the DTO. */
export const saleListQuerySchema = z.object({
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  customerId: z.string().cuid().optional(),
  paymentMethod: paymentMethodSchema.optional(),
  paymentStatus: salePaymentStatusSchema.optional(),
  hasBalance: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => (v === "true" ? true : v === "false" ? false : undefined)),
});
export type SaleListQuery = z.infer<typeof saleListQuerySchema>;

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
  paymentStatus: SalePaymentStatus;
  amountPaid: string;
  amountDue: string;
  dueDate: string | null;
  note: string | null;
  items: SaleItem[];
  createdAt: string;
}
