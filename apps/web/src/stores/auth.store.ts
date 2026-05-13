"use client";

import type { AuthUser } from "@sme/shared";
import { create } from "zustand";

import { authApi } from "@/lib/api/auth";
import { authStorage } from "@/lib/auth-storage";

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isInitialized: boolean;
  /** Restore session from localStorage on first app load. */
  hydrate: () => Promise<void>;
  /** Set after a successful register/login response from our API. */
  setSession: (
    user: AuthUser,
    tokens: { accessToken: string; refreshToken: string },
  ) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  isInitialized: false,

  hydrate: async () => {
    if (get().isInitialized) return;
    const tokens = authStorage.getTokens();
    if (!tokens) {
      set({ isInitialized: true });
      return;
    }
    set({ isLoading: true });
    try {
      const user = await authApi.me();
      authStorage.setUser(user);
      set({ user, isLoading: false, isInitialized: true });
    } catch {
      authStorage.clear();
      set({ user: null, isLoading: false, isInitialized: true });
    }
  },

  setSession: (user, tokens) => {
    authStorage.setTokens(tokens);
    authStorage.setUser(user);
    set({ user, isInitialized: true });
  },

  logout: () => {
    authStorage.clear();
    set({ user: null });
  },
}));
