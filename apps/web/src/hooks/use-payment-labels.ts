"use client";

import type { PaymentMethod } from "@sme/shared";
import { useTranslations } from "next-intl";

export function usePaymentLabel(method: PaymentMethod): string {
  const t = useTranslations("payments");
  return t(method);
}

export function usePaymentLabels(): Record<PaymentMethod, string> {
  const t = useTranslations("payments");
  return {
    CASH: t("CASH"),
    MOBILE_MONEY: t("MOBILE_MONEY"),
    CARD: t("CARD"),
    CREDIT: t("CREDIT"),
  };
}

export function useSalePaymentStatusLabels(): Record<
  "PAID" | "PARTIAL" | "UNPAID",
  string
> {
  const t = useTranslations("salePaymentStatus");
  return {
    PAID: t("PAID"),
    PARTIAL: t("PARTIAL"),
    UNPAID: t("UNPAID"),
  };
}
