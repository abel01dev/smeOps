"use client";

import { formatMoney, type Customer } from "@sme/shared";
import { ChevronLeft, ChevronRight, Eye, Pencil, Plus, Search, Trash2 } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { CustomerDetailDialog } from "@/components/customers/customer-detail-dialog";
import { CustomerFormDialog } from "@/components/customers/customer-form-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCustomersList,
  useDeleteCustomer,
} from "@/hooks/use-customers";

const PAGE_SIZE = 20;

export default function CustomersPage() {
  const [page, setPage] = React.useState(1);
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");

  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Customer | null>(null);
  const [detailId, setDetailId] = React.useState<string | null>(null);

  const deleteMut = useDeleteCustomer();

  React.useEffect(() => {
    const t = window.setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => window.clearTimeout(t);
  }, [search]);

  React.useEffect(() => setPage(1), [debouncedSearch]);

  const q = useCustomersList({
    page,
    pageSize: PAGE_SIZE,
    search: debouncedSearch || undefined,
    sortBy: "name",
    sortDir: "asc",
  });

  const items = q.data?.items ?? [];
  const totalPages = q.data?.totalPages ?? 1;

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (c: Customer) => {
    setEditing(c);
    setFormOpen(true);
  };

  const onDelete = async (c: Customer) => {
    if (!window.confirm(`Delete "${c.name}"? Past sales will keep their records.`)) {
      return;
    }
    try {
      await deleteMut.mutateAsync(c.id);
      toast.success("Customer removed");
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Customers
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Repeat buyers, contact info, and purchase history.
          </p>
        </div>
        <Button type="button" className="h-11 gap-2" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Add customer
        </Button>
      </header>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">All customers</CardTitle>
          <CardDescription>
            {q.isLoading
              ? "Loading…"
              : `${q.data?.total ?? 0} customer${q.data?.total === 1 ? "" : "s"}`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search name or phone…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-11 pl-9"
            />
          </div>

          {q.isLoading && (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          )}

          {q.isError && (
            <p className="text-sm text-red-600">{(q.error as Error).message}</p>
          )}

          {!q.isLoading && !q.isError && items.length === 0 && (
            <p className="py-10 text-center text-sm text-slate-500">
              No customers yet. Add one or record sales with a customer in POS.
            </p>
          )}

          {!q.isLoading && !q.isError && items.length > 0 && (
            <>
              <ul className="divide-y divide-slate-100 rounded-xl border border-slate-100">
                {items.map((c) => (
                  <li
                    key={c.id}
                    className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900">{c.name}</p>
                      <p className="text-sm text-slate-500">
                        {[c.phone, c.address].filter(Boolean).join(" · ") ||
                          "No contact info"}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {c.salesCount ?? 0} sales · {formatMoney(c.totalSpent)} spent
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-10"
                        onClick={() => setDetailId(c.id)}
                      >
                        <Eye className="mr-1 h-4 w-4" />
                        View
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-10 w-10"
                        aria-label="Edit"
                        onClick={() => openEdit(c)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 text-slate-500 hover:text-red-600"
                        aria-label="Delete"
                        disabled={deleteMut.isPending}
                        onClick={() => void onDelete(c)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>

              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                  <p className="text-xs text-slate-500">
                    Page {page} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-9 w-9 p-0"
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
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <CustomerFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        customer={editing}
      />
      <CustomerDetailDialog
        customerId={detailId}
        onOpenChange={() => setDetailId(null)}
      />
    </div>
  );
}

