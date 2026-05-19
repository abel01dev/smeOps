"use client";

import type { TopProduct } from "@sme/shared";
import { formatMoney } from "@sme/shared";
import { useTranslations } from "next-intl";

import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  data: TopProduct[] | undefined;
  isLoading?: boolean;
}

export function TopProductsList({ data, isLoading }: Props) {
  const t = useTranslations("dashboard");

  if (isLoading || !data) {
    return (
      <ul className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <li key={i} className="flex items-center justify-between gap-3">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-20" />
          </li>
        ))}
      </ul>
    );
  }

  if (data.length === 0) {
    return <p className="text-sm text-slate-500">{t("noSalesRecorded")}</p>;
  }

  const max = Math.max(...data.map((p) => Number(p.revenue)));

  return (
    <ul className="space-y-3">
      {data.map((p) => {
        const value = Number(p.revenue);
        const pct = max > 0 ? Math.max(4, (value / max) * 100) : 0;
        return (
          <li key={p.productId} className="space-y-1.5">
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="truncate font-medium text-slate-900">
                {p.productName}
              </span>
              <span className="shrink-0 tabular-nums text-slate-700">
                {formatMoney(p.revenue)}
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-slate-900"
                style={{ width: `${pct}%` }}
                aria-hidden
              />
            </div>
            <p className="text-xs text-slate-500">
              {t("soldProfit", {
                qty: p.quantitySold,
                profit: formatMoney(p.profit),
              })}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
