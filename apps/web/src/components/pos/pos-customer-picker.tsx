"use client";

import { formatMoney } from "@sme/shared";
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
  const [debouncedSearch, setDebouncedSearch] = React.useState("");

  React.useEffect(() => {
    const id = window.setTimeout(() => setDebouncedSearch(search.trim()), 200);
    return () => window.clearTimeout(id);
  }, [search]);

  React.useEffect(() => {
    if (!open) setSearch("");
  }, [open]);

  const q = usePosCustomers(open, debouncedSearch);
  const customers = q.data?.items ?? [];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col overflow-hidden sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{t("selectCustomer")}</SheetTitle>
          <SheetDescription>{t("customerListHint")}</SheetDescription>
        </SheetHeader>
        <div className="flex min-h-0 flex-1 flex-col gap-3 px-1 pb-2">
          <div className="relative shrink-0">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/80" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("searchCustomer")}
              className="h-11 pl-9"
              autoFocus
            />
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto rounded-lg border border-border">
            {q.isLoading && (
              <div className="space-y-2 p-3">
                <Skeleton className="h-11 w-full" />
                <Skeleton className="h-11 w-full" />
                <Skeleton className="h-11 w-full" />
              </div>
            )}
            {!q.isLoading && customers.length === 0 && (
              <p className="py-12 px-3 text-center text-sm text-muted-foreground">
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
                      className="h-auto w-full justify-start gap-3 px-3 py-3 text-left"
                      onClick={() => onSelect(c.id, c.name)}
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
                        {c.name.charAt(0).toUpperCase()}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-medium text-foreground">
                          {c.name}
                        </span>
                        {c.phone && (
                          <span className="block text-sm text-muted-foreground">
                            {c.phone}
                          </span>
                        )}
                        {Number(c.outstandingBalance) > 0 && (
                          <span className="mt-0.5 block text-xs text-amber-800 dark:text-amber-200">
                            {t("balanceDue")}:{" "}
                            {formatMoney(c.outstandingBalance)}
                          </span>
                        )}
                      </span>
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
