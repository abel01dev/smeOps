"use client";

import type { InventoryStatusBreakdown } from "@sme/shared";
import { useTranslations } from "next-intl";

import { DashboardPieChart, type PieSlice } from "./dashboard-pie-chart";

const STATUS_COLORS = [
  "chart-profit",
  "chart-stock-low",
  "chart-stock-out",
] as const;

export function InventoryStatusChart({
  data,
  isLoading,
}: {
  data: InventoryStatusBreakdown | undefined;
  isLoading?: boolean;
}) {
  const t = useTranslations("dashboard");

  const slices: PieSlice[] = data
    ? [
        { name: t("stockInStock"), value: data.inStock },
        { name: t("stockLow"), value: data.lowStock },
        { name: t("stockOut"), value: data.outOfStock },
      ]
    : [];

  return (
    <DashboardPieChart
      data={slices}
      isLoading={isLoading}
      emptyLabel={t("noActiveProducts")}
      valueFormatter={(v) => String(v)}
      colors={[...STATUS_COLORS]}
    />
  );
}
