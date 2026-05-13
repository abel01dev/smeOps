"use client";

import { CategoriesManager } from "@/components/inventory/categories-manager";
import { ProductsPanel } from "@/components/inventory/products-panel";
import { useCategories } from "@/hooks/use-inventory";

export default function InventoryPage() {
  const { data: categories = [] } = useCategories();

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Inventory
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Manage categories, pricing, and stock levels. Changes sync to the
          dashboard and will power the POS next.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,340px)]">
        <ProductsPanel categories={categories} />
        <div className="lg:sticky lg:top-4 lg:self-start">
          <CategoriesManager />
        </div>
      </div>
    </div>
  );
}
