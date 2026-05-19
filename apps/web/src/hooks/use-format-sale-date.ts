"use client";

import { useLocaleStore } from "@/stores/locale.store";
import { intlLocale } from "@/lib/i18n-locale";

export function useFormatSaleDate() {
  const locale = useLocaleStore((s) => s.locale);

  return (iso: string) =>
    new Intl.DateTimeFormat(intlLocale(locale), {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
}
