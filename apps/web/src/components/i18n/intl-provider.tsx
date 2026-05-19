"use client";

import { NextIntlClientProvider } from "next-intl";
import * as React from "react";

import amMessages from "../../../messages/am.json";
import enMessages from "../../../messages/en.json";
import { type AppLocale, useLocaleStore } from "@/stores/locale.store";

const MESSAGES: Record<AppLocale, typeof enMessages> = {
  en: enMessages,
  am: amMessages,
};

export function IntlProvider({ children }: { children: React.ReactNode }) {
  const locale = useLocaleStore((s) => s.locale);

  return (
    <NextIntlClientProvider locale={locale} messages={MESSAGES[locale]}>
      {children}
    </NextIntlClientProvider>
  );
}
