import { Redirect, Tabs } from "expo-router";

import { PosFab } from "@/components/layout/pos-fab";
import { CASHIER_TABS } from "@/config/nav";
import { useTranslation } from "@/i18n/context";
import { useAuthStore } from "@/stores/auth.store";

export default function CashierLayout() {
  const t = useTranslation();
  const user = useAuthStore((s) => s.user);

  if (user && user.role !== "CASHIER") {
    return <Redirect href="/" />;
  }

  return (
    <>
      <Tabs
        initialRouteName="customers"
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: "#E15A65",
          tabBarInactiveTintColor: "#94a3b8",
        }}
      >
        <Tabs.Screen name="index" options={{ href: null }} />
        {CASHIER_TABS.map((tab) => (
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
      </Tabs>
      <PosFab />
    </>
  );
}
