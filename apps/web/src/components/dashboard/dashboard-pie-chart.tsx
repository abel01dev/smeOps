"use client";

import { formatMoney } from "@sme/shared";
import { useTranslations } from "next-intl";
import * as React from "react";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  type TooltipProps,
} from "recharts";

import { Skeleton } from "@/components/ui/skeleton";
import { chartHsl } from "@/lib/chart-colors";
import { useResolvedTheme } from "@/components/theme/theme-provider";

export interface PieSlice {
  name: string;
  value: number;
  /** Optional display value for tooltip (e.g. formatted money). */
  displayValue?: string;
}

interface Props {
  data: PieSlice[] | undefined;
  isLoading?: boolean;
  emptyLabel: string;
  valueFormatter?: (value: number) => string;
  colors?: string[];
}

const DEFAULT_COLORS = [
  "chart-revenue",
  "chart-profit",
  "chart-axis",
  "chart-cursor",
] as const;

export function DashboardPieChart({
  data,
  isLoading,
  emptyLabel,
  valueFormatter = (v) => String(v),
  colors,
}: Props) {
  const resolvedTheme = useResolvedTheme();
  const palette = React.useMemo(() => {
    const keys = colors ?? DEFAULT_COLORS;
    return keys.map((k) => chartHsl(k));
  }, [colors, resolvedTheme]);

  if (isLoading || !data) {
    return <Skeleton className="mx-auto h-56 w-full max-w-xs" />;
  }

  const slices = data.filter((d) => d.value > 0);
  if (slices.length === 0) {
    return (
      <div className="grid h-56 place-items-center text-sm text-muted-foreground">
        {emptyLabel}
      </div>
    );
  }

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={slices}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={52}
            outerRadius={80}
            paddingAngle={2}
            strokeWidth={0}
          >
            {slices.map((_, i) => (
              <Cell key={slices[i]!.name} fill={palette[i % palette.length]} />
            ))}
          </Pie>
          <Tooltip
            content={(props) => (
              <PieTooltip
                active={props.active}
                payload={props.payload as TooltipProps<number, string>["payload"]}
                formatter={valueFormatter}
              />
            )}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) => (
              <span className="text-xs text-muted-foreground">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

function PieTooltip({
  active,
  payload,
  formatter,
}: TooltipProps<number, string> & {
  formatter: (value: number) => string;
}) {
  const tc = useTranslations("charts");
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  const name = String(entry?.name ?? "");
  const raw = Number(entry?.value ?? 0);
  const display =
    (entry?.payload as PieSlice | undefined)?.displayValue ?? formatter(raw);

  return (
    <div className="rounded-md border border-border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-md">
      <p className="font-medium">{name}</p>
      <p className="mt-0.5 text-muted-foreground">{display}</p>
      <p className="mt-0.5 text-muted-foreground">
        {tc("share", { percent: sharePercent(payload) })}
      </p>
    </div>
  );
}

function sharePercent(payload: TooltipProps<number, string>["payload"]): string {
  const entry = payload?.[0];
  if (!entry?.payload || !payload) return "0";
  const total = payload.reduce((s, p) => s + Number(p.value ?? 0), 0);
  if (total <= 0) return "0";
  return ((Number(entry.value ?? 0) / total) * 100).toFixed(1);
}
