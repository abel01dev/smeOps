import { Text, View } from "react-native";

import { KpiCard, KpiRow } from "@/components/dashboard/kpi-card";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { Screen } from "@/components/layout/screen";
import { Card, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/i18n/context";
import {
  useAiInsights,
  useDashboardSummary,
  useRevenueTrend,
  useTopProducts,
} from "@/hooks/use-dashboard";

export default function DashboardScreen() {
  const t = useTranslation();
  const summary = useDashboardSummary();
  const trend = useRevenueTrend(30);
  const top = useTopProducts(7, 5);
  const insights = useAiInsights(30);

  const refresh = () => {
    void summary.refetch();
    void trend.refetch();
    void top.refetch();
    void insights.refetch();
  };

  const s = summary.data;

  return (
    <Screen
      scrollable
      refreshing={summary.isFetching}
      onRefresh={refresh}
      className="px-4 pt-4"
    >
      <Text className="text-2xl font-bold text-foreground mb-4">
        {t("nav.dashboard")}
      </Text>

      <KpiRow>
        <KpiCard
          label={t("dashboard.revenueToday")}
          value={s ? `${Number(s.today.revenue).toFixed(0)} ETB` : "—"}
          loading={summary.isLoading}
        />
        <KpiCard
          label={t("dashboard.profitToday")}
          value={s ? `${Number(s.today.profit).toFixed(0)} ETB` : "—"}
          loading={summary.isLoading}
        />
        <KpiCard
          label={t("dashboard.salesToday")}
          value={s ? String(s.today.salesCount) : "—"}
          loading={summary.isLoading}
        />
        <KpiCard
          label={t("dashboard.lowStockKpi")}
          value={s ? String(s.totals.lowStockCount) : "—"}
          loading={summary.isLoading}
        />
      </KpiRow>

      <View className="mt-4">
        <RevenueChart
          data={trend.data ?? []}
          title={t("dashboard.revenueProfitChart")}
        />
      </View>

      <Card className="mt-4">
        <CardTitle>{t("dashboard.topProducts")}</CardTitle>
        {(top.data ?? []).map((p, i) => (
          <View key={p.productId} className="flex-row justify-between py-2 border-b border-border">
            <Text className="text-foreground">
              {i + 1}. {p.productName}
            </Text>
            <Text className="text-muted-foreground">
              {Number(p.revenue).toFixed(0)} ETB
            </Text>
          </View>
        ))}
      </Card>

      <Card className="mt-4 mb-8">
        <CardTitle>{t("dashboard.insightsTitle")}</CardTitle>
        {(insights.data?.insights ?? []).slice(0, 5).map((ins) => (
          <View key={ins.id} className="py-2 border-b border-border">
            <Text className="font-medium text-foreground">{ins.title}</Text>
            <Text className="text-sm text-muted-foreground mt-1">{ins.message}</Text>
          </View>
        ))}
      </Card>
    </Screen>
  );
}
