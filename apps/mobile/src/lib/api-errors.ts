import { API_URL } from "./api-client";

/** Turn axios "Network Error" into a actionable message for Expo Go on device. */
export function formatApiError(err: unknown): string {
  const message = err instanceof Error ? err.message : String(err);
  const isNetwork =
    message === "Network Error" ||
    message.includes("ECONNREFUSED") ||
    message.includes("ENOTFOUND") ||
    message.includes("timeout");

  if (isNetwork) {
    const host = API_URL.replace(/\/api\/v1\/?$/, "");
    if (host.includes("localhost") || host.includes("127.0.0.1")) {
      return `Cannot reach the API at ${host}. On a phone, localhost is the phone itself — set EXPO_PUBLIC_API_URL in apps/mobile/.env to http://YOUR_PC_LAN_IP:4000/api/v1 (same Wi‑Fi), then restart Expo (pnpm dev:mobile).`;
    }
    return `Cannot reach the API at ${host}. Run "hostname -I" on your PC, put that IP in apps/mobile/.env as EXPO_PUBLIC_API_URL=http://<IP>:4000/api/v1, restart Expo. Also ensure pnpm dev:api is running and phone + PC share the same network.`;
  }

  return message;
}
