"use client";

import type { Product } from "@sme/shared";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import * as React from "react";

import { CategoriesCard } from "@/components/inventory/categories-card";
import {
  InventoryFilters,
  type InventoryFilterState,
} from "@/components/inventory/inventory-filters";
import { ProductDialog } from "@/components/inventory/product-dialog";
import { ProductsTable } from "@/components/inventory/products-table";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useCategories, useProductsList } from "@/hooks/use-inventory";

const PAGE_SIZE = 20;
const DEFAULT_FILTERS: InventoryFilterState = {
  search: "",
  categoryId: undefined,
  status: "ACTIVE",
  lowStockOnly: false,
};

export default function InventoryPage() {
  const t = useTranslations("inventory");
  const tc = useTranslations("common");
  const [filters, setFilters] =
    React.useState<InventoryFilterState>(DEFAULT_FILTERS);
  const [page, setPage] = React.useState(1);
  const [debouncedSearch, setDebouncedSearch] = React.useState("");

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Product | null>(null);

  React.useEffect(() => {
    const t = window.setTimeout(
      () => setDebouncedSearch(filters.search.trim()),
      300,
    );
    return () => window.clearTimeout(t);
  }, [filters.search]);

  React.useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filters.categoryId, filters.status, filters.lowStockOnly]);

  const params = React.useMemo(
    () => ({
      page,
      pageSize: PAGE_SIZE,
      sortBy: "createdAt",
      sortDir: "desc" as const,
      search: debouncedSearch || undefined,
      categoryId: filters.categoryId,
      status: filters.status === "ALL" ? undefined : filters.status,
      lowStockOnly: filters.lowStockOnly || undefined,
    }),
    [page, debouncedSearch, filters.categoryId, filters.status, filters.lowStockOnly],
  );

  const productsQ = useProductsList(params);
  const categoriesQ = useCategories();
  const categories = categoriesQ.data ?? [];

  const items = productsQ.data?.items ?? [];
  const total = productsQ.data?.total ?? 0;
  const totalPages = productsQ.data?.totalPages ?? 1;

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };
  const openEdit = (p: Product) => {
    setEditing(p);
    setDialogOpen(true);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            {t("title")}
          </h1>
          <p className="mt-1 text-sm text-slate-600">{t("subtitle")}</p>
        </div>
        <Button
          type="button"
          className="h-11 gap-2"
          onClick={openCreate}
        >
          <Plus className="h-4 w-4" />
          {t("addProduct")}
        </Button>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,340px)]">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">{t("productsTitle")}</CardTitle>
            <CardDescription>
              {productsQ.isLoading
                ? t("loadingProducts")
                : total === 0
                  ? t("noProductsYet")
                  : t("productCount", { count: total })}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <InventoryFilters
              value={filters}
              onChange={setFilters}
              categories={categories}
            />

            {productsQ.isError ? (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {(productsQ.error as Error).message}
                <Button
                  type="button"
                  variant="link"
                  className="ml-2 h-auto p-0 text-red-700"
                  onClick={() => void productsQ.refetch()}
                >
                  {tc("retry")}
                </Button>
              </div>
            ) : (
              <ProductsTable
                products={items}
                isLoading={productsQ.isLoading}
                isFetching={productsQ.isFetching && !productsQ.isLoading}
                onEdit={openEdit}
                onCreate={openCreate}
              />
            )}

            {items.length > 0 && totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                <p className="text-xs text-slate-500">
                  {tc("pageOf", { page, total: totalPages })}
                </p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-9 w-9 p-0"
                    aria-label={tc("previousPage")}
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-9 w-9 p-0"
                    aria-label={tc("nextPage")}
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="lg:sticky lg:top-4 lg:self-start">
          <CategoriesCard />
        </div>
      </div>

      <ProductDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        product={editing}
        categories={categories}
      />
    </div>
  );
}
