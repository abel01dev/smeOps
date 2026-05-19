"use client";

import type { Product } from "@sme/shared";
import { formatMoney } from "@sme/shared";
import { Package } from "lucide-react";

import { cn } from "@/lib/utils";

export interface PosProductTileProps {
  product: Product;
  onAdd: (product: Product) => void;
}

export function PosProductTile({ product, onAdd }: PosProductTileProps) {
  const outOfStock = product.stockQuantity <= 0;
  const lowStock = product.isLowStock && !outOfStock;

  return (
    <button
      type="button"
      disabled={outOfStock}
      onClick={() => onAdd(product)}
      className={cn(
        "group flex flex-col overflow-hidden rounded-xl border bg-white text-left shadow-sm transition",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400",
        outOfStock
          ? "cursor-not-allowed border-slate-100 opacity-50"
          : "border-slate-200 hover:border-slate-300 hover:shadow-md active:scale-[0.98]",
        lowStock && !outOfStock && "border-amber-200",
      )}
    >
      <div className="flex aspect-square w-full items-center justify-center bg-slate-50 text-slate-400 group-hover:bg-slate-100">
        <ProductAvatar name={product.name} />
      </div>
      <div className="flex flex-1 flex-col gap-0.5 p-2.5 sm:p-3">
        <span className="line-clamp-2 text-sm font-medium leading-snug text-slate-900">
          {product.name}
        </span>
        <span className="text-sm font-semibold tabular-nums text-slate-800">
          {formatMoney(product.sellPrice)}
        </span>
        {outOfStock ? (
          <span className="text-xs font-medium text-slate-400">Out of stock</span>
        ) : lowStock ? (
          <span className="text-xs font-medium text-amber-700">
            {product.stockQuantity} left
          </span>
        ) : (
          <span className="text-xs text-slate-400">
            Stock {product.stockQuantity}
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
    <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-white text-lg font-semibold text-slate-600 shadow-sm ring-1 ring-slate-200 sm:h-16 sm:w-16">
      {initials || <Package className="h-6 w-6" />}
    </div>
  );
}
