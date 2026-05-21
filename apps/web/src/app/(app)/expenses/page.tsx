"use client";



import { formatMoney, type OperationalExpense } from "@sme/shared";

import { Pencil, Plus, Receipt, Trash2 } from "lucide-react";

import { useTranslations } from "next-intl";

import * as React from "react";

import { toast } from "sonner";



import { ExpenseCategoriesCard } from "@/components/expenses/expense-categories-card";

import { ExpenseFormDialog } from "@/components/expenses/expense-form-dialog";

import { Button } from "@/components/ui/button";

import {

  Card,

  CardContent,

  CardDescription,

  CardHeader,

  CardTitle,

} from "@/components/ui/card";

import { Input } from "@/components/ui/input";

import {

  Select,

  SelectContent,

  SelectItem,

  SelectTrigger,

  SelectValue,

} from "@/components/ui/select";

import { Skeleton } from "@/components/ui/skeleton";

import {

  useDeleteExpense,

  useExpenseCategories,

  useExpensesList,

} from "@/hooks/use-expenses";



const PAGE_SIZE = 20;

const ALL_CATEGORIES = "__all__";



function todayYmd(): string {

  const d = new Date();

  return d.toISOString().slice(0, 10);

}



function monthStartYmd(): string {

  const d = new Date();

  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;

}



