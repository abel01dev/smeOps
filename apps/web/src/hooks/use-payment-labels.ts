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
  };
}
