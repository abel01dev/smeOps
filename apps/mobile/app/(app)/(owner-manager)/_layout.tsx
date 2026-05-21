import { Redirect, Tabs } from "expo-router";

import { PosFab } from "@/components/layout/pos-fab";
import { OWNER_MANAGER_TABS } from "@/config/nav";
import { useTranslation } from "@/i18n/context";
import { useAuthStore } from "@/stores/auth.store";

export default function OwnerManagerLayout() {
  const t = useTranslation();
  const user = useAuthStore((s) => s.user);

  if (user && user.role !== "OWNER" && user.role !== "MANAGER") {
    return <Redirect href="/" />;
  }

  return (
    <>
      <Tabs
        initialRouteName="dashboard"
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: "#E15A65",
          tabBarInactiveTintColor: "#94a3b8",
          tabBarStyle: {
            height: 60,
            paddingBottom: 8,
            borderTopColor: "#e2e8f0",
          },
        }}
      >
        <Tabs.Screen name="index" options={{ href: null }} />
        {OWNER_MANAGER_TABS.map((tab) => (
          <Tabs.Screen
            key={tab.name}
            name={tab.name}
            options={{
              title: t(tab.titleKey),
              tabBarIcon: ({ color, size }) => {
                const Icon = tab.icon;
                return <Icon color={color} size={size} />;
              },
            }}
          />
        ))}
        <Tabs.Screen name="profile/inventory" options={{ href: null }} />
        <Tabs.Screen name="profile/team" options={{ href: null }} />
        <Tabs.Screen name="profile/settings" options={{ href: null }} />
      </Tabs>
      <PosFab />
    </>
  );
}
