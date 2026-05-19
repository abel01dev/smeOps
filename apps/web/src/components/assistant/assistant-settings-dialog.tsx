"use client";

import type { AiSettingsResponse, ChatStreamInput } from "@sme/shared";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("assistant");
  const tc = useTranslations("common");
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
      toast.success(t("saved"));
      onOpenChange(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("saveFailed"));
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
      toast.success(t("keyRemoved"));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("clearFailed"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("settingsTitle")}</DialogTitle>
          <DialogDescription>{t("settingsDesc")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>{t("preferredModel")}</Label>
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
            <Label htmlFor="openrouter-key">{t("apiKey")}</Label>
            <Input
              id="openrouter-key"
              type="password"
              placeholder={
                settings?.hasApiKey
                  ? t("apiKeySavedPlaceholder")
                  : t("apiKeyPlaceholder")
              }
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              autoComplete="off"
            />
            <p className="text-xs text-slate-500">
              {t("getKeyAt")}{" "}
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
              {t("clearKey")}
            </Button>
          ) : null}
          <Button type="button" onClick={save} disabled={saving}>
            {saving ? tc("saving") : tc("save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
