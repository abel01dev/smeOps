"use client";

import type { Product } from "@sme/shared";
import * as React from "react";

import { PosCartPanel } from "@/components/pos/pos-cart-panel";
import { PosProductGrid } from "@/components/pos/pos-product-grid";
import { usePosCategories } from "@/hooks/use-pos";
import { usePosCartStore } from "@/stores/pos-cart.store";

/**
 * POS screen — screenshot-inspired split layout:
 * product grid (left ~65%) + current sale sidebar (right ~35%).
 * Uses full viewport height below the app header.
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
    <div className="-m-4 flex h-[calc(100dvh-3.5rem)] min-h-[32rem] flex-col overflow-hidden md:-m-6 md:h-[100dvh] lg:flex-row">
      <div className="flex min-h-0 min-w-0 flex-1 flex-col border-b border-border lg:border-b-0 lg:border-r">
        <PosProductGrid categories={categories} onAddProduct={onAdd} />
      </div>
      <div className="flex h-[min(42vh,22rem)] shrink-0 flex-col lg:h-auto lg:min-h-0 lg:shrink-0">
        <PosCartPanel />
      </div>
    </div>
  );
}
