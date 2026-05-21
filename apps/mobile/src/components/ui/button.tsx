import * as React from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  type PressableProps,
} from "react-native";

import { cn } from "@/lib/cn";

export interface ButtonProps extends PressableProps {
  variant?: "default" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  loading?: boolean;
  label?: string;
  className?: string;
  textClassName?: string;
}

const variants = {
  default: "bg-primary active:opacity-90",
  secondary: "bg-secondary active:opacity-90",
  outline: "border border-border bg-card active:bg-muted",
  ghost: "active:bg-muted",
  destructive: "bg-destructive active:opacity-90",
};

const sizes = {
  default: "h-11 px-4 rounded-lg",
  sm: "h-9 px-3 rounded-md",
  lg: "h-12 px-6 rounded-lg",
  icon: "h-11 w-11 rounded-lg items-center justify-center",
};

const textVariants = {
  default: "text-primary-foreground font-semibold",
  secondary: "text-secondary-foreground font-semibold",
  outline: "text-foreground font-medium",
  ghost: "text-foreground font-medium",
  destructive: "text-destructive-foreground font-semibold",
};

export function Button({
  variant = "default",
  size = "default",
  loading,
  label,
  className,
  textClassName,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <Pressable
      className={cn(
        "flex-row items-center justify-center",
        variants[variant],
        sizes[size],
        (disabled || loading) && "opacity-50",
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "outline" || variant === "ghost" ? "#E15A65" : "#fff"}
        />
      ) : (
        <>
          {children}
          {label ? (
            <Text className={cn("text-base", textVariants[variant], textClassName)}>
              {label}
            </Text>
          ) : null}
        </>
      )}
    </Pressable>
  );
}
