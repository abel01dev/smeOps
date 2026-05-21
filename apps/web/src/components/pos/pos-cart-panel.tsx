"use client";

import { formatMoney, type PaymentMethod } from "@sme/shared";
import { ChevronRight, Minus, Plus, Trash2, User, UserX } from "lucide-react";
import { useTranslations } from "next-intl";
import * as React from "react";
import { toast } from "sonner";

import { PosCustomerPicker } from "@/components/pos/pos-customer-picker";
import { PosDiscountSheet } from "@/components/pos/pos-discount-sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateSale } from "@/hooks/use-pos";
import { usePaymentLabels } from "@/hooks/use-payment-labels";
import {
  cartTotals,
  usePosCartStore,
} from "@/stores/pos-cart.store";
import { cn } from "@/lib/utils";

export function PosCartPanel() {
  const t = useTranslations("pos");
  const tc = useTranslations("common");
  const paymentLabels = usePaymentLabels();

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
  const [discountOpen, setDiscountOpen] = React.useState(false);
  const createSale = useCreateSale();

  const { subtotal, discount: appliedDiscount, total, itemCount } =
    cartTotals(lines, discount);

  const onCharge = async () => {
    if (lines.length === 0) {
      toast.error(t("addProductFirst"));
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
      toast.success(t("saleComplete", { amount: formatMoney(total) }));
      clearCart();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <>
      <aside className="flex h-full min-h-0 w-full flex-col border-l border-border bg-muted/50 lg:w-[min(100%,22rem)] xl:w-96">
        <div className="shrink-0 border-b border-border bg-card px-4 py-3">
          <h2 className="text-base font-semibold text-foreground">
            {t("currentSale")}
            {itemCount > 0 && (
              <span className="ml-1.5 font-normal text-muted-foreground">
                ({itemCount})
              </span>
            )}
          </h2>
        </div>

        <div className="shrink-0 border-b border-border bg-card px-4 py-3">
          {customerName ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="flex min-w-0 flex-1 items-center justify-between gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2 text-left transition hover:bg-muted/80"
                onClick={() => setCustomerOpen(true)}
              >
                <div className="flex min-w-0 items-center gap-2">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                    {customerName.charAt(0).toUpperCase()}
                  </div>
                  <span className="truncate text-sm font-medium text-foreground">
                    {customerName}
                  </span>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
              </button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9 shrink-0"
                aria-label={t("removeCustomer")}
                onClick={() => setCustomer(null, null)}
              >
                <UserX className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              className="h-11 w-full justify-start gap-2 text-muted-foreground"
              onClick={() => setCustomerOpen(true)}
            >
              <User className="h-4 w-4" />
              {t("addCustomer")}
            </Button>
          )}
        </div>

        <ul className="min-h-0 flex-1 space-y-1 overflow-y-auto p-3">
          {lines.length === 0 && (
            <li className="py-8 text-center text-sm text-muted-foreground">
              {t("tapToAdd")}
            </li>
          )}
          {lines.map((line) => (
            <li
              key={line.productId}
              className="rounded-lg border border-border bg-card p-3 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-medium text-foreground">{line.name}</p>
                  <p className="text-sm tabular-nums text-muted-foreground">
                    {formatMoney(line.sellPrice)} {tc("each")}
                  </p>
                </div>
                <p className="shrink-0 text-sm font-semibold tabular-nums text-foreground">
                  {formatMoney(Number(line.sellPrice) * line.quantity)}
                </p>
              </div>
              <div className="mt-2 flex items-center justify-between gap-2">
                <div className="inline-flex items-center rounded-lg border border-border bg-muted/50">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-none"
                    aria-label={t("decreaseQty")}
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
                    aria-label={t("increaseQty")}
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
                  className="h-10 w-10 text-muted-foreground hover:text-red-600"
                  aria-label={t("removeItem")}
                  onClick={() => removeLine(line.productId)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>

        <div className="shrink-0 space-y-3 border-t border-border bg-card p-4">
          <div className="grid gap-2">
            <button
              type="button"
              onClick={() => setDiscountOpen(true)}
              className="flex w-full items-center justify-between gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2.5 text-left text-sm transition hover:bg-muted/60"
            >
              <span className="text-muted-foreground">{t("discountEtb")}</span>
              <span className="flex items-center gap-1 tabular-nums font-medium text-foreground">
                {discount > 0 ? formatMoney(discount) : "—"}
                <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden />
              </span>
            </button>
            <div className="grid gap-1.5">
              <Label className="text-xs text-muted-foreground">{tc("payment")}</Label>
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

          <dl className="space-y-1 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <dt>{tc("subtotal")}</dt>
              <dd className="tabular-nums">{formatMoney(subtotal)}</dd>
            </div>
            {appliedDiscount > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <dt>{tc("discount")}</dt>
                <dd className="tabular-nums text-emerald-700 dark:text-emerald-400">
                  −{formatMoney(appliedDiscount)}
                </dd>
              </div>
            )}
            <div className="flex justify-between border-t border-border pt-2 text-base font-semibold text-foreground">
              <dt>{tc("total")}</dt>
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
              ? tc("processing")
              : t("charge", { amount: formatMoney(total) })}
          </Button>

          {lines.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              className="h-10 w-full text-muted-foreground"
              disabled={createSale.isPending}
              onClick={clearCart}
            >
              {t("clearSale")}
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
      <PosDiscountSheet
        open={discountOpen}
        onOpenChange={setDiscountOpen}
        value={discount}
        onApply={setDiscount}
      />
    </>
  );
}
