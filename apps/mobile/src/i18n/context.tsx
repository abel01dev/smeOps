import * as React from "react";

import { createTranslator, type TranslateFn } from "./index";
import { useLocaleStore } from "@/stores/locale.store";

const I18nContext = React.createContext<TranslateFn>((key) => key);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const locale = useLocaleStore((s) => s.locale);
  const t = React.useMemo(() => createTranslator(locale), [locale]);
  return <I18nContext.Provider value={t}>{children}</I18nContext.Provider>;
}

export function useTranslation() {
  return React.useContext(I18nContext);
}
