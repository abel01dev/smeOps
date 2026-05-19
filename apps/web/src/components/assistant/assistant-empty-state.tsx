"use client";

import { SUGGESTED_PROMPTS } from "@sme/shared";
import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

export function AssistantEmptyState({
  onSelectPrompt,
  hasApiKey,
  onOpenSettings,
}: {
  onSelectPrompt: (prompt: string) => void;
  hasApiKey: boolean;
  onOpenSettings: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-10 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
        <Sparkles className="h-7 w-7" aria-hidden />
      </div>
      <h2 className="text-xl font-semibold text-slate-900">
        AI Business Assistant
      </h2>
      <p className="mt-2 max-w-md text-sm text-slate-600">
        Ask about sales trends, inventory, top products, and revenue — grounded
        in your live business summary, not raw database exports.
      </p>

      {!hasApiKey ? (
        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <p className="font-medium">Connect OpenRouter</p>
          <p className="mt-1 text-amber-800/90">
            Paste your API key in settings to start chatting. Keys stay on the
            server — never in the browser.
          </p>
          <Button className="mt-3" size="sm" onClick={onOpenSettings}>
            Open settings
          </Button>
        </div>
      ) : (
        <div className="mt-8 grid w-full max-w-2xl gap-2 sm:grid-cols-2">
          {SUGGESTED_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => onSelectPrompt(prompt)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
