import type { AuthTokens, AuthUser } from "@sme/shared";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKENS_KEY = "sme.tokens";
const USER_KEY = "sme.user";

export const authStorage = {
  async getTokens(): Promise<AuthTokens | null> {
    const raw = await SecureStore.getItemAsync(TOKENS_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthTokens;
    } catch {
      return null;
    }
  },

  async setTokens(t: AuthTokens): Promise<void> {
    await SecureStore.setItemAsync(TOKENS_KEY, JSON.stringify(t));
  },

  async clearTokens(): Promise<void> {
    await SecureStore.deleteItemAsync(TOKENS_KEY);
  },

  async getUser(): Promise<AuthUser | null> {
    const raw = await AsyncStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  },

  async setUser(u: AuthUser): Promise<void> {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(u));
  },

  async clearUser(): Promise<void> {
    await AsyncStorage.removeItem(USER_KEY);
  },

  async clear(): Promise<void> {
    await authStorage.clearTokens();
    await authStorage.clearUser();
  },
};
