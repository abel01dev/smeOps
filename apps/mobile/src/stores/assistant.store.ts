import type { AiMessageDto } from "@sme/shared";
import { create } from "zustand";

export interface LocalMessage extends AiMessageDto {
  localId: string;
}

interface AssistantState {
  activeConversationId: string | null;
  messages: LocalMessage[];
  streamingContent: string;
  setActiveConversation: (id: string | null) => void;
  setMessages: (messages: LocalMessage[]) => void;
  appendMessage: (message: LocalMessage) => void;
  updateMessage: (localId: string, patch: Partial<LocalMessage>) => void;
  setStreamingContent: (content: string) => void;
  appendStreamingContent: (chunk: string) => void;
  resetStreaming: () => void;
}

export const useAssistantStore = create<AssistantState>((set) => ({
  activeConversationId: null,
  messages: [],
  streamingContent: "",

  setActiveConversation: (id) =>
    set({ activeConversationId: id, messages: [], streamingContent: "" }),

  setMessages: (messages) => set({ messages }),

  appendMessage: (message) =>
    set((s) => ({ messages: [...s.messages, message] })),

  updateMessage: (localId, patch) =>
    set((s) => ({
      messages: s.messages.map((m) =>
        m.localId === localId ? { ...m, ...patch } : m,
      ),
    })),

  setStreamingContent: (content) => set({ streamingContent: content }),

  appendStreamingContent: (chunk) =>
    set((s) => ({ streamingContent: s.streamingContent + chunk })),

  resetStreaming: () => set({ streamingContent: "" }),
}));
