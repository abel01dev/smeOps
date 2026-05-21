import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

export type AppLocale = "en" | "am";

interface LocaleState {
  locale: AppLocale;
  hydrate: () => Promise<void>;
  setLocale: (locale: AppLocale) => Promise<void>;
}

const KEY = "sme.locale";

export const useLocaleStore = create<LocaleState>((set) => ({
  locale: "en",

  hydrate: async () => {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw === "en" || raw === "am") set({ locale: raw });
  },

  setLocale: async (locale) => {
    await AsyncStorage.setItem(KEY, locale);
    set({ locale });
  },
}));
