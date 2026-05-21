"use client";

import { Languages } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { type AppLocale, useLocaleStore } from "@/stores/locale.store";
import { cn } from "@/lib/utils";

const OPTIONS: { value: AppLocale; label: string }[] = [
  { value: "en", label: "English" },
  { value: "am", label: "አማርኛ" },
];

export function LanguageSwitcher({ className }: { className?: string }) {
  const t = useTranslations("common");
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={cn("gap-1.5", className)}
          aria-label={t("language")}
        >
          <Languages className="h-4 w-4" />
          <span className="hidden sm:inline">
            {OPTIONS.find((o) => o.value === locale)?.label}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {OPTIONS.map((opt) => (
          <DropdownMenuItem
            key={opt.value}
            onClick={() => setLocale(opt.value)}
            className={locale === opt.value ? "font-semibold" : undefined}
          >
            {opt.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