export default function ExpensesPage() {

  const t = useTranslations("expenses");

  const tp = useTranslations("payments");

  const tc = useTranslations("common");



  const categoriesQ = useExpenseCategories();



  const [page, setPage] = React.useState(1);

  const [from, setFrom] = React.useState(monthStartYmd());

  const [to, setTo] = React.useState(todayYmd());

  const [categoryFilter, setCategoryFilter] = React.useState(ALL_CATEGORIES);

  const [formOpen, setFormOpen] = React.useState(false);

  const [editing, setEditing] = React.useState<OperationalExpense | null>(null);



  const deleteMut = useDeleteExpense();

  const categories = categoriesQ.data ?? [];



  const q = useExpensesList({

    page,

    pageSize: PAGE_SIZE,

    from,

    to,

    categoryId:

      categoryFilter === ALL_CATEGORIES ? undefined : categoryFilter,

    sortBy: "expenseDate",

    sortDir: "desc",

  });



  const items = q.data?.items ?? [];

  const totalPages = q.data?.totalPages ?? 1;

  const periodTotal = q.data?.periodTotal ?? "0.00";



  const openCreate = () => {

    setEditing(null);

    setFormOpen(true);

  };



  const openEdit = (e: OperationalExpense) => {

    setEditing(e);

    setFormOpen(true);

  };



  const onDelete = async (e: OperationalExpense) => {

    if (

      !window.confirm(

        t("deleteConfirm", {

          amount: formatMoney(e.amount),

          date: e.expenseDate,

        }),

      )

    ) {

      return;

    }

    try {

      await deleteMut.mutateAsync(e.id);

      toast.success(t("removed"));

    } catch (err) {

      toast.error((err as Error).message);

    }

  };



  return (

    <div className="mx-auto max-w-7xl space-y-6">

      <div className="flex flex-wrap items-end justify-between gap-4">

        <div>

          <h1 className="text-2xl font-semibold tracking-tight text-foreground">

            {t("title")}

          </h1>

          <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>

        </div>

        <Button onClick={openCreate} className="gap-2">

          <Plus className="h-4 w-4" />

          {t("addExpense")}

        </Button>

      </div>



      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,340px)]">

        <div className="space-y-6">

          <Card>

            <CardHeader className="pb-3">

              <CardTitle className="text-base">{t("filterTitle")}</CardTitle>

              <CardDescription>{t("filterDesc")}</CardDescription>

            </CardHeader>

            <CardContent className="flex flex-wrap items-end gap-3">

              <div className="grid gap-1">

                <label className="text-xs text-muted-foreground">

                  {t("from")}

                </label>

                <Input

                  type="date"

                  className="h-10 w-40"

                  value={from}

                  onChange={(ev) => {

                    setFrom(ev.target.value);

                    setPage(1);

                  }}

                />

              </div>

              <div className="grid gap-1">

                <label className="text-xs text-muted-foreground">{t("to")}</label>

                <Input

                  type="date"

                  className="h-10 w-40"

                  value={to}

                  onChange={(ev) => {

                    setTo(ev.target.value);

                    setPage(1);

                  }}

                />

              </div>

              <div className="grid gap-1">

                <label className="text-xs text-muted-foreground">

                  {t("filterByCategory")}

                </label>

                <Select

                  value={categoryFilter}

                  onValueChange={(v) => {

                    setCategoryFilter(v);

                    setPage(1);

                  }}

                >

                  <SelectTrigger className="h-10 w-44">

                    <SelectValue />

                  </SelectTrigger>

                  <SelectContent>

                    <SelectItem value={ALL_CATEGORIES}>

                      {t("allCategories")}

                    </SelectItem>

                    {categories.map((c) => (

                      <SelectItem key={c.id} value={c.id}>

                        {c.name}

                      </SelectItem>

                    ))}

                  </SelectContent>

                </Select>

              </div>

            </CardContent>

          </Card>



          <Card>

            <CardHeader className="flex-row items-center justify-between space-y-0">

              <div>

                <CardTitle className="flex items-center gap-2 text-base">

                  <Receipt className="h-4 w-4" />

                  {t("listTitle")}

                </CardTitle>

                <CardDescription>

                  {q.data

                    ? t("pageSummary", {

                        total: q.data.total,

                        amount: formatMoney(periodTotal),

                      })

                    : t("loading")}

                </CardDescription>

              </div>

            </CardHeader>

            <CardContent>

              {q.isLoading ? (

                <div className="space-y-2">

                  {Array.from({ length: 5 }).map((_, i) => (

                    <Skeleton key={i} className="h-14 w-full" />

                  ))}

                </div>

              ) : items.length === 0 ? (

                <p className="py-8 text-center text-sm text-muted-foreground">

                  {t("empty")}

                </p>

              ) : (

                <ul className="divide-y divide-border">

                  {items.map((e) => (

                    <li

                      key={e.id}

                      className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0"

                    >

                      <div className="min-w-0 flex-1">

                        <p className="font-medium text-foreground">

                          {e.categoryName}

                          {e.description ? ` — ${e.description}` : ""}

                        </p>

                        <p className="text-xs text-muted-foreground">

                          {e.expenseDate} · {tp(e.paymentMethod)} ·{" "}

                          {t("recordedBy", { name: e.recordedByName })}

                        </p>

                      </div>

                      <div className="flex items-center gap-2">

                        <span className="text-lg font-semibold tabular-nums text-foreground">

                          {formatMoney(e.amount)}

                        </span>

                        <Button

                          variant="ghost"

                          size="icon"

                          onClick={() => openEdit(e)}

                          aria-label={tc("edit")}

                        >

                          <Pencil className="h-4 w-4" />

                        </Button>

                        <Button

                          variant="ghost"

                          size="icon"

                          onClick={() => void onDelete(e)}

                          aria-label={tc("delete")}

                        >

                          <Trash2 className="h-4 w-4 text-destructive" />

                        </Button>

                      </div>

                    </li>

                  ))}

                </ul>

              )}



              {totalPages > 1 ? (

                <div className="mt-4 flex justify-center gap-2">

                  <Button

                    variant="outline"

                    size="sm"

                    disabled={page <= 1}

                    onClick={() => setPage((p) => p - 1)}

                  >

                    {tc("previousPage")}

                  </Button>

                  <span className="flex items-center text-sm text-muted-foreground">

                    {page} / {totalPages}

                  </span>

                  <Button

                    variant="outline"

                    size="sm"

                    disabled={page >= totalPages}

                    onClick={() => setPage((p) => p + 1)}

                  >

                    {tc("nextPage")}

                  </Button>

                </div>

              ) : null}

            </CardContent>

          </Card>

        </div>



        <ExpenseCategoriesCard />

      </div>



      <ExpenseFormDialog

        open={formOpen}

        onOpenChange={setFormOpen}

        expense={editing}

      />

    </div>

  );

}

