"use client";

import type { BusinessInsight, InsightSeverity } from "@sme/shared";
import { formatMoney } from "@sme/shared";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Minus,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAiInsights } from "@/hooks/use-ai-insights";
import { cn } from "@/lib/utils";

const SEVERITY_STYLES: Record<
  InsightSeverity,
  { badge: "secondary" | "success" | "warning" | "destructive"; border: string }
> = {
  info: { badge: "secondary", border: "border-border bg-card" },
  success: { badge: "success", border: "border-emerald-200 bg-emerald-50/40" },
  warning: { badge: "warning", border: "border-amber-200 bg-amber-50/40" },
  critical: { badge: "destructive", border: "border-red-200 bg-red-50/40" },
};

export function AiInsightsPanel({ days }: { days: number }) {
  const t = useTranslations("dashboard");
  const q = useAiInsights(days);

  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="h-5 w-5 text-muted-foreground" />
          {t("insightsTitle")}
        </CardTitle>
        <CardDescription>{t("insightsDesc")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {q.isLoading && (
          <div className="space-y-3">
            <Skeleton className="h-20 w-full rounded-lg" />
            <Skeleton className="h-20 w-full rounded-lg" />
            <Skeleton className="h-20 w-full rounded-lg" />
          </div>
        )}

        {q.isError && (
          <p className="text-sm text-red-600">{(q.error as Error).message}</p>
        )}

        {q.data && (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              <ForecastCard
                label={t("forecastRevenue")}
                value={formatMoney(q.data.forecast.next7DaysRevenue)}
                trend={q.data.forecast.trend}
                sub={t("avgPerDay", {
                  amount: formatMoney(q.data.forecast.avgDailyRevenue),
                })}
              />
              <ForecastCard
                label={t("forecastSales")}
                value={String(q.data.prediction.next7DaysSalesCount)}
                trend={
                  q.data.forecast.trend === "up"
                    ? "up"
                    : q.data.forecast.trend === "down"
                      ? "down"
                      : "flat"
                }
                sub={t("confidence", {
                  level: t(
                    q.data.prediction.confidence === "low"
                      ? "confidenceLow"
                      : q.data.prediction.confidence === "medium"
                        ? "confidenceMedium"
                        : "confidenceHigh",
                  ),
                  days: q.data.prediction.basedOnDays,
                })}
                isCount
              />
            </div>

            <ul className="space-y-2">
              {q.data.insights.map((insight) => (
                <InsightCard key={insight.id} insight={insight} />
              ))}
            </ul>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function ForecastCard({
  label,
  value,
  trend,
  sub,
  isCount,
}: {
  label: string;
  value: string;
  trend: "up" | "down" | "flat";
  sub: string;
  isCount?: boolean;
}) {
  const TrendIcon =
    trend === "up" ? ArrowUpRight : trend === "down" ? ArrowDownRight : Minus;
  const trendColor =
    trend === "up"
      ? "text-emerald-600"
      : trend === "down"
        ? "text-amber-700"
        : "text-muted-foreground";

  return (
    <div className="rounded-xl border border-border bg-muted/50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <div className="mt-1 flex items-center gap-2">
        <p
          className={cn(
            "font-semibold text-foreground",
            isCount ? "text-2xl tabular-nums" : "text-lg tabular-nums",
          )}
        >
          {value}
        </p>
        <TrendIcon className={cn("h-5 w-5", trendColor)} />
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}

function InsightCard({ insight }: { insight: BusinessInsight }) {
  const t = useTranslations("dashboard");
  const style = SEVERITY_STYLES[insight.severity];
  const categoryLabels: Record<string, string> = {
    revenue: t("categories.revenue"),
    inventory: t("categories.inventory"),
    sales: t("categories.sales"),
    customers: t("categories.customers"),
    forecast: t("categories.forecast"),
  };
  const categoryLabel = categoryLabels[insight.category] ?? insight.category;

  return (
    <li
      className={cn(
        "flex flex-col gap-2 rounded-xl border p-4 sm:flex-row sm:items-start sm:justify-between",
        style.border,
      )}
    >
      <div className="min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={style.badge} className="font-normal capitalize">
            {categoryLabel}
          </Badge>
          <h4 className="font-medium text-foreground">{insight.title}</h4>
        </div>
        <p className="text-sm text-muted-foreground">{insight.message}</p>
      </div>
      {insight.actionHref && insight.actionLabel && (
        <Button variant="outline" size="sm" className="h-9 shrink-0" asChild>
          <Link href={insight.actionHref}>
            {insight.actionLabel}
            <ArrowRight className="ml-1 h-3.5 w-3.5" />
          </Link>
        </Button>
      )}
    </li>
  );
}

