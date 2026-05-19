"use client";

import { formatMoney, type PaymentMethod } from "@sme/shared";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useCustomerDetail } from "@/hooks/use-customers";
import { formatSaleDate, PAYMENT_LABELS } from "@/lib/payment-labels";

export interface CustomerDetailDialogProps {
  customerId: string | null;
  onOpenChange: (open: boolean) => void;
}

export function CustomerDetailDialog({
  customerId,
  onOpenChange,
}: CustomerDetailDialogProps) {
  const q = useCustomerDetail(customerId);
  const open = !!customerId;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onOpenChange(false)}>
      <DialogContent className="max-h-[min(90vh,640px)] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Customer profile</DialogTitle>
        </DialogHeader>

        {q.isLoading && (
          <div className="space-y-3">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-20 w-full" />
          </div>
        )}

        {q.isError && (
          <p className="text-sm text-red-600">{(q.error as Error).message}</p>
        )}

        {q.data && (
          <div className="space-y-5">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                {q.data.name}
              </h3>
              {q.data.phone && (
                <p className="text-sm text-slate-600">{q.data.phone}</p>
              )}
              {q.data.address && (
                <p className="mt-1 text-sm text-slate-500">{q.data.address}</p>
              )}
            </div>

            <dl className="grid grid-cols-2 gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3 text-sm">
              <div>
                <dt className="text-slate-500">Total spent</dt>
                <dd className="font-semibold tabular-nums text-slate-900">
                  {formatMoney(q.data.totalSpent)}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Sales</dt>
                <dd className="font-semibold text-slate-900">
                  {q.data.salesCount ?? q.data.recentSales.length}
                </dd>
              </div>
            </dl>

            <div>
              <h4 className="mb-2 text-sm font-medium text-slate-700">
                Recent purchases
              </h4>
              {q.data.recentSales.length === 0 ? (
                <p className="text-sm text-slate-500">No sales yet.</p>
              ) : (
                <ul className="space-y-2">
                  {q.data.recentSales.map((sale) => (
                    <li
                      key={sale.id}
                      className="rounded-lg border border-slate-100 bg-white p-3 text-sm"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-slate-600">
                          {formatSaleDate(sale.createdAt)}
                        </span>
                        <span className="font-semibold tabular-nums">
                          {formatMoney(sale.total)}
                        </span>
                      </div>
                      <Badge variant="secondary" className="mt-1 font-normal">
                        {PAYMENT_LABELS[
                          sale.paymentMethod as PaymentMethod
                        ] ?? sale.paymentMethod}
                      </Badge>
                      <ul className="mt-2 space-y-0.5 text-xs text-slate-500">
                        {sale.items.map((item, i) => (
                          <li key={i}>
                            {item.quantity}× {item.productName} —{" "}
                            {formatMoney(item.lineTotal)}
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <Button variant="outline" className="w-full" asChild>
              <Link href="/sales" onClick={() => onOpenChange(false)}>
                View all sales
              </Link>
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
