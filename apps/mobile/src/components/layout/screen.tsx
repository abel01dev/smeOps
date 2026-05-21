import * as React from "react";
import {
  RefreshControl,
  ScrollView,
  View,
  type ScrollViewProps,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { cn } from "@/lib/cn";

export function Screen({
  children,
  className,
  scrollable,
  refreshing,
  onRefresh,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  scrollable?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
} & ScrollViewProps) {
  const insets = useSafeAreaInsets();

  if (scrollable) {
    return (
      <ScrollView
        className={cn("flex-1 bg-background", className)}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        refreshControl={
          onRefresh ? (
            <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} />
          ) : undefined
        }
        {...props}
      >
        {children}
      </ScrollView>
    );
  }

  return (
    <View
      className={cn("flex-1 bg-background", className)}
      style={{ paddingBottom: insets.bottom }}
    >
      {children}
    </View>
  );
}
