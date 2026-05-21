import { EMPLOYEE_INVITE_ROLES } from "@sme/shared";
import { useState } from "react";
import { Alert, FlatList, Modal, Text, View } from "react-native";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Screen } from "@/components/layout/screen";
import { Card } from "@/components/ui/card";
import { useTranslation } from "@/i18n/context";
import { useEmployees, useCreateEmployee } from "@/hooks/use-employees";
import { useAuthStore } from "@/stores/auth.store";

export function TeamScreen() {
  const t = useTranslation();
  const user = useAuthStore((s) => s.user);
  const employees = useEmployees();
  const create = useCreateEmployee();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<(typeof EMPLOYEE_INVITE_ROLES)[number]>("CASHIER");

  if (user?.role !== "OWNER") {
    return (
      <Screen className="p-4">
        <Text className="text-muted-foreground">Access denied</Text>
      </Screen>
    );
  }

  const invite = async () => {
    try {
      await create.mutateAsync({ name, email, password, role });
      setOpen(false);
      setName("");
      setEmail("");
      setPassword("");
    } catch (e) {
      Alert.alert("Error", (e as Error).message);
    }
  };

  return (
    <Screen className="flex-1">
      <View className="p-4 border-b border-border">
        <Text className="text-xl font-bold">{t("nav.team")}</Text>
        <Button className="mt-3" label={t("team.create")} onPress={() => setOpen(true)} />
      </View>
      <FlatList
        data={employees.data ?? []}
        keyExtractor={(e) => e.id}
        contentContainerClassName="p-4 gap-3"
        renderItem={({ item }) => (
          <Card>
            <Text className="font-semibold">{item.name}</Text>
            <Text className="text-sm text-muted-foreground">{item.email}</Text>
            <Text className="text-xs text-primary mt-1">{item.role}</Text>
          </Card>
        )}
      />

      <Modal visible={open} animationType="slide" presentationStyle="pageSheet">
        <View className="flex-1 p-4 pt-12 gap-3 bg-background">
          <Input placeholder={t("team.name")} value={name} onChangeText={setName} />
          <Input placeholder={t("team.email")} value={email} onChangeText={setEmail} autoCapitalize="none" />
          <Input placeholder={t("team.password")} value={password} onChangeText={setPassword} secureTextEntry />
          <View className="flex-row flex-wrap gap-2">
            {EMPLOYEE_INVITE_ROLES.map((r) => (
              <Button
                key={r}
                variant={role === r ? "default" : "outline"}
                label={r}
                size="sm"
                onPress={() => setRole(r)}
              />
            ))}
          </View>
          <Button label={t("team.create")} loading={create.isPending} onPress={() => void invite()} />
          <Button variant="outline" label={t("common.cancel")} onPress={() => setOpen(false)} />
        </View>
      </Modal>
    </Screen>
  );
}
