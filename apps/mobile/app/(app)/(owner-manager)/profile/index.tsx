import { router } from "expo-router";
import {
  ChevronRight,
  LogOut,
  Package,
  Settings,
  Users,
} from "lucide-react-native";
import { Alert, Pressable, Text, View } from "react-native";

import { Screen } from "@/components/layout/screen";
import { Card } from "@/components/ui/card";
import { useTranslation } from "@/i18n/context";
import { useAuthStore } from "@/stores/auth.store";

function MenuRow({
  icon: Icon,
  label,
  onPress,
}: {
  icon: typeof Package;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center justify-between py-4 border-b border-border"
    >
      <View className="flex-row items-center gap-3">
        <Icon size={22} color="#E15A65" />
        <Text className="text-base font-medium text-foreground">{label}</Text>
      </View>
      <ChevronRight size={20} color="#94a3b8" />
    </Pressable>
  );
}

export default function ProfileIndex() {
  const t = useTranslation();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const confirmLogout = () => {
    Alert.alert(t("common.signOut"), undefined, [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.signOut"),
        style: "destructive",
        onPress: () => void logout(),
      },
    ]);
  };

  return (
    <Screen scrollable className="px-4 pt-4">
      <Card className="mb-4">
        <Text className="text-lg font-bold text-foreground">{user?.name}</Text>
        <Text className="text-sm text-muted-foreground">{user?.email}</Text>
        <Text className="text-sm text-primary mt-1">{user?.organizationName}</Text>
        <Text className="text-xs text-muted-foreground mt-2">
          {user?.role ? t(`roles.${user.role.toLowerCase()}` as "roles.owner") : ""}
        </Text>
      </Card>

      <Card>
        <MenuRow
          icon={Package}
          label={t("nav.inventory")}
          onPress={() => router.push("/(app)/(owner-manager)/profile/inventory")}
        />
        {user?.role === "OWNER" ? (
          <MenuRow
            icon={Users}
            label={t("nav.team")}
            onPress={() => router.push("/(app)/(owner-manager)/profile/team")}
          />
        ) : null}
        <MenuRow
          icon={Settings}
          label={t("common.settings")}
          onPress={() => router.push("/(app)/(owner-manager)/profile/settings")}
        />
        <Pressable
          onPress={confirmLogout}
          className="flex-row items-center gap-3 py-4"
        >
          <LogOut size={22} color="#ef4444" />
          <Text className="text-base font-medium text-destructive">
            {t("common.signOut")}
          </Text>
        </Pressable>
      </Card>
    </Screen>
  );
}
