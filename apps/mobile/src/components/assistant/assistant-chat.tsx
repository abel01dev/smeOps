import { router } from "expo-router";
import { Send, Settings } from "lucide-react-native";
import * as React from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n/context";
import { aiAssistantApi } from "@/lib/api/ai-assistant";
import {
  useAssistantStore,
  type LocalMessage,
} from "@/stores/assistant.store";

function newLocalId() {
  return `local-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function AssistantChat() {
  const t = useTranslation();
  const [input, setInput] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const activeId = useAssistantStore((s) => s.activeConversationId);
  const messages = useAssistantStore((s) => s.messages);
  const streaming = useAssistantStore((s) => s.streamingContent);
  const setActive = useAssistantStore((s) => s.setActiveConversation);
  const setMessages = useAssistantStore((s) => s.setMessages);
  const appendMessage = useAssistantStore((s) => s.appendMessage);
  const updateMessage = useAssistantStore((s) => s.updateMessage);
  const appendStreaming = useAssistantStore((s) => s.appendStreamingContent);
  const resetStreaming = useAssistantStore((s) => s.resetStreaming);

  React.useEffect(() => {
    if (!activeId) {
      void aiAssistantApi.createConversation().then((c) => {
        setActive(c.id);
        setMessages(
          c.messages.map((m) => ({
            ...m,
            localId: m.id,
          })),
        );
      });
    }
  }, [activeId, setActive, setMessages]);

  const displayMessages: Array<LocalMessage | { localId: string; role: "assistant"; content: string; id: string; model: null; createdAt: string }> =
    React.useMemo(() => {
      if (!streaming) return messages;
      return [
        ...messages,
        {
          localId: "streaming",
          id: "streaming",
          role: "assistant" as const,
          content: streaming,
          model: null,
          createdAt: new Date().toISOString(),
        },
      ];
    }, [messages, streaming]);

  const send = async () => {
    const text = input.trim();
    if (!text || !activeId || sending) return;
    setInput("");
    setSending(true);
    const userMsg: LocalMessage = {
      localId: newLocalId(),
      id: newLocalId(),
      role: "user",
      content: text,
      model: null,
      createdAt: new Date().toISOString(),
    };
    const assistantLocalId = newLocalId();
    appendMessage(userMsg);
    appendMessage({
      localId: assistantLocalId,
      id: assistantLocalId,
      role: "assistant",
      content: "",
      model: "openrouter/free",
      createdAt: new Date().toISOString(),
    });
    resetStreaming();
    let assistantContent = "";

    try {
      await aiAssistantApi.streamChat(
        { conversationId: activeId, message: text },
        (event) => {
          if (event.type === "conversation") {
            setActive(event.conversationId);
          }
          if (event.type === "delta") {
            assistantContent += event.content;
            appendStreaming(event.content);
            updateMessage(assistantLocalId, { content: assistantContent });
          }
          if (event.type === "error") {
            updateMessage(assistantLocalId, { content: event.message });
          }
          if (event.type === "done") {
            updateMessage(assistantLocalId, {
              content: assistantContent || t("assistant.typing"),
              id: event.messageId,
            });
            resetStreaming();
          }
        },
      );
    } catch (e) {
      Alert.alert("Error", (e as Error).message);
      resetStreaming();
    } finally {
      setSending(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={88}
    >
      <View className="flex-row items-center justify-between border-b border-border px-4 py-3">
        <Text className="text-lg font-semibold">{t("nav.assistant")}</Text>
        <Pressable onPress={() => router.push("/(app)/(owner-manager)/profile/settings")}>
          <Settings size={22} color="#64748b" />
        </Pressable>
      </View>

      <FlatList
        data={displayMessages}
        keyExtractor={(m) => m.localId}
        contentContainerClassName="p-4 gap-3"
        renderItem={({ item }) => (
          <View
            className={
              item.role === "user"
                ? "self-end max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-4 py-3"
                : "self-start max-w-[85%] rounded-2xl rounded-bl-sm bg-muted px-4 py-3"
            }
          >
            <Text
              className={
                item.role === "user"
                  ? "text-primary-foreground"
                  : "text-foreground"
              }
            >
              {item.content}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          <Text className="text-center text-muted-foreground py-12">
            {t("assistant.startNewChatHint")}
          </Text>
        }
      />

      <View className="flex-row items-end gap-2 border-t border-border p-3">
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder={t("assistant.inputPlaceholder")}
          multiline
          className="flex-1 max-h-28 rounded-xl border border-input bg-card px-4 py-3 text-foreground"
          placeholderTextColor="#94a3b8"
        />
        <Button
          size="icon"
          onPress={() => void send()}
          loading={sending}
          disabled={!input.trim()}
        >
          <Send size={20} color="#fff" />
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}
