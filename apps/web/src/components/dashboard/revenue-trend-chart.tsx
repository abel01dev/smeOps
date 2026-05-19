"use client";

import type { RevenueTrendBucket } from "@sme/shared";
import { formatMoney } from "@sme/shared";
import { useTranslations } from "next-intl";
import * as React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  type TooltipProps,
  XAxis,
  YAxis,
} from "recharts";

import { Skeleton } from "@/components/ui/skeleton";
import { intlLocale } from "@/lib/i18n-locale";
import { useLocaleStore } from "@/stores/locale.store";

interface Props {
  data: RevenueTrendBucket[] | undefined;
  isLoading?: boolean;
}

export function RevenueTrendChart({ data, isLoading }: Props) {
  const t = useTranslations("dashboard");
  const tc = useTranslations("charts");
  const locale = useLocaleStore((s) => s.locale);

  const dateFmt = React.useCallback(
    (value: string) => shortDate(value, locale),
    [locale],
  );

  if (isLoading || !data) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (data.length === 0) {
    return (
      <div className="grid h-64 place-items-center text-sm text-slate-500">
        {t("noSalesPeriod")}
      </div>
    );
  }

  const chartData = data.map((d) => ({
    date: d.date,
    revenue: Number(d.revenue),
    profit: Number(d.profit),
    salesCount: d.salesCount,
  }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
        >
          <defs>
            <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0f172a" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#0f172a" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.22} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={dateFmt}
            tick={{ fill: "#64748b", fontSize: 12 }}
            axisLine={{ stroke: "#e2e8f0" }}
            tickLine={false}
            minTickGap={24}
          />
          <YAxis
            tickFormatter={shortMoney}
            tick={{ fill: "#64748b", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            width={60}
          />
          <Tooltip
            content={(props) => (
              <ChartTooltip
                active={props.active}
                payload={props.payload as TooltipProps<number, string>["payload"]}
                label={props.label}
                locale={locale}
              />
            )}
            cursor={{ stroke: "#cbd5e1" }}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            name={tc("revenue")}
            stroke="#0f172a"
            strokeWidth={2}
            fill="url(#revGrad)"
          />
          <Area
            type="monotone"
            dataKey="profit"
            name={tc("profit")}
            stroke="#10b981"
            strokeWidth={2}
            fill="url(#profitGrad)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function shortDate(value: string, locale: "en" | "am"): string {
  const d = new Date(`${value}T00:00:00`);
  return d.toLocaleDateString(intlLocale(locale), {
    month: "short",
    day: "numeric",
  });
}

function shortMoney(value: number): string {
  if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (Math.abs(value) >= 1_000) return `${(value / 1_000).toFixed(1)}k`;
  return value.toFixed(0);
}

function ChartTooltip({
  active,
  payload,
  label,
  locale,
}: TooltipProps<number, string> & { locale: "en" | "am" }) {
  const tc = useTranslations("charts");
  if (!active || !payload?.length) return null;

  const get = (key: string) => payload.find((p) => p.dataKey === key)?.value ?? 0;
  const revenue = Number(get("revenue"));
  const profit = Number(get("profit"));
  const sales = Number(get("salesCount"));

  return (
    <div className="rounded-md border border-slate-200 bg-white p-3 text-xs shadow-md">
      <p className="mb-2 font-medium text-slate-900">
        {label ? shortDate(String(label), locale) : ""}
      </p>
      <Row color="#0f172a" label={tc("revenue")} value={formatMoney(revenue)} />
      <Row color="#10b981" label={tc("profit")} value={formatMoney(profit)} />
      <p className="mt-1 text-slate-500">
        {tc("salesCount", { count: sales })}
      </p>
    </div>
  );
}

function Row({
  color,
  label,
  value,
}: {
  color: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="inline-block h-2 w-2 rounded-full"
        style={{ backgroundColor: color }}
        aria-hidden
      />
      <span className="text-slate-600">{label}:</span>
      <span className="font-medium text-slate-900">{value}</span>
    </div>
  );
}
