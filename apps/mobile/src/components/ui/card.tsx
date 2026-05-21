import * as React from "react";
import { Text, View, type ViewProps } from "react-native";

import { cn } from "@/lib/cn";

export function Card({ className, ...props }: ViewProps) {
  return (
    <View
      className={cn(
        "rounded-xl border border-border bg-card p-4 shadow-sm",
        className,
      )}
      {...props}
    />
  );
}

export function CardTitle({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Text className={cn("text-lg font-semibold text-card-foreground", className)}>
      {children}
    </Text>
  );
}

export function CardDescription({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Text className={cn("text-sm text-muted-foreground", className)}>{children}</Text>
  );
}
