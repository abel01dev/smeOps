import * as React from "react";
import { TextInput, type TextInputProps } from "react-native";

import { cn } from "@/lib/cn";

export const Input = React.forwardRef<TextInput, TextInputProps>(
  ({ className, ...props }, ref) => (
    <TextInput
      ref={ref}
      className={cn(
        "h-11 rounded-lg border border-input bg-card px-3 text-base text-foreground",
        className,
      )}
      placeholderTextColor="#94a3b8"
      {...props}
    />
  ),
);

Input.displayName = "Input";
