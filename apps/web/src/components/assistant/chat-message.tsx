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
        isUser ? "bg-transparent" : "bg-slate-50/80",
      )}
    >
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
          isUser ? "bg-slate-900 text-white" : "bg-violet-100 text-violet-700",
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
          <span className="text-xs font-medium text-slate-500">
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
          <p className="whitespace-pre-wrap text-sm text-slate-900">
            {message.content}
          </p>
        ) : message.streaming && !message.content ? (
          <TypingIndicator label={t("typing")} />
        ) : (
          <MarkdownMessage content={message.content || "…"} />
        )}
        {message.streaming && message.content ? (
          <span className="inline-block h-4 w-0.5 animate-pulse bg-violet-500" />
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
          className="h-2 w-2 rounded-full bg-slate-400 animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}
