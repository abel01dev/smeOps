"use client";

import type { RevenueTrendBucket } from "@sme/shared";
import { formatMoney } from "@sme/shared";
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

interface Props {
  data: RevenueTrendBucket[] | undefined;
  isLoading?: boolean;
}

export function RevenueTrendChart({ data, isLoading }: Props) {
  if (isLoading || !data) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (data.length === 0) {
    return (
      <div className="grid h-64 place-items-center text-sm text-slate-500">
        No sales yet in this period.
      </div>
    );
  }

  // Recharts can't compute domains from string values reliably — convert here.
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
            tickFormatter={shortDate}
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
          <Tooltip content={<ChartTooltip />} cursor={{ stroke: "#cbd5e1" }} />
          <Area
            type="monotone"
            dataKey="revenue"
            name="Revenue"
            stroke="#0f172a"
            strokeWidth={2}
            fill="url(#revGrad)"
          />
          <Area
            type="monotone"
            dataKey="profit"
            name="Profit"
            stroke="#10b981"
            strokeWidth={2}
            fill="url(#profitGrad)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function shortDate(value: string): string {
  const d = new Date(`${value}T00:00:00`);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function shortMoney(value: number): string {
  if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (Math.abs(value) >= 1_000) return `${(value / 1_000).toFixed(1)}k`;
  return value.toFixed(0);
}

function ChartTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;

  const get = (key: string) => payload.find((p) => p.dataKey === key)?.value ?? 0;
  const revenue = Number(get("revenue"));
  const profit = Number(get("profit"));
  const sales = Number(get("salesCount"));

  return (
    <div className="rounded-md border border-slate-200 bg-white p-3 text-xs shadow-md">
      <p className="mb-2 font-medium text-slate-900">
        {label ? shortDate(String(label)) : ""}
      </p>
      <Row color="#0f172a" label="Revenue" value={formatMoney(revenue)} />
      <Row color="#10b981" label="Profit" value={formatMoney(profit)} />
      <p className="mt-1 text-slate-500">
        {sales} sale{sales === 1 ? "" : "s"}
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
