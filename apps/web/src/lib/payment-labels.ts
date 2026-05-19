import type { PaymentMethod } from "@sme/shared";

export const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  CASH: "Cash",
  MOBILE_MONEY: "Mobile money",
  CARD: "Card",
};

export function formatSaleDate(iso: string): string {
  return new Intl.DateTimeFormat("en-ET", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}
