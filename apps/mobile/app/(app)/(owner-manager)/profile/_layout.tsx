import { Stack } from "expo-router";

export default function ProfileLayout() {
  return (
    <Stack screenOptions={{ headerShown: true, headerTintColor: "#E15A65" }}>
      <Stack.Screen name="index" options={{ title: "Profile" }} />
      <Stack.Screen name="inventory" />
      <Stack.Screen name="team" />
      <Stack.Screen name="settings" />
    </Stack>
  );
}
