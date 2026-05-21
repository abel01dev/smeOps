import { Text, View } from "react-native";

import { cn } from "@/lib/cn";

export function Badge({
  label,
  variant = "default",
  className,
}: {
  label: string;
  variant?: "default" | "secondary" | "destructive" | "outline";
  className?: string;
}) {
  const styles = {
    default: "bg-primary",
    secondary: "bg-secondary",
    destructive: "bg-destructive",
    outline: "border border-border bg-transparent",
  };
  const textStyles = {
    default: "text-primary-foreground",
    secondary: "text-secondary-foreground",
    destructive: "text-destructive-foreground",
    outline: "text-foreground",
  };
  return (
    <View className={cn("rounded-full px-2.5 py-0.5", styles[variant], className)}>
      <Text className={cn("text-xs font-medium", textStyles[variant])}>{label}</Text>
    </View>
  );
}
