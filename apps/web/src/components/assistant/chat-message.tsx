"use client";

import { Bot, User } from "lucide-react";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";
import type { LocalMessage } from "@/stores/assistant.store";

import { CopyButton } from "./copy-button";
import { MarkdownMessage } from "./markdown-message";

export function ChatMessage({ message }: { message: LocalMessage }) {
  const t = useTranslations("assistant");
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "group flex gap-3 px-3 py-4 md:px-6",
        isUser ? "bg-transparent" : "bg-muted/50",
      )}
    >
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-violet-500/15 text-violet-800 dark:bg-violet-500/20 dark:text-violet-200",
        )}
      >
        {isUser ? (
          <User className="h-4 w-4" aria-hidden />
        ) : (
          <Bot className="h-4 w-4" aria-hidden />
        )}
      </div>

      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            {isUser ? t("you") : t("aiLabel")}
          </span>
          {!isUser && message.content ? (
            <CopyButton
              text={message.content}
              className="opacity-0 transition-opacity group-hover:opacity-100"
            />
          ) : null}
        </div>

        {isUser ? (
          <p className="whitespace-pre-wrap text-sm text-foreground">
            {message.content}
          </p>
        ) : message.streaming && !message.content ? (
          <TypingIndicator label={t("typing")} />
        ) : (
          <MarkdownMessage content={message.content || "…"} />
        )}
        {message.streaming && message.content ? (
          <span className="inline-block h-4 w-0.5 animate-pulse bg-primary" />
        ) : null}
      </div>
    </div>
  );
}

function TypingIndicator({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-1 py-1" aria-label={label}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}
