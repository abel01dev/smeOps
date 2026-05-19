"use client";

import * as React from "react";

import { useLocaleStore } from "@/stores/locale.store";

/** Keeps document `lang` in sync with the selected UI locale. */
export function LocaleHtmlSync() {
  const locale = useLocaleStore((s) => s.locale);

  React.useEffect(() => {
    document.documentElement.lang = locale === "am" ? "am" : "en";
  }, [locale]);

  return null;
}
