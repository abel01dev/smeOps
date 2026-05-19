"use client";

import { formatMoney, type Sale } from "@sme/shared";
import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useFormatSaleDate } from "@/hooks/use-format-sale-date";
import { usePaymentLabels } from "@/hooks/use-payment-labels";
import { useSaleDetail } from "@/hooks/use-sales";

export interface SaleDetailDialogProps {
  saleId: string | null;
  onOpenChange: (open: boolean) => void;
  /** If provided, skip fetch (e.g. from list row). */
  salePreview?: Sale | null;
}

export function SaleDetailDialog({
  saleId,
  onOpenChange,
  salePreview,
}: SaleDetailDialogProps) {
  const t = useTranslations("sales");
  const tc = useTranslations("common");
  const formatSaleDate = useFormatSaleDate();
  const paymentLabels = usePaymentLabels();
  const q = useSaleDetail(salePreview ? null : saleId);
  const open = !!saleId || !!salePreview;
  const sale = salePreview ?? q.data;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onOpenChange(false)}>
      <DialogContent className="max-h-[min(90vh,680px)] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("receiptTitle")}</DialogTitle>
        </DialogHeader>

        {q.isLoading && !salePreview && (
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-32 w-full" />
          </div>
        )}

        {q.isError && !salePreview && (
          <p className="text-sm text-red-600">{(q.error as Error).message}</p>
        )}

        {sale && (
          <div className="space-y-4 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-slate-600">{formatSaleDate(sale.createdAt)}</span>
              <Badge variant="secondary" className="font-normal">
                {paymentLabels[sale.paymentMethod]}
              </Badge>
            </div>

            {sale.customer && (
              <p className="text-slate-700">
                {tc("customer")}:{" "}
                <span className="font-medium text-slate-900">
                  {sale.customer.name}
                </span>
              </p>
            )}

            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 text-xs text-slate-500">
                  <th className="pb-2 font-medium">{tc("item")}</th>
                  <th className="pb-2 text-right font-medium">{t("qty")}</th>
                  <th className="pb-2 text-right font-medium">{tc("total")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sale.items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-2 pr-2 text-slate-900">{item.productName}</td>
                    <td className="py-2 text-right tabular-nums text-slate-600">
                      {item.quantity}
                    </td>
                    <td className="py-2 text-right tabular-nums font-medium">
                      {formatMoney(item.lineTotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <dl className="space-y-1 border-t border-slate-200 pt-3">
              <div className="flex justify-between text-slate-600">
                <dt>{tc("subtotal")}</dt>
                <dd className="tabular-nums">{formatMoney(sale.subtotal)}</dd>
              </div>
              {Number(sale.discount) > 0 && (
                <div className="flex justify-between text-slate-600">
                  <dt>{tc("discount")}</dt>
                  <dd className="tabular-nums text-emerald-700">
                    −{formatMoney(sale.discount)}
                  </dd>
                </div>
              )}
              <div className="flex justify-between text-base font-semibold text-slate-900">
                <dt>{tc("total")}</dt>
                <dd className="tabular-nums">{formatMoney(sale.total)}</dd>
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <dt>{tc("profit")}</dt>
                <dd className="tabular-nums">{formatMoney(sale.profit)}</dd>
              </div>
            </dl>

            {sale.note && (
              <p className="rounded-md bg-slate-50 p-2 text-slate-600">
                Note: {sale.note}
              </p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
