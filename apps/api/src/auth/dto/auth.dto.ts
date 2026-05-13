import { loginSchema, registerSchema } from "@sme/shared";
import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export class RegisterDto extends createZodDto(registerSchema) {}
export class LoginDto extends createZodDto(loginSchema) {}

export const refreshSchema = z.object({
  refreshToken: z.string().min(10, "refreshToken is required"),
});
export class RefreshDto extends createZodDto(refreshSchema) {}
