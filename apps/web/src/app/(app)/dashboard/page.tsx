"use client";

import { formatMoney } from "@sme/shared";
import {
  AlertTriangle,
  Banknote,
  Package,
  ReceiptText,
  TrendingUp,
  Users,
} from "lucide-react";
import * as React from "react";

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

const PERIODS = [
  { label: "7 days", days: 7 },
  { label: "30 days", days: 30 },
  { label: "90 days", days: 90 },
] as const;

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const [days, setDays] = React.useState<number>(30);

  const summary = useDashboardSummary();
  const trend = useRevenueTrend(days);
  const top = useTopProducts(days, 5);
  const lowStock = useLowStockProducts(5);

  const greeting = greetingFor(user?.name);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Greeting + period selector */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            {greeting}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Here&apos;s how {user?.organizationName ?? "your business"} is doing
            today.
          </p>
        </div>
        <div className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1">
          {PERIODS.map((p) => (
            <Button
              key={p.days}
              variant={days === p.days ? "default" : "ghost"}
              size="sm"
              onClick={() => setDays(p.days)}
              className={cn(
                "h-8 px-3 text-xs font-medium",
                days === p.days
                  ? ""
                  : "text-slate-600 hover:bg-slate-100",
              )}
            >
              {p.label}
            </Button>
          ))}
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Revenue today"
          value={
            summary.data
              ? formatMoney(summary.data.today.revenue)
              : "—"
          }
          hint={
            summary.data
              ? `${summary.data.today.salesCount} sale${summary.data.today.salesCount === 1 ? "" : "s"} so far`
              : undefined
          }
          icon={Banknote}
          tone="default"
          isLoading={summary.isLoading}
        />
        <KpiCard
          label="Profit today"
          value={
            summary.data
              ? formatMoney(summary.data.today.profit)
              : "—"
          }
          hint={
            summary.data
              ? `Last 7d: ${formatMoney(summary.data.week.profit)}`
              : undefined
          }
          icon={TrendingUp}
          tone="success"
          isLoading={summary.isLoading}
        />
        <KpiCard
          label="Active products"
          value={summary.data ? summary.data.totals.activeProducts : "—"}
          hint={
            summary.data
              ? `${summary.data.totals.customers} customers`
              : undefined
          }
          icon={Package}
          tone="default"
          isLoading={summary.isLoading}
        />
        <KpiCard
          label="Low stock"
          value={summary.data ? summary.data.totals.lowStockCount : "—"}
          hint={
            summary.data && summary.data.totals.lowStockCount > 0
              ? "needs restocking"
              : "all good"
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

      {/* Revenue chart + top products row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-base">Revenue & profit</CardTitle>
              <CardDescription>
                Daily totals over the last {days} days.
              </CardDescription>
            </div>
            {summary.data ? (
              <div className="hidden text-right text-xs text-slate-500 md:block">
                <p>
                  Period revenue:{" "}
                  <span className="font-medium text-slate-900">
                    {formatMoney(periodRevenue(trend.data))}
                  </span>
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
            <CardTitle className="text-base">Top products</CardTitle>
            <CardDescription>
              By revenue over the last {days} days.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TopProductsList data={top.data} isLoading={top.isLoading} />
          </CardContent>
        </Card>
      </div>

      {/* Low stock + month overview row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-base">Low stock</CardTitle>
              <CardDescription>Restock these soon.</CardDescription>
            </div>
            <AlertTriangle
              className="h-5 w-5 text-amber-500"
              aria-hidden
            />
          </CardHeader>
          <CardContent>
            <LowStockList
              data={lowStock.data}
              isLoading={lowStock.isLoading}
            />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">This month at a glance</CardTitle>
            <CardDescription>Last 30-day rolling totals.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Stat
              icon={Banknote}
              label="Revenue"
              value={
                summary.data
                  ? formatMoney(summary.data.month.revenue)
                  : "—"
              }
              loading={summary.isLoading}
            />
            <Stat
              icon={TrendingUp}
              label="Profit"
              value={
                summary.data
                  ? formatMoney(summary.data.month.profit)
                  : "—"
              }
              loading={summary.isLoading}
              tone="success"
            />
            <Stat
              icon={ReceiptText}
              label="Sales today"
              value={
                summary.data
                  ? summary.data.today.salesCount.toString()
                  : "—"
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
  icon: typeof Users;
  label: string;
  value: React.ReactNode;
  loading?: boolean;
  tone?: "default" | "success";
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50/60 p-4">
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-md",
          tone === "success"
            ? "bg-emerald-100 text-emerald-700"
            : "bg-slate-200/70 text-slate-700",
        )}
        aria-hidden
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          {label}
        </p>
        <p
          className={cn(
            "mt-1 truncate text-lg font-semibold tracking-tight text-slate-900",
            loading && "h-6 w-24 animate-pulse rounded bg-slate-200/70",
          )}
        >
          {loading ? "" : value}
        </p>
      </div>
    </div>
  );
}

function greetingFor(name: string | undefined): string {
  const hour = new Date().getHours();
  const part =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const first = name?.split(" ")[0];
  return first ? `${part}, ${first}.` : `${part}.`;
}

function periodRevenue(
  data: import("@sme/shared").RevenueTrendBucket[] | undefined,
): string {
  if (!data) return "0.00";
  const sum = data.reduce((acc, b) => acc + Number(b.revenue), 0);
  return sum.toFixed(2);
}
