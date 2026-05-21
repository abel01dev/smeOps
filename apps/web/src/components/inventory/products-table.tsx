"use client";

import { formatMoney, type Product } from "@sme/shared";
import { Package, Pencil } from "lucide-react";
import { useTranslations } from "next-intl";

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
  const t = useTranslations("inventory");
  const tc = useTranslations("common");

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
      <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-card py-14 text-center">
        <Package className="h-10 w-10 text-muted-foreground/60" />
        <p className="mt-1 text-sm font-medium text-foreground">
          {t("noMatch")}
        </p>
        <p className="max-w-sm text-xs text-muted-foreground">{t("noMatchHint")}</p>
        <Button type="button" className="mt-3 h-11" onClick={onCreate}>
          {t("addProduct")}
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
      <div className="hidden overflow-x-auto rounded-xl border border-border bg-card md:block">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-muted/50 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">{tc("product")}</th>
              <th className="px-4 py-3">{tc("category")}</th>
              <th className="px-4 py-3 text-right">{t("buy")}</th>
              <th className="px-4 py-3 text-right">{t("sell")}</th>
              <th className="px-4 py-3 text-right">{t("stock")}</th>
              <th className="px-4 py-3">{tc("status")}</th>
              <th className="px-4 py-3 text-right">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-muted/50">
                <td className="px-4 py-3 align-top">
                  <div className="font-medium text-foreground">{p.name}</div>
                  {p.description && (
                    <p className="line-clamp-1 text-xs text-muted-foreground">
                      {p.description}
                    </p>
                  )}
                </td>
                <td className="px-4 py-3 align-top text-muted-foreground">
                  {p.category?.name ?? (
                    <span className="text-muted-foreground/80">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right align-top tabular-nums text-foreground">
                  {formatMoney(p.buyPrice)}
                </td>
                <td className="px-4 py-3 text-right align-top tabular-nums text-foreground">
                  {formatMoney(p.sellPrice)}
                </td>
                <td className="px-4 py-3 text-right align-top tabular-nums">
                  <div
                    className={cn(
                      "font-medium",
                      p.isLowStock ? "text-amber-700" : "text-foreground",
                    )}
                  >
                    {p.stockQuantity}
                  </div>
                  <div className="text-xs text-muted-foreground/80">min {p.minStock}</div>
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
                    {tc("edit")}
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
              "rounded-xl border bg-card p-4 shadow-sm",
              p.isLowStock
                ? "border-amber-200 bg-amber-50/30"
                : "border-border",
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate font-medium text-foreground">{p.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {p.category?.name ?? tc("noCategory")}
                </p>
              </div>
              <StatusCell product={p} />
            </div>

            <dl className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
              <Stat label={t("buy")} value={formatMoney(p.buyPrice)} />
              <Stat label={t("sell")} value={formatMoney(p.sellPrice)} emphasis />
              <Stat
                label={t("stock")}
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
              {t("editProduct")}
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function StatusCell({ product }: { product: Product }) {
  const t = useTranslations("inventory");
  const tc = useTranslations("common");
  if (product.status === "ARCHIVED") {
    return <Badge variant="outline">{t("statusArchived")}</Badge>;
  }
  if (product.isLowStock) {
    return <Badge variant="warning">{tc("lowStock")}</Badge>;
  }
  return <Badge variant="success">{t("statusActive")}</Badge>;
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
        "rounded-md bg-muted/50 py-2",
        tone === "warn" && "bg-amber-100/60",
      )}
    >
      <dt className="text-muted-foreground">{label}</dt>
      <dd
        className={cn(
          "mt-0.5 font-medium tabular-nums text-foreground",
          emphasis && "text-foreground",
          tone === "warn" && "text-amber-800",
        )}
      >
        {value}
      </dd>
    </div>
  );
}
