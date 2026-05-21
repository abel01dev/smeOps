"use client";

import type { AiConversationSummary } from "@sme/shared";
import { MessageSquarePlus, PanelLeftClose, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ConversationSidebar({
  conversations,
  activeId,
  isLoading,
  onNewChat,
  onSelect,
  onDelete,
  onClose,
  className,
}: {
  conversations: AiConversationSummary[];
  activeId: string | null;
  isLoading: boolean;
  onNewChat: () => void;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onClose?: () => void;
  className?: string;
}) {
  const t = useTranslations("assistant");
  const tc = useTranslations("common");

  return (
    <aside
      className={cn(
        "flex h-full w-72 shrink-0 flex-col border-r border-border bg-card",
        className,
      )}
    >
      <div className="flex items-center gap-2 border-b border-border p-3">
        <Button className="flex-1 justify-start gap-2" size="sm" onClick={onNewChat}>
          <MessageSquarePlus className="h-4 w-4" />
          {t("newChat")}
        </Button>
        {onClose ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0 lg:hidden"
            onClick={onClose}
            aria-label={t("closeSidebar")}
          >
            <PanelLeftClose className="h-4 w-4" />
          </Button>
        ) : null}
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {isLoading ? (
          <p className="px-2 py-4 text-xs text-muted-foreground">{tc("loading")}</p>
        ) : conversations.length === 0 ? (
          <p className="px-2 py-4 text-xs text-muted-foreground">{t("startNewChatHint")}</p>
        ) : (
          <ul className="space-y-0.5">
            {conversations.map((c) => {
              const active = c.id === activeId;
              return (
                <li key={c.id}>
                  <div
                    className={cn(
                      "group flex items-center gap-1 rounded-lg",
                      active ? "bg-muted" : "hover:bg-muted/50",
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => onSelect(c.id)}
                      className={cn(
                        "min-w-0 flex-1 px-3 py-2.5 text-left text-sm",
                        active ? "font-medium text-foreground" : "text-foreground",
                      )}
                    >
                      <span className="line-clamp-1">{c.title}</span>
                      {c.lastMessagePreview ? (
                        <span className="mt-0.5 line-clamp-1 block text-xs text-muted-foreground">
                          {c.lastMessagePreview}
                        </span>
                      ) : null}
                    </button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="mr-1 h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100"
                      aria-label={t("deleteChat")}
                      onClick={() => onDelete(c.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </aside>
  );
}
