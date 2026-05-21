import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

export type ThemeMode = "light" | "dark" | "system";

interface ThemeState {
  mode: ThemeMode;
  hydrate: () => Promise<void>;
  setMode: (mode: ThemeMode) => Promise<void>;
}

const KEY = "sme.theme";

export const useThemeStore = create<ThemeState>((set) => ({
  mode: "system",

  hydrate: async () => {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw === "light" || raw === "dark" || raw === "system") {
      set({ mode: raw });
    }
  },

  setMode: async (mode) => {
    await AsyncStorage.setItem(KEY, mode);
    set({ mode });
  },
}));
