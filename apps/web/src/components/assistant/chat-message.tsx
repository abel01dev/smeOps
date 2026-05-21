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
        "flex w-full px-3 py-3 md:px-6",
        isUser ? "justify-end" : "justify-start",
      )}
    >
      <div
        className={cn(
          "flex max-w-[min(100%,42rem)] gap-2.5",
          isUser ? "flex-row-reverse" : "flex-row",
        )}
      >
        <div
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
            isUser
              ? "bg-primary text-primary-foreground"
              : "bg-violet-500/15 text-violet-800 dark:bg-violet-500/20 dark:text-violet-200",
          )}
          aria-hidden
        >
          {isUser ? (
            <User className="h-4 w-4" />
          ) : (
            <Bot className="h-4 w-4" />
          )}
        </div>

        <div
          className={cn(
            "group min-w-0 space-y-1 rounded-2xl px-4 py-2.5",
            isUser
              ? "bg-primary text-primary-foreground"
              : "border border-border bg-card text-foreground shadow-sm",
          )}
        >
          <div
            className={cn(
              "flex items-center gap-2",
              isUser ? "justify-end" : "justify-start",
            )}
          >
            <span
              className={cn(
                "text-[11px] font-medium",
                isUser ? "text-primary-foreground/80" : "text-muted-foreground",
              )}
            >
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
            <p className="whitespace-pre-wrap text-sm leading-relaxed">
              {message.content}
            </p>
          ) : message.streaming && !message.content ? (
            <TypingIndicator label={t("typing")} />
          ) : (
            <MarkdownMessage
              content={message.content || "…"}
              className={cn(
                "prose-invert-0",
                !isUser && "prose-headings:text-foreground prose-p:text-foreground",
              )}
            />
          )}
          {message.streaming && message.content ? (
            <span
              className={cn(
                "inline-block h-4 w-0.5 animate-pulse",
                isUser ? "bg-primary-foreground" : "bg-primary",
              )}
            />
          ) : null}
        </div>
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
