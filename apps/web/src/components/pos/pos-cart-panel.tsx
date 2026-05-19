"use client";

import { formatMoney, type PaymentMethod } from "@sme/shared";
import { Minus, Plus, Trash2, User, UserX } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { PosCustomerPicker } from "@/components/pos/pos-customer-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateSale } from "@/hooks/use-pos";
import {
  cartTotals,
  usePosCartStore,
} from "@/stores/pos-cart.store";
import { cn } from "@/lib/utils";

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  CASH: "Cash",
  MOBILE_MONEY: "Mobile money",
  CARD: "Card",
};

export function PosCartPanel() {
  const lines = usePosCartStore((s) => s.lines);
  const customerId = usePosCartStore((s) => s.customerId);
  const customerName = usePosCartStore((s) => s.customerName);
  const discount = usePosCartStore((s) => s.discount);
  const paymentMethod = usePosCartStore((s) => s.paymentMethod);
  const setQuantity = usePosCartStore((s) => s.setQuantity);
  const removeLine = usePosCartStore((s) => s.removeLine);
  const setDiscount = usePosCartStore((s) => s.setDiscount);
  const setPaymentMethod = usePosCartStore((s) => s.setPaymentMethod);
  const setCustomer = usePosCartStore((s) => s.setCustomer);
  const clearCart = usePosCartStore((s) => s.clearCart);

  const [customerOpen, setCustomerOpen] = React.useState(false);
  const createSale = useCreateSale();

  const { subtotal, discount: appliedDiscount, total, itemCount } =
    cartTotals(lines, discount);

  const onCharge = async () => {
    if (lines.length === 0) {
      toast.error("Add at least one product to the sale");
      return;
    }
    try {
      await createSale.mutateAsync({
        customerId,
        items: lines.map((l) => ({
          productId: l.productId,
          quantity: l.quantity,
        })),
        discount: appliedDiscount,
        paymentMethod,
      });
      toast.success(`Sale complete — ${formatMoney(total)}`);
      clearCart();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <>
      <aside className="flex h-full min-h-0 w-full flex-col border-l border-slate-200 bg-slate-50 lg:w-[min(100%,22rem)] xl:w-96">
        <div className="shrink-0 border-b border-slate-200 bg-white px-4 py-3">
          <h2 className="text-base font-semibold text-slate-900">
            Current sale
            {itemCount > 0 && (
              <span className="ml-1.5 font-normal text-slate-500">
                ({itemCount})
              </span>
            )}
          </h2>
        </div>

        <div className="shrink-0 border-b border-slate-100 bg-white px-4 py-3">
          {customerName ? (
            <div className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <div className="flex min-w-0 items-center gap-2">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                  {customerName.charAt(0).toUpperCase()}
                </div>
                <span className="truncate text-sm font-medium text-slate-900">
                  {customerName}
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9 shrink-0"
                aria-label="Remove customer"
                onClick={() => setCustomer(null, null)}
              >
                <UserX className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              className="h-11 w-full justify-start gap-2 text-slate-600"
              onClick={() => setCustomerOpen(true)}
            >
              <User className="h-4 w-4" />
              Add customer (optional)
            </Button>
          )}
        </div>

        <ul className="min-h-0 flex-1 space-y-1 overflow-y-auto p-3">
          {lines.length === 0 && (
            <li className="py-8 text-center text-sm text-slate-500">
              Tap products to add them here
            </li>
          )}
          {lines.map((line) => (
            <li
              key={line.productId}
              className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-medium text-slate-900">{line.name}</p>
                  <p className="text-sm tabular-nums text-slate-600">
                    {formatMoney(line.sellPrice)} each
                  </p>
                </div>
                <p className="shrink-0 text-sm font-semibold tabular-nums text-slate-900">
                  {formatMoney(Number(line.sellPrice) * line.quantity)}
                </p>
              </div>
              <div className="mt-2 flex items-center justify-between gap-2">
                <div className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-none"
                    aria-label="Decrease quantity"
                    onClick={() =>
                      setQuantity(line.productId, line.quantity - 1)
                    }
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="min-w-[2rem] text-center text-sm font-semibold tabular-nums">
                    {line.quantity}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-none"
                    aria-label="Increase quantity"
                    disabled={line.quantity >= line.stockQuantity}
                    onClick={() =>
                      setQuantity(line.productId, line.quantity + 1)
                    }
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 text-slate-500 hover:text-red-600"
                  aria-label="Remove item"
                  onClick={() => removeLine(line.productId)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>

        <div className="shrink-0 space-y-3 border-t border-slate-200 bg-white p-4">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
            <div className="grid gap-1.5">
              <Label htmlFor="pos-discount" className="text-xs text-slate-600">
                Discount (ETB)
              </Label>
              <Input
                id="pos-discount"
                type="number"
                min={0}
                step="0.01"
                inputMode="decimal"
                className="h-10"
                value={discount || ""}
                onChange={(e) =>
                  setDiscount(e.target.value === "" ? 0 : Number(e.target.value))
                }
              />
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs text-slate-600">Payment</Label>
              <Select
                value={paymentMethod}
                onValueChange={(v) =>
                  setPaymentMethod(v as PaymentMethod)
                }
              >
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(PAYMENT_LABELS) as PaymentMethod[]).map(
                    (key) => (
                      <SelectItem key={key} value={key}>
                        {PAYMENT_LABELS[key]}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <dl className="space-y-1 text-sm">
            <div className="flex justify-between text-slate-600">
              <dt>Subtotal</dt>
              <dd className="tabular-nums">{formatMoney(subtotal)}</dd>
            </div>
            {appliedDiscount > 0 && (
              <div className="flex justify-between text-slate-600">
                <dt>Discount</dt>
                <dd className="tabular-nums text-emerald-700">
                  −{formatMoney(appliedDiscount)}
                </dd>
              </div>
            )}
            <div className="flex justify-between border-t border-slate-100 pt-2 text-base font-semibold text-slate-900">
              <dt>Total</dt>
              <dd className="tabular-nums">{formatMoney(total)}</dd>
            </div>
          </dl>

          <Button
            type="button"
            className={cn(
              "h-14 w-full text-base font-semibold shadow-md",
              lines.length === 0 && "opacity-60",
            )}
            disabled={lines.length === 0 || createSale.isPending}
            onClick={() => void onCharge()}
          >
            {createSale.isPending
              ? "Processing…"
              : `Charge ${formatMoney(total)}`}
          </Button>

          {lines.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              className="h-10 w-full text-slate-600"
              disabled={createSale.isPending}
              onClick={clearCart}
            >
              Clear sale
            </Button>
          )}
        </div>
      </aside>

      <PosCustomerPicker
        open={customerOpen}
        onOpenChange={setCustomerOpen}
        onSelect={(id, name) => {
          setCustomer(id, name);
          setCustomerOpen(false);
        }}
      />
    </>
  );
}
