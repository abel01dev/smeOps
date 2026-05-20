"use client";

import * as React from "react";

import { resolveTheme, useThemeStore } from "@/stores/theme.store";

function applyThemeClass(theme: ReturnType<typeof useThemeStore.getState>["theme"]) {
  const resolved = resolveTheme(theme);
  document.documentElement.classList.toggle("dark", resolved === "dark");
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useThemeStore((s) => s.theme);

  React.useEffect(() => {
    applyThemeClass(theme);

    if (theme !== "system") return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyThemeClass("system");
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [theme]);

  return <>{children}</>;
}

export function useResolvedTheme(): "light" | "dark" {
  const theme = useThemeStore((s) => s.theme);
  const [resolved, setResolved] = React.useState<"light" | "dark">(() =>
    resolveTheme(theme),
  );

  React.useEffect(() => {
    setResolved(resolveTheme(theme));

    if (theme !== "system") return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setResolved(resolveTheme("system"));
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [theme]);

  return resolved;
}
