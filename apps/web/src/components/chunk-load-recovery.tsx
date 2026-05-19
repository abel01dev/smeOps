"use client";

import * as React from "react";

const SESSION_KEY = "sme-chunk-reload";

/**
 * In dev, stale chunk URLs after `next dev` restarts cause ChunkLoadError.
 * Reload once so the browser picks up the new build id.
 */
export function ChunkLoadRecovery() {
  React.useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;

    const tryReload = () => {
      if (sessionStorage.getItem(SESSION_KEY)) return;
      sessionStorage.setItem(SESSION_KEY, "1");
      window.location.reload();
    };

    const onUnhandled = (event: PromiseRejectionEvent) => {
      const reason = event.reason as Error | undefined;
      const message = reason?.message ?? String(event.reason ?? "");
      const name = reason?.name ?? "";
      if (
        name === "ChunkLoadError" ||
        message.includes("Loading chunk") ||
        message.includes("ChunkLoadError")
      ) {
        tryReload();
      }
    };

    const onError = (event: ErrorEvent) => {
      const message = event.message ?? "";
      if (message.includes("Loading chunk") || message.includes("ChunkLoadError")) {
        tryReload();
      }
    };

    window.addEventListener("unhandledrejection", onUnhandled);
    window.addEventListener("error", onError);

    const clearFlag = window.setTimeout(() => {
      sessionStorage.removeItem(SESSION_KEY);
    }, 30_000);

    return () => {
      window.removeEventListener("unhandledrejection", onUnhandled);
      window.removeEventListener("error", onError);
      window.clearTimeout(clearFlag);
    };
  }, []);

  return null;
}
