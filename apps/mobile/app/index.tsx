import { Redirect, type Href } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useEffect } from "react";

import { roleMobileHomeRoute } from "@sme/shared";
import { setUnauthorizedHandler } from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth.store";

export default function Index() {
  const user = useAuthStore((s) => s.user);
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const isLoading = useAuthStore((s) => s.isLoading);
  const hydrate = useAuthStore((s) => s.hydrate);
  const logout = useAuthStore((s) => s.logout);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      void logout();
    });
    void hydrate();
  }, [hydrate, logout]);

  if (!isInitialized || isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#E15A65" />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  return <Redirect href={roleMobileHomeRoute(user.role) as Href} />;
}
