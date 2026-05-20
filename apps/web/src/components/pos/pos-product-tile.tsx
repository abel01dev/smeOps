"use client";

import type { Product } from "@sme/shared";
import { formatMoney } from "@sme/shared";
import { Package } from "lucide-react";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";

export interface PosProductTileProps {
  product: Product;
  onAdd: (product: Product) => void;
}

export function PosProductTile({ product, onAdd }: PosProductTileProps) {
  const td = useTranslations("dashboard");
  const outOfStock = product.stockQuantity <= 0;
  const lowStock = product.isLowStock && !outOfStock;

  return (
    <button
      type="button"
      disabled={outOfStock}
      onClick={() => onAdd(product)}
      className={cn(
        "group flex flex-col overflow-hidden rounded-xl border bg-card text-left shadow-sm transition",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        outOfStock
          ? "cursor-not-allowed border-border opacity-50"
          : "border-border hover:border-muted-foreground/40 hover:shadow-md active:scale-[0.98]",
        lowStock && !outOfStock && "border-amber-500/50 dark:border-amber-400/40",
      )}
    >
      <div className="flex aspect-square w-full items-center justify-center bg-muted/50 text-muted-foreground/80 group-hover:bg-muted">
        <ProductAvatar name={product.name} />
      </div>
      <div className="flex flex-1 flex-col gap-0.5 p-2.5 sm:p-3">
        <span className="line-clamp-2 text-sm font-medium leading-snug text-foreground">
          {product.name}
        </span>
        <span className="text-sm font-semibold tabular-nums text-foreground">
          {formatMoney(product.sellPrice)}
        </span>
        {outOfStock ? (
          <span className="text-xs font-medium text-muted-foreground/80">
            {td("outOfStock")}
          </span>
        ) : lowStock ? (
          <span className="text-xs font-medium text-amber-700 dark:text-amber-400">
            {td("stockLeftShort", { count: product.stockQuantity })}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground/80">
            {td("stockCount", { count: product.stockQuantity })}
          </span>
        )}
      </div>
    </button>
  );
}

function ProductAvatar({ name }: { name: string }) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  return (
    <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-card text-lg font-semibold text-muted-foreground shadow-sm ring-1 ring-border sm:h-16 sm:w-16">
      {initials || <Package className="h-6 w-6" />}
    </div>
  );
}
