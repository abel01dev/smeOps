import axios, {
  type AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";

import { authStorage } from "./auth-storage";

export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: false,
});

apiClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const tokens = await authStorage.getTokens();
  if (tokens?.accessToken) {
    config.headers.set("Authorization", `Bearer ${tokens.accessToken}`);
  }
  return config;
});

interface RetriableRequest extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

let refreshing: Promise<string | null> | null = null;
let onUnauthorized: (() => void) | null = null;

export function setUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler;
}

async function refreshAccessToken(): Promise<string | null> {
  if (refreshing) return refreshing;

  refreshing = (async () => {
    const tokens = await authStorage.getTokens();
    if (!tokens?.refreshToken) return null;
    try {
      const res = await axios.post<{
        success: true;
        data: { accessToken: string; refreshToken: string };
      }>(`${API_URL}/auth/refresh`, { refreshToken: tokens.refreshToken });
      const next = res.data.data;
      await authStorage.setTokens(next);
      return next.accessToken;
    } catch {
      return null;
    } finally {
      refreshing = null;
    }
  })();

  return refreshing;
}

apiClient.interceptors.response.use(
  (res) => {
    if (
      res.data &&
      typeof res.data === "object" &&
      "success" in res.data &&
      res.data.success === true &&
      "data" in res.data
    ) {
      return { ...res, data: res.data.data };
    }
    return res;
  },
  async (err: AxiosError<{ message?: string; error?: string }>) => {
    const original = err.config as RetriableRequest | undefined;
    const status = err.response?.status;
    const isAuthCall = original?.url?.includes("/auth/");

    if (status === 401 && original && !original._retry && !isAuthCall) {
      original._retry = true;
      const newToken = await refreshAccessToken();
      if (newToken) {
        original.headers.set("Authorization", `Bearer ${newToken}`);
        return apiClient(original);
      }
      await authStorage.clear();
      onUnauthorized?.();
    }

    const message =
      err.response?.data?.message ??
      err.message ??
      "Something went wrong. Please try again.";
    return Promise.reject(new Error(message));
  },
);
