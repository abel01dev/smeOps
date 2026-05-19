"use client";

import type {
  AiConversationSummary,
  AiMessageDto,
  AiSettingsResponse,
} from "@sme/shared";
import { create } from "zustand";

export interface LocalMessage extends AiMessageDto {
  /** Optimistic or in-flight assistant stream */
  streaming?: boolean;
}

interface AssistantState {
  settings: AiSettingsResponse | null;
  conversations: AiConversationSummary[];
  activeConversationId: string | null;
  messages: LocalMessage[];
  isLoadingConversations: boolean;
  isLoadingMessages: boolean;
  isStreaming: boolean;
  sidebarOpen: boolean;
  settingsOpen: boolean;
  draft: string;

  setSettings: (s: AiSettingsResponse | null) => void;
  setConversations: (c: AiConversationSummary[]) => void;
  setActiveConversationId: (id: string | null) => void;
  setMessages: (m: LocalMessage[]) => void;
  appendMessage: (m: LocalMessage) => void;
  updateLastAssistant: (content: string, done?: boolean) => void;
  setLoadingConversations: (v: boolean) => void;
  setLoadingMessages: (v: boolean) => void;
  setStreaming: (v: boolean) => void;
  setSidebarOpen: (v: boolean) => void;
  setSettingsOpen: (v: boolean) => void;
  setDraft: (v: string) => void;
  resetChat: () => void;
}

export const useAssistantStore = create<AssistantState>((set) => ({
  settings: null,
  conversations: [],
  activeConversationId: null,
  messages: [],
  isLoadingConversations: false,
  isLoadingMessages: false,
  isStreaming: false,
  sidebarOpen: false,
  settingsOpen: false,
  draft: "",

  setSettings: (settings) => set({ settings }),
  setConversations: (conversations) => set({ conversations }),
  setActiveConversationId: (activeConversationId) =>
    set({ activeConversationId }),
  setMessages: (messages) => set({ messages }),
  appendMessage: (m) =>
    set((s) => ({ messages: [...s.messages, m] })),
  updateLastAssistant: (content, done) =>
    set((s) => {
      const messages = [...s.messages];
      const last = messages[messages.length - 1];
      if (!last || last.role !== "assistant") return s;
      messages[messages.length - 1] = {
        ...last,
        content,
        streaming: done ? false : true,
      };
      return { messages };
    }),
  setLoadingConversations: (isLoadingConversations) =>
    set({ isLoadingConversations }),
  setLoadingMessages: (isLoadingMessages) => set({ isLoadingMessages }),
  setStreaming: (isStreaming) => set({ isStreaming }),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  setSettingsOpen: (settingsOpen) => set({ settingsOpen }),
  setDraft: (draft) => set({ draft }),
  resetChat: () =>
    set({
      activeConversationId: null,
      messages: [],
      draft: "",
    }),
}));
