/**
 * Offline POS sync port — v1 uses online-only checkout.
 * Implement queue + replay here when adding offline support.
 */
export interface SaleCheckoutPort {
  checkout: (payload: unknown) => Promise<unknown>;
}

export const onlineSaleCheckout: SaleCheckoutPort = {
  checkout: async () => {
    throw new Error("Use salesApi.create directly in v1");
  },
};

export function useNetworkStatus(): "online" | "offline" {
  return "online";
}
