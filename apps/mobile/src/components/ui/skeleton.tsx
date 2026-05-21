import { View, type ViewProps } from "react-native";

import { cn } from "@/lib/cn";

export function Skeleton({ className, ...props }: ViewProps) {
  return (
    <View className={cn("rounded-md bg-muted opacity-70", className)} {...props} />
  );
}
