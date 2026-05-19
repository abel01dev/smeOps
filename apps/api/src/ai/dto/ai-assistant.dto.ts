import { createZodDto } from "nestjs-zod";
import {
  chatStreamSchema,
  createConversationSchema,
  updateAiSettingsSchema,
  updateConversationSchema,
} from "@sme/shared";

export class UpdateAiSettingsDto extends createZodDto(updateAiSettingsSchema) {}
export class CreateConversationDto extends createZodDto(createConversationSchema) {}
export class UpdateConversationDto extends createZodDto(updateConversationSchema) {}
export class ChatStreamDto extends createZodDto(chatStreamSchema) {}
