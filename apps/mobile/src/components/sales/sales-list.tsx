import { useState } from "react";
import { FlatList, Modal, Pressable, Text, View } from "react-native";

import { Screen } from "@/components/layout/screen";
import { Card } from "@/components/ui/card";
import { useTranslation } from "@/i18n/context";
import { useSalesList, useSaleDetail } from "@/hooks/use-sales";

export function SalesListScreen() {
  const t = useTranslation();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const sales = useSalesList({ page: 1, pageSize: 20 });
  const detail = useSaleDetail(selectedId);

  return (
    <Screen className="flex-1">
      <View className="px-4 py-4 border-b border-border">
        <Text className="text-2xl font-bold text-foreground">{t("nav.sales")}</Text>
      </View>
      <FlatList
        data={sales.data?.items ?? []}
        keyExtractor={(s) => s.id}
        contentContainerClassName="p-4 gap-3"
        refreshing={sales.isFetching}
        onRefresh={() => sales.refetch()}
        renderItem={({ item }) => (
          <Pressable onPress={() => setSelectedId(item.id)}>
            <Card>
              <Text className="font-semibold text-foreground">
                {Number(item.total).toFixed(2)} ETB
              </Text>
              <Text className="text-sm text-muted-foreground mt-1">
                {new Date(item.createdAt).toLocaleString()}
              </Text>
              <Text className="text-xs text-muted-foreground mt-1">
                {item.paymentMethod} · {item.items?.length ?? 0} {t("common.items")}
              </Text>
            </Card>
          </Pressable>
        )}
      />

      <Modal visible={!!selectedId} animationType="slide" presentationStyle="pageSheet">
        <View className="flex-1 bg-background p-4 pt-12">
          <Pressable onPress={() => setSelectedId(null)} className="mb-4">
            <Text className="text-primary">{t("common.close")}</Text>
          </Pressable>
          {detail.data ? (
            <>
              <Text className="text-2xl font-bold">
                {Number(detail.data.total).toFixed(2)} ETB
              </Text>
              <Text className="text-muted-foreground mt-2">
                {detail.data.paymentMethod}
              </Text>
              {detail.data.items.map((line) => (
                <View key={line.id} className="flex-row justify-between py-2 border-b border-border">
                  <Text>{line.productName} × {line.quantity}</Text>
                  <Text>{Number(line.lineTotal).toFixed(2)}</Text>
                </View>
              ))}
            </>
          ) : null}
        </View>
      </Modal>
    </Screen>
  );
}
