import type {
  AuthResponse,
  AuthUser,
  LoginInput,
  RegisterInput,
} from "@sme/shared";

import { apiClient } from "../api-client";

export const authApi = {
  register: (input: RegisterInput) =>
    apiClient.post<AuthResponse>("/auth/register", input).then((r) => r.data),
  login: (input: LoginInput) =>
    apiClient.post<AuthResponse>("/auth/login", input).then((r) => r.data),
  me: () => apiClient.get<AuthUser>("/auth/me").then((r) => r.data),
};
