"use client";

import { useTranslations } from "next-intl";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export interface PosDiscountSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: number;
  onApply: (discount: number) => void;
}

export function PosDiscountSheet({
  open,
  onOpenChange,
  value,
  onApply,
}: PosDiscountSheetProps) {
  const t = useTranslations("pos");
  const tc = useTranslations("common");
  const [draft, setDraft] = React.useState(String(value || ""));

  React.useEffect(() => {
    if (open) setDraft(value ? String(value) : "");
  }, [open, value]);

  const apply = () => {
    const n = draft === "" ? 0 : Number(draft);
    onApply(Number.isFinite(n) && n >= 0 ? n : 0);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{t("discountEtb")}</SheetTitle>
          <SheetDescription>{t("discountSheetHint")}</SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 px-1 pb-2">
          <div className="grid gap-1.5">
            <Label htmlFor="discount-sheet-input">{t("discountAmountLabel")}</Label>
            <Input
              id="discount-sheet-input"
              type="number"
              min={0}
              step="0.01"
              inputMode="decimal"
              className="h-11"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  apply();
                }
              }}
            />
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              {tc("cancel")}
            </Button>
            <Button type="button" className="flex-1" onClick={apply}>
              {tc("save")}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
