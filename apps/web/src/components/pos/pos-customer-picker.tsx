"use client";

import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { usePosCustomers } from "@/hooks/use-pos";

export interface PosCustomerPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (id: string, name: string) => void;
}

export function PosCustomerPicker({
  open,
  onOpenChange,
  onSelect,
}: PosCustomerPickerProps) {
  const t = useTranslations("pos");
  const [search, setSearch] = React.useState("");
  const q = usePosCustomers(search);

  React.useEffect(() => {
    if (!open) setSearch("");
  }, [open]);

  const customers = q.data?.items ?? [];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{t("attachCustomer")}</SheetTitle>
          <SheetDescription>{t("customerSheetHint")}</SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 px-1 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/80" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("searchCustomer")}
              className="h-11 pl-9"
              autoFocus
            />
          </div>
          <div className="max-h-[min(55vh,24rem)] overflow-y-auto rounded-lg border border-border">
            {search.trim().length === 0 && (
              <p className="py-8 px-3 text-center text-sm text-muted-foreground">
                {t("typeToSearchCustomers")}
              </p>
            )}
            {search.trim().length > 0 && q.isLoading && (
              <div className="space-y-2 p-3">
                <Skeleton className="h-11 w-full" />
                <Skeleton className="h-11 w-full" />
              </div>
            )}
            {search.trim().length > 0 && !q.isLoading && customers.length === 0 && (
              <p className="py-8 px-3 text-center text-sm text-muted-foreground">
                {t("noCustomers")}
              </p>
            )}
            {customers.length > 0 && (
              <ul className="divide-y divide-border">
                {customers.map((c) => (
                  <li key={c.id}>
                    <Button
                      type="button"
                      variant="ghost"
                      className="h-auto w-full justify-start px-3 py-3 text-left"
                      onClick={() => onSelect(c.id, c.name)}
                    >
                      <span className="font-medium text-foreground">{c.name}</span>
                      {c.phone && (
                        <span className="ml-2 text-sm text-muted-foreground">
                          {c.phone}
                        </span>
                      )}
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
