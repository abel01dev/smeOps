import { z } from "zod";

export const registerSchema = z.object({
  organizationName: z
    .string({ required_error: "Business name is required" })
    .trim()
    .min(2, "Business name must be at least 2 characters")
    .max(80),
  name: z
    .string({ required_error: "Your name is required" })
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(80),
  email: z.string().trim().toLowerCase().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password is too long"),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: "OWNER" | "MANAGER" | "CASHIER";
  organizationId: string;
  organizationName: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: AuthUser;
  tokens: AuthTokens;
}
