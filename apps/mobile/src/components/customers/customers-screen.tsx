import { useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  Text,
  View,
} from "react-native";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Screen } from "@/components/layout/screen";
import { Card } from "@/components/ui/card";
import { useTranslation } from "@/i18n/context";
import { useCustomersList, useCreateCustomer } from "@/hooks/use-customers";

export function CustomersScreen() {
  const t = useTranslation();
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const customers = useCustomersList(search);
  const create = useCreateCustomer();

  const handleCreate = async () => {
    if (!name.trim()) return;
    try {
      await create.mutateAsync({
        name: name.trim(),
        phone: phone.trim() || undefined,
      });
      setFormOpen(false);
      setName("");
      setPhone("");
    } catch (e) {
      Alert.alert("Error", (e as Error).message);
    }
  };

  return (
    <Screen className="flex-1">
      <View className="px-4 py-4 border-b border-border gap-3">
        <Text className="text-2xl font-bold">{t("nav.customers")}</Text>
        <Input
          value={search}
          onChangeText={setSearch}
          placeholder={t("customers.searchPlaceholder")}
        />
        <Button label={t("customers.addCustomer")} onPress={() => setFormOpen(true)} />
      </View>
      <FlatList
        data={customers.data?.items ?? []}
        keyExtractor={(c) => c.id}
        contentContainerClassName="p-4 gap-3"
        refreshing={customers.isFetching}
        onRefresh={() => customers.refetch()}
        renderItem={({ item }) => (
          <Card>
            <Text className="font-semibold">{item.name}</Text>
            {item.phone ? (
              <Text className="text-sm text-muted-foreground">{item.phone}</Text>
            ) : null}
            <Text className="text-xs text-muted-foreground mt-1">
              {t("customers.totalSpent")}: {Number(item.totalSpent).toFixed(2)} ETB
            </Text>
          </Card>
        )}
      />

      <Modal visible={formOpen} animationType="slide" presentationStyle="pageSheet">
        <View className="flex-1 p-4 pt-12 gap-4 bg-background">
          <Text className="text-xl font-bold">{t("customers.addCustomer")}</Text>
          <Input placeholder={t("customers.name")} value={name} onChangeText={setName} />
          <Input
            placeholder={t("customers.phone")}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
          <Button label={t("common.save")} loading={create.isPending} onPress={() => void handleCreate()} />
          <Button variant="outline" label={t("common.cancel")} onPress={() => setFormOpen(false)} />
        </View>
      </Modal>
    </Screen>
  );
}
