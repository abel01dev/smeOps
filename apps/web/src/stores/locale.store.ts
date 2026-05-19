"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export const LOCALES = ["en", "am"] as const;
export type AppLocale = (typeof LOCALES)[number];

interface LocaleState {
  locale: AppLocale;
  setLocale: (locale: AppLocale) => void;
}

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      locale: "en",
      setLocale: (locale) => set({ locale }),
    }),
    { name: "sme-locale" },
  ),
);
