"use client";

import { PanelLeft, Settings } from "lucide-react";
import { useTranslations } from "next-intl";
import * as React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import type { ChatStreamInput } from "@sme/shared";

import { aiAssistantApi } from "@/lib/api/ai-assistant";
import { useAssistantStore } from "@/stores/assistant.store";

import { AssistantEmptyState } from "./assistant-empty-state";
import { AssistantSettingsDialog } from "./assistant-settings-dialog";
import { ChatInput } from "./chat-input";
import { ChatMessage } from "./chat-message";
import { ConversationSidebar } from "./conversation-sidebar";
import { ModelSelector } from "./model-selector";

export function AssistantChat() {
  const t = useTranslations("assistant");
  const tc = useTranslations("common");
  const {
    settings,
    setSettings,
    conversations,
    setConversations,
    activeConversationId,
    setActiveConversationId,
    messages,
    setMessages,
    appendMessage,
    updateLastAssistant,
    isLoadingConversations,
    setLoadingConversations,
    isLoadingMessages,
    setLoadingMessages,
    isStreaming,
    setStreaming,
    sidebarOpen,
    setSidebarOpen,
    settingsOpen,
    setSettingsOpen,
    draft,
    setDraft,
    resetChat,
  } = useAssistantStore();

  const [selectedModel, setSelectedModel] = React.useState("openrouter/free");
  const abortRef = React.useRef<AbortController | null>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const bottomRef = React.useRef<HTMLDivElement>(null);

  const loadSettings = React.useCallback(async () => {
    try {
      const s = await aiAssistantApi.settings();
      setSettings(s);
      setSelectedModel(s.preferredModel);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("loadSettingsFailed"));
    }
  }, [setSettings]);

  const loadConversations = React.useCallback(async () => {
    setLoadingConversations(true);
    try {
      const list = await aiAssistantApi.listConversations();
      setConversations(list);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("loadChatsFailed"));
    } finally {
      setLoadingConversations(false);
    }
  }, [setConversations, setLoadingConversations]);

  React.useEffect(() => {
    void loadSettings();
    void loadConversations();
  }, [loadSettings, loadConversations]);

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  const openConversation = async (id: string) => {
    setActiveConversationId(id);
    setLoadingMessages(true);
    setSidebarOpen(false);
    try {
      const detail = await aiAssistantApi.getConversation(id);
      setMessages(
        detail.messages.map((m) => ({
          ...m,
          streaming: false,
        })),
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("loadChatFailed"));
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleNewChat = () => {
    abortRef.current?.abort();
    resetChat();
    setSidebarOpen(false);
  };

  const handleDelete = async (id: string) => {
    try {
      await aiAssistantApi.deleteConversation(id);
      setConversations(conversations.filter((c) => c.id !== id));
      if (activeConversationId === id) handleNewChat();
      toast.success(t("deleted"));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("deleteFailed"));
    }
  };

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isStreaming) return;
    if (!settings?.hasApiKey) {
      setSettingsOpen(true);
      return;
    }

    setDraft("");
    appendMessage({
      id: `local-user-${Date.now()}`,
      role: "user",
      content: trimmed,
      model: null,
      createdAt: new Date().toISOString(),
    });
    appendMessage({
      id: `local-assistant-${Date.now()}`,
      role: "assistant",
      content: "",
      model: selectedModel,
      createdAt: new Date().toISOString(),
      streaming: true,
    });

    setStreaming(true);
    abortRef.current = new AbortController();
    let conversationId = activeConversationId ?? undefined;
    let assistantContent = "";

    try {
      await aiAssistantApi.streamChat(
        {
          conversationId,
          message: trimmed,
          model: selectedModel as ChatStreamInput["model"],
        },
        (event) => {
          if (event.type === "conversation") {
            conversationId = event.conversationId;
            setActiveConversationId(event.conversationId);
            if (event.title) {
              setConversations(
                conversations.map((c) =>
                  c.id === event.conversationId
                    ? { ...c, title: event.title! }
                    : c,
                ),
              );
            }
            void loadConversations();
          }
          if (event.type === "delta") {
            assistantContent += event.content;
            updateLastAssistant(assistantContent, false);
          }
          if (event.type === "error") {
            toast.error(event.message);
            updateLastAssistant(event.message, true);
          }
          if (event.type === "done") {
            updateLastAssistant(assistantContent || "Done.", true);
          }
        },
        abortRef.current.signal,
      );
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        toast.error(e instanceof Error ? e.message : t("chatFailed"));
        updateLastAssistant(t("chatError"), true);
      }
    } finally {
      setStreaming(false);
      void loadConversations();
    }
  };

  const stopStreaming = () => {
    abortRef.current?.abort();
    setStreaming(false);
  };

  const sidebar = (
    <ConversationSidebar
      conversations={conversations}
      activeId={activeConversationId}
      isLoading={isLoadingConversations}
      onNewChat={handleNewChat}
      onSelect={openConversation}
      onDelete={handleDelete}
      onClose={() => setSidebarOpen(false)}
      className={sidebarOpen ? "flex" : "hidden lg:flex"}
    />
  );

  return (
    <div className="flex h-full min-h-0 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      {sidebarOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          aria-label="Close sidebar overlay"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}

      <div
        className={
          sidebarOpen
            ? "fixed inset-y-0 left-0 z-30 flex lg:static lg:z-auto"
            : "hidden lg:flex"
        }
      >
        {sidebar}
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex shrink-0 items-center gap-2 border-b border-border px-3 py-2 md:px-4">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
            aria-label={t("openConversations")}
          >
            <PanelLeft className="h-5 w-5" />
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-sm font-semibold text-foreground">
              {t("aiLabel")}
            </h1>
          </div>
          {settings ? (
            <ModelSelector
              settings={settings}
              value={selectedModel}
              onChange={(m) => {
                setSelectedModel(m);
                void aiAssistantApi
                  .updateSettings({
                    preferredModel: m as ChatStreamInput["model"],
                  })
                  .then(setSettings)
                  .catch(() => undefined);
              }}
              disabled={isStreaming}
            />
          ) : null}
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setSettingsOpen(true)}
            aria-label={tc("settings")}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          {isLoadingMessages ? (
            <p className="p-6 text-center text-sm text-muted-foreground">{t("loadingChat")}</p>
          ) : messages.length === 0 ? (
            <AssistantEmptyState
              hasApiKey={Boolean(settings?.hasApiKey)}
              onOpenSettings={() => setSettingsOpen(true)}
              onSelectPrompt={(p) => {
                setDraft(p);
                void sendMessage(p);
              }}
            />
          ) : (
            <div className="mx-auto max-w-3xl">
              {messages.map((m) => (
                <ChatMessage key={m.id} message={m} />
              ))}
              <div ref={bottomRef} className="h-4" />
            </div>
          )}
        </div>

        <ChatInput
          value={draft}
          onChange={setDraft}
          onSubmit={() => void sendMessage(draft)}
          onStop={stopStreaming}
          disabled={!settings?.hasApiKey}
          isStreaming={isStreaming}
        />
      </div>

      <AssistantSettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        settings={settings}
        onSaved={(s) => {
          setSettings(s);
          setSelectedModel(s.preferredModel);
        }}
      />
    </div>
  );
}
