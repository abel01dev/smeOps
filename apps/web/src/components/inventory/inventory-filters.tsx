"use client";

import type { Category, ProductStatus } from "@sme/shared";
import { Search, X } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const ALL = "__all__";

export interface InventoryFilterState {
  search: string;
  categoryId: string | undefined;
  status: ProductStatus | "ALL";
  lowStockOnly: boolean;
}

export interface InventoryFiltersProps {
  value: InventoryFilterState;
  onChange: (next: InventoryFilterState) => void;
  categories: Category[];
}

export function InventoryFilters({
  value,
  onChange,
  categories,
}: InventoryFiltersProps) {
  const t = useTranslations("inventory");
  const tc = useTranslations("common");

  const update = <K extends keyof InventoryFilterState>(
    key: K,
    next: InventoryFilterState[K],
  ) => onChange({ ...value, [key]: next });

  const hasActiveFilter =
    value.search.trim() !== "" ||
    value.categoryId !== undefined ||
    value.status !== "ACTIVE" ||
    value.lowStockOnly;

  const clearAll = () =>
    onChange({
      search: "",
      categoryId: undefined,
      status: "ACTIVE",
      lowStockOnly: false,
    });

  return (
    <div className="space-y-3 rounded-xl border border-border bg-muted/40 p-3 sm:p-4">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1.5fr_1fr_1fr]">
        <div className="grid gap-1.5">
          <Label htmlFor="inv-search" className="sr-only">
            {t("searchProductsLabel")}
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/80" />
            <Input
              id="inv-search"
              placeholder={t("searchPlaceholder")}
              value={value.search}
              onChange={(e) => update("search", e.target.value)}
              className="h-11 pl-9"
            />
          </div>
        </div>

        <div className="grid gap-1.5">
          <Label className="text-xs font-medium text-muted-foreground">
            {tc("category")}
          </Label>
          <Select
            value={value.categoryId ?? ALL}
            onValueChange={(v) => update("categoryId", v === ALL ? undefined : v)}
          >
            <SelectTrigger>
              <SelectValue placeholder={tc("allCategories")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>{tc("allCategories")}</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-1.5">
          <Label className="text-xs font-medium text-muted-foreground">{tc("status")}</Label>
          <Select
            value={value.status}
            onValueChange={(v) => update("status", v as ProductStatus | "ALL")}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ACTIVE">{t("statusActive")}</SelectItem>
              <SelectItem value="ARCHIVED">{t("statusArchived")}</SelectItem>
              <SelectItem value="ALL">{t("statusAll")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <label
          className={cn(
            "inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition",
            value.lowStockOnly
              ? "border-amber-500/50 bg-amber-500/10 text-amber-950 dark:border-amber-400/45 dark:bg-amber-500/15 dark:text-amber-100"
              : "border-border bg-card text-foreground hover:bg-muted/50",
          )}
        >
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-border text-foreground focus:ring-2 focus:ring-ring"
            checked={value.lowStockOnly}
            onChange={(e) => update("lowStockOnly", e.target.checked)}
          />
          <span className="font-medium">{tc("lowStockOnly")}</span>
        </label>

        {hasActiveFilter && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-9 gap-1 text-muted-foreground"
            onClick={clearAll}
          >
            <X className="h-3.5 w-3.5" />
            {tc("clearFilters")}
          </Button>
        )}
      </div>
    </div>
  );
}
