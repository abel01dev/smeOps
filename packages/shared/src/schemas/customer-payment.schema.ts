import { z } from "zod";

export const COLLECT_PAYMENT_METHODS = ["CASH", "MOBILE_MONEY", "CARD"] as const;
export const collectPaymentMethodSchema = z.enum(COLLECT_PAYMENT_METHODS);

export const recordSalePaymentSchema = z.object({
  amount: z.coerce
    .number()
    .positive("Amount must be greater than 0")
    .max(99_999_999.99),
  paymentMethod: collectPaymentMethodSchema,
  note: z.string().trim().max(300).optional().nullable(),
});

export type CollectPaymentMethod = z.infer<typeof collectPaymentMethodSchema>;
export type RecordSalePaymentInput = z.infer<typeof recordSalePaymentSchema>;

export interface CustomerPaymentRecord {
  id: string;
  customerId: string;
  saleId: string | null;
  amount: string;
  paymentMethod: string;
  note: string | null;
  createdAt: string;
}
