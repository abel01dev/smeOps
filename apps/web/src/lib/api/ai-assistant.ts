"use client";

import type {
  AiConversationDetail,
  AiConversationSummary,
  AiSettingsResponse,
  AiStreamEvent,
  ChatStreamInput,
  UpdateAiSettingsInput,
} from "@sme/shared";

import { authStorage } from "../auth-storage";
import { apiClient } from "../api-client";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

export const aiAssistantApi = {
  settings: () =>
    apiClient.get<AiSettingsResponse>("/ai/settings").then((r) => r.data),

  updateSettings: (body: UpdateAiSettingsInput) =>
    apiClient.put<AiSettingsResponse>("/ai/settings", body).then((r) => r.data),

  listConversations: () =>
    apiClient
      .get<AiConversationSummary[]>("/ai/conversations")
      .then((r) => r.data),

  createConversation: (title?: string) =>
    apiClient
      .post<AiConversationDetail>("/ai/conversations", { title })
      .then((r) => r.data),

  getConversation: (id: string) =>
    apiClient
      .get<AiConversationDetail>(`/ai/conversations/${id}`)
      .then((r) => r.data),

  deleteConversation: (id: string) =>
    apiClient.delete(`/ai/conversations/${id}`),

  renameConversation: (id: string, title: string) =>
    apiClient
      .patch<AiConversationSummary>(`/ai/conversations/${id}`, { title })
      .then((r) => r.data),

  streamChat: async (
    input: ChatStreamInput,
    onEvent: (event: AiStreamEvent) => void,
    signal?: AbortSignal,
  ): Promise<void> => {
    const tokens = authStorage.getTokens();
    const res = await fetch(`${API_URL}/ai/chat/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(tokens?.accessToken
          ? { Authorization: `Bearer ${tokens.accessToken}` }
          : {}),
      },
      body: JSON.stringify(input),
      signal,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => null);
      const message =
        (err as { message?: string })?.message ??
        `Request failed (${res.status})`;
      throw new Error(message);
    }

    if (!res.body) throw new Error("No response stream");

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const parts = buffer.split("\n\n");
      buffer = parts.pop() ?? "";

      for (const part of parts) {
        const line = part
          .split("\n")
          .find((l) => l.startsWith("data:"));
        if (!line) continue;
        try {
          const event = JSON.parse(line.slice(5).trim()) as AiStreamEvent;
          onEvent(event);
        } catch {
          // ignore
        }
      }
    }
  },
};
