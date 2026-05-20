"use client";

import { formatMoney } from "@sme/shared";
import {
  AlertTriangle,
  Banknote,
  Package,
  ReceiptText,
  TrendingUp,
} from "lucide-react";
import { useTranslations } from "next-intl";
import * as React from "react";

import { AiInsightsPanel } from "@/components/dashboard/ai-insights-panel";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { LowStockList } from "@/components/dashboard/low-stock-list";
import { RevenueTrendChart } from "@/components/dashboard/revenue-trend-chart";
import { TopProductsList } from "@/components/dashboard/top-products-list";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  useDashboardSummary,
  useLowStockProducts,
  useRevenueTrend,
  useTopProducts,
} from "@/hooks/use-dashboard";
import { useAuthStore } from "@/stores/auth.store";

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const t = useTranslations("dashboard");
  const tc = useTranslations("common");
  const [days, setDays] = React.useState<number>(30);

  const summary = useDashboardSummary();
  const trend = useRevenueTrend(days);
  const top = useTopProducts(days, 5);
  const lowStock = useLowStockProducts(5);

  const periods = [
    { label: t("period7"), days: 7 },
    { label: t("period30"), days: 30 },
    { label: t("period90"), days: 90 },
  ] as const;

  const greeting = greetingFor(user?.name, t);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {greeting}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("subtitle", {
              org: user?.organizationName ?? "your business",
            })}
          </p>
        </div>
        <div className="inline-flex items-center gap-1 rounded-lg border border-border bg-card p-1">
          {periods.map((p) => (
            <Button
              key={p.days}
              variant={days === p.days ? "default" : "ghost"}
              size="sm"
              onClick={() => setDays(p.days)}
              className={cn(
                "h-8 px-3 text-xs font-medium",
                days === p.days ? "" : "text-muted-foreground hover:bg-muted",
              )}
            >
              {p.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label={t("revenueToday")}
          value={
            summary.data ? formatMoney(summary.data.today.revenue) : tc("noData")
          }
          hint={
            summary.data
              ? t("salesSoFar", { count: summary.data.today.salesCount })
              : undefined
          }
          icon={Banknote}
          tone="default"
          isLoading={summary.isLoading}
        />
        <KpiCard
          label={t("profitToday")}
          value={
            summary.data ? formatMoney(summary.data.today.profit) : tc("noData")
          }
          hint={
            summary.data
              ? t("last7dProfit", {
                  amount: formatMoney(summary.data.week.profit),
                })
              : undefined
          }
          icon={TrendingUp}
          tone="success"
          isLoading={summary.isLoading}
        />
        <KpiCard
          label={t("activeProducts")}
          value={
            summary.data ? summary.data.totals.activeProducts : tc("noData")
          }
          hint={
            summary.data
              ? t("customerCount", { count: summary.data.totals.customers })
              : undefined
          }
          icon={Package}
          tone="default"
          isLoading={summary.isLoading}
        />
        <KpiCard
          label={t("lowStockKpi")}
          value={
            summary.data ? summary.data.totals.lowStockCount : tc("noData")
          }
          hint={
            summary.data && summary.data.totals.lowStockCount > 0
              ? t("needsRestocking")
              : t("allGood")
          }
          icon={AlertTriangle}
          tone={
            summary.data && summary.data.totals.lowStockCount > 0
              ? "warning"
              : "success"
          }
          isLoading={summary.isLoading}
        />
      </div>

      <AiInsightsPanel days={days} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-base">{t("revenueProfitChart")}</CardTitle>
              <CardDescription>{t("dailyTotals", { days })}</CardDescription>
            </div>
            {summary.data ? (
              <div className="hidden text-right text-xs text-muted-foreground md:block">
                <p>
                  {t("periodRevenue", {
                    amount: formatMoney(periodRevenue(trend.data)),
                  })}
                </p>
              </div>
            ) : null}
          </CardHeader>
          <CardContent>
            <RevenueTrendChart data={trend.data} isLoading={trend.isLoading} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("topProducts")}</CardTitle>
            <CardDescription>{t("topProductsDesc", { days })}</CardDescription>
          </CardHeader>
          <CardContent>
            <TopProductsList data={top.data} isLoading={top.isLoading} />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-base">{t("lowStockTitle")}</CardTitle>
              <CardDescription>{t("lowStockDesc")}</CardDescription>
            </div>
            <AlertTriangle className="h-5 w-5 text-amber-500" aria-hidden />
          </CardHeader>
          <CardContent>
            <LowStockList data={lowStock.data} isLoading={lowStock.isLoading} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">{t("monthGlance")}</CardTitle>
            <CardDescription>{t("monthGlanceDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Stat
              icon={Banknote}
              label={tc("revenue")}
              value={
                summary.data
                  ? formatMoney(summary.data.month.revenue)
                  : tc("noData")
              }
              loading={summary.isLoading}
            />
            <Stat
              icon={TrendingUp}
              label={tc("profit")}
              value={
                summary.data
                  ? formatMoney(summary.data.month.profit)
                  : tc("noData")
              }
              loading={summary.isLoading}
              tone="success"
            />
            <Stat
              icon={ReceiptText}
              label={t("salesToday")}
              value={
                summary.data
                  ? summary.data.today.salesCount.toString()
                  : tc("noData")
              }
              loading={summary.isLoading}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  loading,
  tone = "default",
}: {
  icon: typeof Banknote;
  label: string;
  value: React.ReactNode;
  loading?: boolean;
  tone?: "default" | "success";
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/40 p-4">
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-md",
          tone === "success"
            ? "bg-emerald-100 text-emerald-700"
            : "bg-muted text-foreground",
        )}
        aria-hidden
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p
          className={cn(
            "mt-1 truncate text-lg font-semibold tracking-tight text-foreground",
            loading && "h-6 w-24 animate-pulse rounded bg-muted",
          )}
        >
          {loading ? "" : value}
        </p>
      </div>
    </div>
  );
}

function greetingFor(
  name: string | undefined,
  t: ReturnType<typeof useTranslations<"dashboard">>,
): string {
  const hour = new Date().getHours();
  const first = name?.split(" ")[0];
  if (hour < 12) {
    return first
      ? t("greetingMorning", { name: first })
      : t("greetingMorningOnly");
  }
  if (hour < 18) {
    return first
      ? t("greetingAfternoon", { name: first })
      : t("greetingAfternoonOnly");
  }
  return first
    ? t("greetingEvening", { name: first })
    : t("greetingEveningOnly");
}

function periodRevenue(
  data: import("@sme/shared").RevenueTrendBucket[] | undefined,
): string {
  if (!data) return "0.00";
  const sum = data.reduce((acc, b) => acc + Number(b.revenue), 0);
  return sum.toFixed(2);
}
