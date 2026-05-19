"use client";

import type { AiSettingsResponse, ChatStreamInput } from "@sme/shared";
import * as React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { aiAssistantApi } from "@/lib/api/ai-assistant";

export function AssistantSettingsDialog({
  open,
  onOpenChange,
  settings,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: AiSettingsResponse | null;
  onSaved: (s: AiSettingsResponse) => void;
}) {
  const [model, setModel] = React.useState(
    settings?.preferredModel ?? "openrouter/free",
  );
  const [apiKey, setApiKey] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (settings) setModel(settings.preferredModel);
    setApiKey("");
  }, [settings, open]);

  const save = async () => {
    setSaving(true);
    try {
      const next = await aiAssistantApi.updateSettings({
        preferredModel: model as ChatStreamInput["model"],
        ...(apiKey.trim() ? { openRouterApiKey: apiKey.trim() } : {}),
      });
      onSaved(next);
      toast.success("Assistant settings saved");
      onOpenChange(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const clearKey = async () => {
    setSaving(true);
    try {
      const next = await aiAssistantApi.updateSettings({
        openRouterApiKey: "",
        preferredModel: model as ChatStreamInput["model"],
      });
      onSaved(next);
      setApiKey("");
      toast.success("API key removed");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to clear key");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assistant settings</DialogTitle>
          <DialogDescription>
            Your OpenRouter API key is encrypted and stored on the server. It is
            never sent to the browser after saving.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Preferred model</Label>
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(settings?.models ?? []).map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="openrouter-key">OpenRouter API key</Label>
            <Input
              id="openrouter-key"
              type="password"
              placeholder={
                settings?.hasApiKey
                  ? "•••••••••••••••• (saved — paste to replace)"
                  : "sk-or-…"
              }
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              autoComplete="off"
            />
            <p className="text-xs text-slate-500">
              Get a free key at{" "}
              <a
                href="https://openrouter.ai/keys"
                target="_blank"
                rel="noreferrer"
                className="underline"
              >
                openrouter.ai/keys
              </a>
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          {settings?.hasApiKey ? (
            <Button
              type="button"
              variant="outline"
              onClick={clearKey}
              disabled={saving}
            >
              Remove key
            </Button>
          ) : null}
          <Button type="button" onClick={save} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
