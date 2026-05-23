import { z } from "zod";

const phoneSchema = z
  .string()
  .trim()
  .max(20)
  .regex(/^[0-9+\-\s()]*$/, "Phone can only contain digits and + - ( ) space")
  .optional()
  .nullable();

export const createCustomerSchema = z.object({
  name: z.string().trim().min(1, "Customer name is required").max(120),
  phone: phoneSchema,
  address: z.string().trim().max(200).optional().nullable(),
});

export const updateCustomerSchema = createCustomerSchema.partial();

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;

export interface Customer {
  id: string;
  name: string;
  phone: string | null;
  address: string | null;
  totalSpent: string;
  outstandingBalance: string;
  creditLimit: string | null;
  salesCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerSaleSummary {
  id: string;
  total: string;
  amountPaid: string;
  amountDue: string;
  paymentStatus: string;
  paymentMethod: string;
  dueDate: string | null;
  createdAt: string;
  items: Array<{
    productName: string;
    quantity: number;
    lineTotal: string;
  }>;
}

export interface CustomerDetail extends Customer {
  recentSales: CustomerSaleSummary[];
  openSales?: CustomerSaleSummary[];
}
