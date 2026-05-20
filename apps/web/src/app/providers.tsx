"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as React from "react";
import { Toaster } from "sonner";

import { ChunkLoadRecovery } from "@/components/chunk-load-recovery";
import { IntlProvider } from "@/components/i18n/intl-provider";
import { LocaleHtmlSync } from "@/components/i18n/locale-html-sync";
import { ThemeProvider, useResolvedTheme } from "@/components/theme/theme-provider";
import { useAuthStore } from "@/stores/auth.store";

function AuthHydrator({ children }: { children: React.ReactNode }) {
  const hydrate = useAuthStore((s) => s.hydrate);
  React.useEffect(() => {
    void hydrate();
  }, [hydrate]);
  return <>{children}</>;
}

function ThemedToaster() {
  const resolved = useResolvedTheme();
  return (
    <Toaster position="top-right" richColors closeButton theme={resolved} />
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ChunkLoadRecovery />
      <IntlProvider>
        <LocaleHtmlSync />
        <ThemeProvider>
          <AuthHydrator>{children}</AuthHydrator>
        </ThemeProvider>
      </IntlProvider>
      <ThemedToaster />
    </QueryClientProvider>
  );
}
