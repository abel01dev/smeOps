import type { AuthUser } from "@sme/shared";
import { create } from "zustand";

import { authApi } from "@/lib/api/auth";
import { authStorage } from "@/lib/auth-storage";

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isInitialized: boolean;
  hydrate: () => Promise<void>;
  setSession: (
    user: AuthUser,
    tokens: { accessToken: string; refreshToken: string },
  ) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  isInitialized: false,

  hydrate: async () => {
    if (get().isInitialized) return;
    const tokens = await authStorage.getTokens();
    if (!tokens) {
      set({ isInitialized: true });
      return;
    }
    set({ isLoading: true });
    try {
      const user = await authApi.me();
      await authStorage.setUser(user);
      set({ user, isLoading: false, isInitialized: true });
    } catch {
      await authStorage.clear();
      set({ user: null, isLoading: false, isInitialized: true });
    }
  },

  setSession: async (user, tokens) => {
    await authStorage.setTokens(tokens);
    await authStorage.setUser(user);
    set({ user, isInitialized: true });
  },

  logout: async () => {
    await authStorage.clear();
    set({ user: null });
  },
}));
