"use client";

import { formatMoney, type PaymentMethod, type Sale } from "@sme/shared";
import { ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { useTranslations } from "next-intl";
import * as React from "react";

import { SaleDetailDialog } from "@/components/sales/sale-detail-dialog";
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
import { useFormatSaleDate } from "@/hooks/use-format-sale-date";
import { usePaymentLabels } from "@/hooks/use-payment-labels";
import { useSalesList } from "@/hooks/use-sales";

const PAGE_SIZE = 20;
const ALL = "__all__";

export default function SalesPage() {
  const t = useTranslations("sales");
  const tc = useTranslations("common");
  const paymentLabels = usePaymentLabels();
  const formatSaleDate = useFormatSaleDate();
  const [page, setPage] = React.useState(1);
  const [paymentMethod, setPaymentMethod] = React.useState<
    PaymentMethod | typeof ALL
  >(ALL);
  const [dateFrom, setDateFrom] = React.useState("");
  const [dateTo, setDateTo] = React.useState("");

  const [selectedSale, setSelectedSale] = React.useState<Sale | null>(null);

  React.useEffect(() => setPage(1), [paymentMethod, dateFrom, dateTo]);

  const q = useSalesList({
    page,
    pageSize: PAGE_SIZE,
    sortBy: "createdAt",
    sortDir: "desc",
    paymentMethod: paymentMethod === ALL ? undefined : paymentMethod,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo ? `${dateTo}T23:59:59.999Z` : undefined,
  });

  const items = q.data?.items ?? [];
  const totalPages = q.data?.totalPages ?? 1;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          {t("title")}
        </h1>
        <p className="mt-1 text-sm text-slate-600">{t("subtitle")}</p>
      </header>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">{t("history")}</CardTitle>
          <CardDescription>
            {q.isLoading
              ? t("loading")
              : t("count", { count: q.data?.total ?? 0 })}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="grid gap-1.5">
              <Label htmlFor="date-from" className="text-xs text-slate-600">
                {tc("fromDate")}
              </Label>
              <Input
                id="date-from"
                type="date"
                className="h-11"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="date-to" className="text-xs text-slate-600">
                {tc("toDate")}
              </Label>
              <Input
                id="date-to"
                type="date"
                className="h-11"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs text-slate-600">{tc("payment")}</Label>
              <Select
                value={paymentMethod}
                onValueChange={(v) =>
                  setPaymentMethod(v as PaymentMethod | typeof ALL)
                }
              >
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>{tc("allMethods")}</SelectItem>
                  {(Object.keys(paymentLabels) as PaymentMethod[]).map(
                    (key) => (
                      <SelectItem key={key} value={key}>
                        {paymentLabels[key]}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {q.isLoading && (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          )}

          {q.isError && (
            <p className="text-sm text-red-600">{(q.error as Error).message}</p>
          )}

          {!q.isLoading && !q.isError && items.length === 0 && (
            <p className="py-10 text-center text-sm text-slate-500">
              {t.rich("empty", {
                link: (chunks) => (
                  <a href="/pos" className="font-medium text-slate-900 underline">
                    {chunks}
                  </a>
                ),
              })}
            </p>
          )}

          {!q.isLoading && !q.isError && items.length > 0 && (
            <>
              <ul className="divide-y divide-slate-100 rounded-xl border border-slate-100">
                {items.map((sale) => (
                  <li
                    key={sale.id}
                    className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="font-medium tabular-nums text-slate-900">
                        {formatMoney(sale.total)}
                      </p>
                      <p className="text-sm text-slate-600">
                        {formatSaleDate(sale.createdAt)}
                        {sale.customer
                          ? ` · ${sale.customer.name}`
                          : ` · ${tc("walkIn")}`}
                      </p>
                      <p className="text-xs text-slate-500">
                        {t("profitLine", {
                          count: sale.items.length,
                          amount: formatMoney(sale.profit),
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="font-normal">
                        {paymentLabels[sale.paymentMethod]}
                      </Badge>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-10"
                        onClick={() => setSelectedSale(sale)}
                      >
                        <Eye className="mr-1 h-4 w-4" />
                        {tc("receipt")}
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>

              {totalPages > 1 && (
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

      <SaleDetailDialog
        saleId={selectedSale?.id ?? null}
        salePreview={selectedSale}
        onOpenChange={() => setSelectedSale(null)}
      />
    </div>
  );
}
