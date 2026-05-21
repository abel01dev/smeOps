import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as React from "react";
import { useColorScheme } from "react-native";

import { I18nProvider } from "@/i18n/context";
import { useLocaleStore } from "@/stores/locale.store";
import { useThemeStore } from "@/stores/theme.store";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

function ThemeSync({ children }: { children: React.ReactNode }) {
  const mode = useThemeStore((s) => s.mode);
  const system = useColorScheme();
  const resolved = mode === "system" ? (system ?? "light") : mode;

  return (
    <React.Fragment key={resolved}>{children}</React.Fragment>
  );
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  const hydrateTheme = useThemeStore((s) => s.hydrate);
  const hydrateLocale = useLocaleStore((s) => s.hydrate);

  React.useEffect(() => {
    void hydrateTheme();
    void hydrateLocale();
  }, [hydrateTheme, hydrateLocale]);

  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <ThemeSync>{children}</ThemeSync>
      </I18nProvider>
    </QueryClientProvider>
  );
}
