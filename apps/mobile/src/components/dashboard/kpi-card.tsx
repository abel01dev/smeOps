import { Text, View } from "react-native";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/cn";

export function KpiCard({
  label,
  value,
  sub,
  loading,
  className,
}: {
  label: string;
  value: string;
  sub?: string;
  loading?: boolean;
  className?: string;
}) {
  if (loading) {
    return <Skeleton className={cn("h-24 rounded-xl", className)} />;
  }
  return (
    <Card className={cn("flex-1 min-w-[45%]", className)}>
      <Text className="text-xs text-muted-foreground">{label}</Text>
      <Text className="mt-1 text-2xl font-bold text-foreground">{value}</Text>
      {sub ? (
        <Text className="mt-0.5 text-xs text-muted-foreground">{sub}</Text>
      ) : null}
    </Card>
  );
}

export function KpiRow({ children }: { children: React.ReactNode }) {
  return <View className="flex-row flex-wrap gap-3">{children}</View>;
}
