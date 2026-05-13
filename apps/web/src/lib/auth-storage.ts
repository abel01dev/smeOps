"use client";

import type { AuthTokens, AuthUser } from "@sme/shared";

const TOKENS_KEY = "sme.tokens";
const USER_KEY = "sme.user";

/**
 * Persist auth tokens + user profile in localStorage.
 *
 * For the MVP this is acceptable; for hardening, move to httpOnly cookies
 * via a Next.js Route Handler so JS can't read the access token.
 */
export const authStorage = {
  getTokens(): AuthTokens | null {
    if (typeof window === "undefined") return null;
    const raw = window.localStorage.getItem(TOKENS_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthTokens;
    } catch {
      return null;
    }
  },
  setTokens(t: AuthTokens): void {
    window.localStorage.setItem(TOKENS_KEY, JSON.stringify(t));
  },
  clearTokens(): void {
    window.localStorage.removeItem(TOKENS_KEY);
  },

  getUser(): AuthUser | null {
    if (typeof window === "undefined") return null;
    const raw = window.localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  },
  setUser(u: AuthUser): void {
    window.localStorage.setItem(USER_KEY, JSON.stringify(u));
  },
  clearUser(): void {
    window.localStorage.removeItem(USER_KEY);
  },

  clear(): void {
    authStorage.clearTokens();
    authStorage.clearUser();
  },
};
