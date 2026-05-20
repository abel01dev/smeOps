"use client";

import type { AiSettingsResponse } from "@sme/shared";
import { useTranslations } from "next-intl";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function ModelSelector({
  settings,
  value,
  onChange,
  disabled,
}: {
  settings: AiSettingsResponse;
  value: string;
  onChange: (modelId: string) => void;
  disabled?: boolean;
}) {
  const t = useTranslations("assistant");
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className="h-9 w-[min(16rem,50vw)] border-border bg-card text-xs">
        <SelectValue placeholder={t("selectModel")} />
      </SelectTrigger>
      <SelectContent>
        {settings.models.map((m) => (
          <SelectItem key={m.id} value={m.id} className="text-xs">
            <span className="font-medium">{m.label}</span>
            <span className="ml-2 text-muted-foreground">{m.description}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
