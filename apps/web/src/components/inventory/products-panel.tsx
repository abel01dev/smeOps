"use client";

import { formatMoney } from "@sme/shared";
import type { Category, Product, ProductStatus } from "@sme/shared";
import { ChevronLeft, ChevronRight, Package, Plus, Search } from "lucide-react";
import * as React from "react";

import { ProductFormDialog } from "@/components/inventory/product-form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useProductsList } from "@/hooks/use-inventory";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 20;
const NONE = "__all__";

function statusLabel(s: ProductStatus) {
  return s === "ACTIVE" ? "Active" : "Archived";
}

export function ProductsPanel({ categories }: { categories: Category[] }) {
  const [page, setPage] = React.useState(1);
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [categoryId, setCategoryId] = React.useState<string | undefined>();
  const [status, setStatus] = React.useState<ProductStatus | "ALL">("ACTIVE");
  const [lowStockOnly, setLowStockOnly] = React.useState(false);

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [dialogMode, setDialogMode] = React.useState<"create" | "edit">("create");
  const [editing, setEditing] = React.useState<Product | null>(null);

  React.useEffect(() => {
    const t = window.setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => window.clearTimeout(t);
  }, [search]);

  const listParams = React.useMemo(
    () => ({
      page,
      pageSize: PAGE_SIZE,
      sortBy: "createdAt",
      sortDir: "desc" as const,
      search: debouncedSearch || undefined,
      categoryId,
      status: status === "ALL" ? undefined : status,
      lowStockOnly: lowStockOnly || undefined,
    }),
    [page, debouncedSearch, categoryId, status, lowStockOnly],
  );

  const q = useProductsList(listParams);

  React.useEffect(() => {
    setPage(1);
  }, [debouncedSearch, categoryId, status, lowStockOnly]);

  const items = q.data?.items ?? [];
  const totalPages = q.data?.totalPages ?? 1;

  const openCreate = () => {
    setDialogMode("create");
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (p: Product) => {
    setDialogMode("edit");
    setEditing(p);
    setDialogOpen(true);
  };

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="flex flex-col gap-4 space-y-0 pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle className="text-lg">Products</CardTitle>
          <CardDescription>
            Search, filter, and keep buy/sell prices and stock up to date.
          </CardDescription>
        </div>
        <Button
          type="button"
          className="min-h-11 w-full shrink-0 gap-2 sm:w-auto"
          onClick={openCreate}
        >
          <Plus className="h-4 w-4" />
          Add product
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-4">
          <div className="grid gap-2 lg:col-span-2">
            <Label htmlFor="inv-search" className="sr-only">
              Search products
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                id="inv-search"
                placeholder="Search by name…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="min-h-11 pl-9"
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label className="text-xs text-slate-600">Category</Label>
            <Select
              value={categoryId ?? NONE}
              onValueChange={(v) =>
                setCategoryId(v === NONE ? undefined : v)
              }
            >
              <SelectTrigger className="min-h-11">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>All categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label className="text-xs text-slate-600">Status</Label>
            <Select
              value={status}
              onValueChange={(v) =>
                setStatus(v as ProductStatus | "ALL")
              }
            >
              <SelectTrigger className="min-h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="ARCHIVED">Archived</SelectItem>
                <SelectItem value="ALL">All</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-3">
          <input
            type="checkbox"
            className="h-5 w-5 rounded border-slate-300"
            checked={lowStockOnly}
            onChange={(e) => setLowStockOnly(e.target.checked)}
          />
          <span className="text-sm font-medium text-slate-800">
            Low stock only
          </span>
        </label>

        {q.isLoading && (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        )}

        {q.isError && (
          <p className="text-sm text-destructive">
            {(q.error as Error).message}
            <Button
              type="button"
              variant="link"
              className="ml-2 h-auto p-0"
              onClick={() => void q.refetch()}
            >
              Retry
            </Button>
          </p>
        )}

        {!q.isLoading && !q.isError && items.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-slate-200 py-12 text-center">
            <Package className="h-10 w-10 text-slate-300" />
            <p className="text-sm font-medium text-slate-700">No products match</p>
            <p className="max-w-sm text-xs text-slate-500">
              Try clearing filters or add your first product.
            </p>
            <Button type="button" className="mt-2 min-h-11" onClick={openCreate}>
              Add product
            </Button>
          </div>
        )}

        {!q.isLoading && !q.isError && items.length > 0 && (
          <>
            <div className="hidden overflow-x-auto rounded-lg border border-slate-100 md:block">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="bg-slate-50 text-xs font-medium uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3 text-right">Buy</th>
                    <th className="px-4 py-3 text-right">Sell</th>
                    <th className="px-4 py-3 text-right">Stock</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right"> </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((p) => (
                    <ProductTableRow key={p.id} product={p} onEdit={openEdit} />
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-3 md:hidden">
              {items.map((p) => (
                <ProductMobileCard key={p.id} product={p} onEdit={openEdit} />
              ))}
            </div>

            <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 pt-4 sm:flex-row">
              <p className="text-xs text-slate-500">
                Page {page} of {totalPages}
                {q.data?.total != null ? ` · ${q.data.total} items` : null}
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="min-h-10 min-w-10"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="min-h-10 min-w-10"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>

      <ProductFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        product={editing}
        categories={categories}
      />
    </Card>
  );
}

function ProductTableRow({
  product: p,
  onEdit,
}: {
  product: Product;
  onEdit: (p: Product) => void;
}) {
  return (
    <tr className="hover:bg-slate-50/80">
      <td className="px-4 py-3">
        <div className="font-medium text-slate-900">{p.name}</div>
        {p.isLowStock && (
          <Badge variant="warning" className="mt-1">
            Low stock
          </Badge>
        )}
      </td>
      <td className="px-4 py-3 text-slate-600">
        {p.category?.name ?? "—"}
      </td>
      <td className="px-4 py-3 text-right tabular-nums text-slate-700">
        {formatMoney(p.buyPrice)}
      </td>
      <td className="px-4 py-3 text-right tabular-nums text-slate-700">
        {formatMoney(p.sellPrice)}
      </td>
      <td className="px-4 py-3 text-right tabular-nums text-slate-700">
        {p.stockQuantity}
        <span className="block text-xs font-normal text-slate-400">
          min {p.minStock}
        </span>
      </td>
      <td className="px-4 py-3">
        <Badge
          variant={p.status === "ACTIVE" ? "secondary" : "outline"}
          className="font-normal"
        >
          {statusLabel(p.status)}
        </Badge>
      </td>
      <td className="px-4 py-3 text-right">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="min-h-10"
          onClick={() => onEdit(p)}
        >
          Edit
        </Button>
      </td>
    </tr>
  );
}

function ProductMobileCard({
  product: p,
  onEdit,
}: {
  product: Product;
  onEdit: (p: Product) => void;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-slate-100 bg-white p-4 shadow-sm",
        p.isLowStock && "border-amber-200 bg-amber-50/30",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-medium text-slate-900">{p.name}</p>
          <p className="mt-0.5 text-xs text-slate-500">
            {p.category?.name ?? "No category"}
          </p>
        </div>
        <Badge
          variant={p.status === "ACTIVE" ? "secondary" : "outline"}
          className="shrink-0 font-normal"
        >
          {statusLabel(p.status)}
        </Badge>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
        <div className="rounded-md bg-slate-50 py-2">
          <p className="text-slate-500">Buy</p>
          <p className="mt-0.5 font-medium tabular-nums text-slate-800">
            {formatMoney(p.buyPrice)}
          </p>
        </div>
        <div className="rounded-md bg-slate-50 py-2">
          <p className="text-slate-500">Sell</p>
          <p className="mt-0.5 font-medium tabular-nums text-slate-800">
            {formatMoney(p.sellPrice)}
          </p>
        </div>
        <div className="rounded-md bg-slate-50 py-2">
          <p className="text-slate-500">Stock</p>
          <p className="mt-0.5 font-medium tabular-nums text-slate-800">
            {p.stockQuantity}
          </p>
        </div>
      </div>
      {p.isLowStock && (
        <Badge variant="warning" className="mt-2">
          Low stock (min {p.minStock})
        </Badge>
      )}
      <Button
        type="button"
        variant="outline"
        className="mt-3 w-full min-h-11"
        onClick={() => onEdit(p)}
      >
        Edit
      </Button>
    </div>
  );
}
