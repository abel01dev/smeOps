import { z } from "zod";

/** Free OpenRouter models — UI ids map to `*:free` slugs in OpenRouterService. */
export const AI_CHAT_MODELS = [
  {
    id: "openrouter/free",
    label: "Auto (free)",
    description: "Picks an available free model — recommended",
  },
  {
    id: "deepseek/deepseek-chat",
    label: "DeepSeek Chat",
    description: "Strong reasoning — free tier",
  },
  {
    id: "mistralai/mistral-7b-instruct",
    label: "Mistral 7B",
    description: "Fast instruct model — free tier",
  },
  {
    id: "meta-llama/llama-3.2-3b-instruct",
    label: "Llama 3.2 3B",
    description: "Meta lightweight instruct — free tier",
  },
  {
    id: "google/gemma-3-12b-it",
    label: "Gemma 3 12B",
    description: "Google instruct — free tier",
  },
] as const;

/** @deprecated Stored on older rows — mapped to replacements at runtime */
export const LEGACY_AI_MODEL_IDS = [
  "meta-llama/llama-3-8b-instruct",
  "google/gemma-7b-it",
] as const;

export const AI_MODEL_IDS = AI_CHAT_MODELS.map((m) => m.id) as [
  (typeof AI_CHAT_MODELS)[number]["id"],
  ...(typeof AI_CHAT_MODELS)[number]["id"][],
];

const ALL_MODEL_IDS = [...AI_MODEL_IDS, ...LEGACY_AI_MODEL_IDS] as const;

export const aiModelIdSchema = z.enum(ALL_MODEL_IDS);

export function normalizeAiModelId(modelId: string): (typeof AI_MODEL_IDS)[number] {
  const legacy: Record<string, (typeof AI_MODEL_IDS)[number]> = {
    "meta-llama/llama-3-8b-instruct": "meta-llama/llama-3.2-3b-instruct",
    "google/gemma-7b-it": "google/gemma-3-12b-it",
  };
  if (legacy[modelId]) return legacy[modelId];
  if ((AI_MODEL_IDS as readonly string[]).includes(modelId)) {
    return modelId as (typeof AI_MODEL_IDS)[number];
  }
  return "openrouter/free";
}

export const updateAiSettingsSchema = z.object({
  preferredModel: aiModelIdSchema.optional(),
  /** Omit to leave unchanged; empty string clears the stored key. */
  openRouterApiKey: z.string().optional(),
});
export type UpdateAiSettingsInput = z.infer<typeof updateAiSettingsSchema>;

export interface AiSettingsResponse {
  preferredModel: string;
  hasApiKey: boolean;
  models: typeof AI_CHAT_MODELS;
}

export interface AiConversationSummary {
  id: string;
  title: string;
  updatedAt: string;
  messageCount: number;
  lastMessagePreview: string | null;
}

export interface AiMessageDto {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  model: string | null;
  createdAt: string;
}

export interface AiConversationDetail {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: AiMessageDto[];
}

export const createConversationSchema = z.object({
  title: z.string().trim().min(1).max(120).optional(),
});
export type CreateConversationInput = z.infer<typeof createConversationSchema>;

export const updateConversationSchema = z.object({
  title: z.string().trim().min(1).max(120),
});
export type UpdateConversationInput = z.infer<typeof updateConversationSchema>;

export const chatStreamSchema = z.object({
  conversationId: z.string().cuid().optional(),
  message: z.string().trim().min(1).max(8000),
  model: aiModelIdSchema.optional(),
});
export type ChatStreamInput = z.infer<typeof chatStreamSchema>;

/** SSE events emitted by POST /ai/chat/stream */
export type AiStreamEvent =
  | { type: "conversation"; conversationId: string; title?: string }
  | { type: "delta"; content: string }
  | { type: "done"; messageId: string }
  | { type: "error"; message: string };

export const SUGGESTED_PROMPTS = [
  "What are my top-selling products this month?",
  "Why might my sales be slowing down?",
  "Which products are low in stock?",
  "Summarize this week's revenue trends.",
  "How can I improve profit margins?",
  "What should I restock first?",
] as const;
