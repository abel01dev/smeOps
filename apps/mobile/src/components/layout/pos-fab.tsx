import { router } from "expo-router";
import { ScanLine } from "lucide-react-native";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function PosFab() {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="absolute right-5 z-50"
      style={{ bottom: 72 + insets.bottom }}
      pointerEvents="box-none"
    >
      <Pressable
        onPress={() => router.push("/(app)/pos")}
        className="h-14 w-14 items-center justify-center rounded-full bg-primary shadow-lg active:opacity-90"
        accessibilityRole="button"
        accessibilityLabel="Open POS"
      >
        <ScanLine color="#fff" size={26} />
      </Pressable>
    </View>
  );
}
