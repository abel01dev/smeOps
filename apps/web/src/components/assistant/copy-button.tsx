"use client";

import { Check, Copy } from "lucide-react";
import { useTranslations } from "next-intl";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CopyButton({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const t = useTranslations("assistant");
  const tc = useTranslations("common");
  const [copied, setCopied] = React.useState(false);

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn("h-7 w-7 text-slate-500", className)}
      aria-label={copied ? tc("copied") : t("copyMessage")}
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
      }}
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-emerald-600" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
    </Button>
  );
}
