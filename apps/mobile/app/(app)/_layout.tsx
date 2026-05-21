import { Redirect, Stack } from "expo-router";

import { useAuthStore } from "@/stores/auth.store";

export default function AppLayout() {
  const user = useAuthStore((s) => s.user);
  const isInitialized = useAuthStore((s) => s.isInitialized);

  if (isInitialized && !user) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(owner-manager)" />
      <Stack.Screen name="(cashier)" />
      <Stack.Screen name="(inventory)" />
      <Stack.Screen
        name="pos"
        options={{ presentation: "modal", animation: "slide_from_bottom" }}
      />
    </Stack>
  );
}
