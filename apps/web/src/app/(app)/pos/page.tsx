"use client";

import type { Product } from "@sme/shared";
import * as React from "react";

import { PosCartLines } from "@/components/pos/pos-cart-lines";
import { PosCheckoutPanel } from "@/components/pos/pos-checkout-panel";
import { PosProductGrid } from "@/components/pos/pos-product-grid";
import { usePosCategories } from "@/hooks/use-pos";
import { usePosCartStore } from "@/stores/pos-cart.store";

/**
 * Full-screen POS: products | cart lines | checkout (3 columns on large screens).
 */
export default function PosPage() {
  const categoriesQ = usePosCategories();
  const addProduct = usePosCartStore((s) => s.addProduct);
  const categories = categoriesQ.data ?? [];

  const onAdd = React.useCallback(
    (product: Product) => {
      addProduct(product);
    },
    [addProduct],
  );

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
      <div className="flex min-h-0 min-w-0 flex-col border-b border-border lg:flex-[0_0_50%] lg:border-b-0 lg:border-r">
        <PosProductGrid categories={categories} onAddProduct={onAdd} />
      </div>
      <div className="flex h-[min(38vh,20rem)] min-h-0 shrink-0 flex-col border-b border-border lg:h-auto lg:min-w-0 lg:flex-[0_0_25%] lg:border-b-0 lg:border-r">
        <PosCartLines />
      </div>
      <div className="flex min-h-0 min-w-0 flex-col lg:flex-[0_0_25%]">
        <PosCheckoutPanel />
      </div>
    </div>
  );
}
