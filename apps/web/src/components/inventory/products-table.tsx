"use client";

import { formatMoney, type Product } from "@sme/shared";
import { Package, Pencil } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export interface ProductsTableProps {
  products: Product[];
  isLoading: boolean;
  isFetching: boolean;
  onEdit: (product: Product) => void;
  onCreate: () => void;
}

export function ProductsTable({
  products,
  isLoading,
  isFetching,
  onEdit,
  onCreate,
}: ProductsTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-200 bg-white py-14 text-center">
        <Package className="h-10 w-10 text-slate-300" />
        <p className="mt-1 text-sm font-medium text-slate-800">
          No products match these filters
        </p>
        <p className="max-w-sm text-xs text-slate-500">
          Adjust the filters above or add your first product to start tracking
          inventory.
        </p>
        <Button type="button" className="mt-3 h-11" onClick={onCreate}>
          Add product
        </Button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "transition-opacity",
        isFetching && "opacity-70",
      )}
    >
      {/* Desktop / tablet table */}
      <div className="hidden overflow-x-auto rounded-xl border border-slate-100 bg-white md:block">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-slate-50 text-xs font-medium uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3 text-right">Buy</th>
              <th className="px-4 py-3 text-right">Sell</th>
              <th className="px-4 py-3 text-right">Stock</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50/70">
                <td className="px-4 py-3 align-top">
                  <div className="font-medium text-slate-900">{p.name}</div>
                  {p.description && (
                    <p className="line-clamp-1 text-xs text-slate-500">
                      {p.description}
                    </p>
                  )}
                </td>
                <td className="px-4 py-3 align-top text-slate-600">
                  {p.category?.name ?? (
                    <span className="text-slate-400">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right align-top tabular-nums text-slate-700">
                  {formatMoney(p.buyPrice)}
                </td>
                <td className="px-4 py-3 text-right align-top tabular-nums text-slate-900">
                  {formatMoney(p.sellPrice)}
                </td>
                <td className="px-4 py-3 text-right align-top tabular-nums">
                  <div
                    className={cn(
                      "font-medium",
                      p.isLowStock ? "text-amber-700" : "text-slate-800",
                    )}
                  >
                    {p.stockQuantity}
                  </div>
                  <div className="text-xs text-slate-400">min {p.minStock}</div>
                </td>
                <td className="px-4 py-3 align-top">
                  <StatusCell product={p} />
                </td>
                <td className="px-4 py-3 text-right align-top">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-9"
                    onClick={() => onEdit(p)}
                  >
                    <Pencil className="mr-1.5 h-3.5 w-3.5" />
                    Edit
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <ul className="space-y-3 md:hidden">
        {products.map((p) => (
          <li
            key={p.id}
            className={cn(
              "rounded-xl border bg-white p-4 shadow-sm",
              p.isLowStock
                ? "border-amber-200 bg-amber-50/30"
                : "border-slate-100",
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate font-medium text-slate-900">{p.name}</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {p.category?.name ?? "No category"}
                </p>
              </div>
              <StatusCell product={p} />
            </div>

            <dl className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
              <Stat label="Buy" value={formatMoney(p.buyPrice)} />
              <Stat label="Sell" value={formatMoney(p.sellPrice)} emphasis />
              <Stat
                label="Stock"
                value={String(p.stockQuantity)}
                tone={p.isLowStock ? "warn" : undefined}
              />
            </dl>

            <Button
              type="button"
              variant="outline"
              className="mt-3 h-11 w-full"
              onClick={() => onEdit(p)}
            >
              Edit product
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function StatusCell({ product }: { product: Product }) {
  if (product.status === "ARCHIVED") {
    return <Badge variant="outline">Archived</Badge>;
  }
  if (product.isLowStock) {
    return <Badge variant="warning">Low stock</Badge>;
  }
  return <Badge variant="success">Active</Badge>;
}

function Stat({
  label,
  value,
  emphasis,
  tone,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
  tone?: "warn";
}) {
  return (
    <div
      className={cn(
        "rounded-md bg-slate-50 py-2",
        tone === "warn" && "bg-amber-100/60",
      )}
    >
      <dt className="text-slate-500">{label}</dt>
      <dd
        className={cn(
          "mt-0.5 font-medium tabular-nums text-slate-800",
          emphasis && "text-slate-900",
          tone === "warn" && "text-amber-800",
        )}
      >
        {value}
      </dd>
    </div>
  );
}
