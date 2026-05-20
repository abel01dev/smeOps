"use client";

import type { PaginatedResult, Product } from "@sme/shared";
import { formatCount } from "@sme/shared";
import Link from "next/link";
import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  data: PaginatedResult<Product> | undefined;
  isLoading?: boolean;
}

export function LowStockList({ data, isLoading }: Props) {
  const t = useTranslations("dashboard");

  if (isLoading || !data) {
    return (
      <ul className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <li key={i} className="flex items-center justify-between gap-3">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-16" />
          </li>
        ))}
      </ul>
    );
  }

  if (data.items.length === 0) {
    return <p className="text-sm text-muted-foreground">{t("allStocked")}</p>;
  }

  return (
    <ul className="space-y-3">
      {data.items.map((p) => (
        <li key={p.id} className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <Link
              href="/inventory"
              className="block truncate text-sm font-medium text-foreground hover:underline"
            >
              {p.name}
            </Link>
            <p className="text-xs text-muted-foreground">
              {p.category?.name ?? t("uncategorized")} ·{" "}
              {t("minLabel", { min: formatCount(p.minStock) })}
            </p>
          </div>
          <Badge variant="warning" className="shrink-0">
            {t("stockLeftBadge", { count: formatCount(p.stockQuantity) })}
          </Badge>
        </li>
      ))}
      {data.total > data.items.length ? (
        <li className="pt-1 text-xs text-muted-foreground">
          {t("moreLowStock", { count: data.total - data.items.length })}
        </li>
      ) : null}
    </ul>
  );
}
