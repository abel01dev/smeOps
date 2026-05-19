import type { PaymentMethod } from "@sme/shared";

/** @deprecated Use `usePaymentLabels()` in client components. */
export const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  CASH: "Cash",
  MOBILE_MONEY: "Mobile money",
  CARD: "Card",
};

/** @deprecated Use `useFormatSaleDate()` in client components. */
export function formatSaleDate(iso: string): string {
  return new Intl.DateTimeFormat("en-ET", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}
