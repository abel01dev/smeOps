"use client";

import type { Category, ProductStatus } from "@sme/shared";
import { Search, X } from "lucide-react";

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
    <div className="space-y-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3 sm:p-4">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1.5fr_1fr_1fr]">
        <div className="grid gap-1.5">
          <Label htmlFor="inv-search" className="sr-only">
            Search products
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              id="inv-search"
              placeholder="Search by name…"
              value={value.search}
              onChange={(e) => update("search", e.target.value)}
              className="h-11 pl-9"
            />
          </div>
        </div>

        <div className="grid gap-1.5">
          <Label className="text-xs font-medium text-slate-600">
            Category
          </Label>
          <Select
            value={value.categoryId ?? ALL}
            onValueChange={(v) => update("categoryId", v === ALL ? undefined : v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-1.5">
          <Label className="text-xs font-medium text-slate-600">Status</Label>
          <Select
            value={value.status}
            onValueChange={(v) => update("status", v as ProductStatus | "ALL")}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="ARCHIVED">Archived</SelectItem>
              <SelectItem value="ALL">All</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <label
          className={cn(
            "inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition",
            value.lowStockOnly
              ? "border-amber-300 bg-amber-50 text-amber-900"
              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
          )}
        >
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400"
            checked={value.lowStockOnly}
            onChange={(e) => update("lowStockOnly", e.target.checked)}
          />
          <span className="font-medium">Low stock only</span>
        </label>

        {hasActiveFilter && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-9 gap-1 text-slate-600"
            onClick={clearAll}
          >
            <X className="h-3.5 w-3.5" />
            Clear filters
          </Button>
        )}
      </div>
    </div>
  );
}
