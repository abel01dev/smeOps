"use client";

import type { Category, Product } from "@sme/shared";
import { Search } from "lucide-react";
import * as React from "react";

import { PosProductTile } from "@/components/pos/pos-product-tile";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { usePosProducts } from "@/hooks/use-pos";
import { cn } from "@/lib/utils";

export interface PosProductGridProps {
  categories: Category[];
  onAddProduct: (product: Product) => void;
}

export function PosProductGrid({ categories, onAddProduct }: PosProductGridProps) {
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [categoryId, setCategoryId] = React.useState<string | undefined>();

  React.useEffect(() => {
    const t = window.setTimeout(() => setDebouncedSearch(search.trim()), 250);
    return () => window.clearTimeout(t);
  }, [search]);

  const q = usePosProducts(debouncedSearch, categoryId);
  const products = q.data?.items ?? [];

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-white">
      <div className="shrink-0 border-b border-slate-200 px-3 pt-2 sm:px-4">
        <div className="flex gap-1 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <TabChip
            active={!categoryId}
            onClick={() => setCategoryId(undefined)}
          >
            All products
          </TabChip>
          {categories.map((c) => (
            <TabChip
              key={c.id}
              active={categoryId === c.id}
              onClick={() => setCategoryId(c.id)}
            >
              {c.name}
            </TabChip>
          ))}
        </div>
      </div>

      <div className="shrink-0 border-b border-slate-100 px-3 py-3 sm:px-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products…"
            className="h-11 pl-9"
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4">
        {q.isLoading && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[4/5] rounded-xl" />
            ))}
          </div>
        )}

        {q.isError && (
          <p className="text-center text-sm text-red-600">
            {(q.error as Error).message}
          </p>
        )}

        {!q.isLoading && !q.isError && products.length === 0 && (
          <p className="py-12 text-center text-sm text-slate-500">
            No products found. Add items in Inventory first.
          </p>
        )}

        {!q.isLoading && !q.isError && products.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
            {products.map((p) => (
              <PosProductTile key={p.id} product={p} onAdd={onAddProduct} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TabChip({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-lg px-4 py-2.5 text-sm font-medium transition",
        active
          ? "bg-slate-900 text-white shadow-sm"
          : "text-slate-600 hover:bg-slate-100",
      )}
    >
      {children}
    </button>
  );
}
