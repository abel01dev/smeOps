import { Redirect, Stack } from "expo-router";

import { useAuthStore } from "@/stores/auth.store";

export default function InventoryLayout() {
  const user = useAuthStore((s) => s.user);

  if (user && user.role !== "INVENTORY_MANAGER") {
    return <Redirect href="/" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
