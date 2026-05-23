"use client";

import type { SalesByCategorySlice } from "@sme/shared";
import { formatMoney } from "@sme/shared";
import { useTranslations } from "next-intl";

import { CATEGORY_PIE_COLORS } from "@/lib/chart-colors";

import { DashboardPieChart, type PieSlice } from "./dashboard-pie-chart";

export function SalesByCategoryChart({
  data,
  isLoading,
}: {
  data: SalesByCategorySlice[] | undefined;
  isLoading?: boolean;
}) {
  const t = useTranslations("dashboard");

  const slices: PieSlice[] =
    data?.map((c) => ({
      name:
        c.categoryName === "Uncategorized"
          ? t("uncategorized")
          : c.categoryName,
      value: Number(c.revenue),
      displayValue: formatMoney(c.revenue),
    })) ?? [];

  return (
    <DashboardPieChart
      data={slices}
      isLoading={isLoading}
      emptyLabel={t("noCategorySales")}
      valueFormatter={(v) => formatMoney(v)}
      colors={[...CATEGORY_PIE_COLORS]}
    />
  );
}
