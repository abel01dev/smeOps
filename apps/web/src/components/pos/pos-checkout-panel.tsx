"use client";

import { formatMoney, type PaymentMethod } from "@sme/shared";
import { ChevronRight, User, UserX } from "lucide-react";
import { useTranslations } from "next-intl";
import * as React from "react";
import { toast } from "sonner";

import { PosCustomerPicker } from "@/components/pos/pos-customer-picker";
import { PosDiscountSheet } from "@/components/pos/pos-discount-sheet";
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
import { usePaymentLabels } from "@/hooks/use-payment-labels";
import {
  buildSaleCheckoutPayload,
  cartTotals,
  type PosCheckoutMode,
  usePosCartStore,
} from "@/stores/pos-cart.store";
import { cn } from "@/lib/utils";

const POS_PAYMENT_METHODS: PaymentMethod[] = ["CASH", "MOBILE_MONEY", "CARD"];

export function PosCheckoutPanel() {
  const t = useTranslations("pos");
  const tc = useTranslations("common");
  const paymentLabels = usePaymentLabels();

  const lines = usePosCartStore((s) => s.lines);
  const customerId = usePosCartStore((s) => s.customerId);
  const customerName = usePosCartStore((s) => s.customerName);
  const discount = usePosCartStore((s) => s.discount);
  const checkoutMode = usePosCartStore((s) => s.checkoutMode);
  const paymentMethod = usePosCartStore((s) => s.paymentMethod);
  const depositAmount = usePosCartStore((s) => s.depositAmount);
  const dueDate = usePosCartStore((s) => s.dueDate);
  const setDiscount = usePosCartStore((s) => s.setDiscount);
  const setCheckoutMode = usePosCartStore((s) => s.setCheckoutMode);
  const setPaymentMethod = usePosCartStore((s) => s.setPaymentMethod);
  const setDepositAmount = usePosCartStore((s) => s.setDepositAmount);
  const setDueDate = usePosCartStore((s) => s.setDueDate);
  const setCustomer = usePosCartStore((s) => s.setCustomer);
  const clearCart = usePosCartStore((s) => s.clearCart);

  const [customerOpen, setCustomerOpen] = React.useState(false);
  const [discountOpen, setDiscountOpen] = React.useState(false);
  const createSale = useCreateSale();

  const { subtotal, discount: appliedDiscount, total } = cartTotals(lines, discount);

  const needsCustomer =
    checkoutMode === "pay_later" || checkoutMode === "partial";
  const amountDuePreview =
    checkoutMode === "pay_later"
      ? total
      : checkoutMode === "partial"
        ? Math.max(0, total - depositAmount)
        : 0;

  const onCharge = async () => {
    if (lines.length === 0) {
      toast.error(t("addProductFirst"));
      return;
    }
    if (needsCustomer && !customerId) {
      toast.error(t("customerRequiredCredit"));
      setCustomerOpen(true);
      return;
    }
    if (checkoutMode === "partial") {
      if (depositAmount <= 0 || depositAmount >= total) {
        toast.error(t("depositInvalid"));
        return;
      }
    }

    const checkout = buildSaleCheckoutPayload(
      { checkoutMode, paymentMethod, depositAmount, dueDate },
      total,
    );

    try {
      await createSale.mutateAsync({
        customerId,
        items: lines.map((l) => ({
          productId: l.productId,
          quantity: l.quantity,
        })),
        discount: appliedDiscount,
        paymentStatus: checkout.paymentStatus,
        paymentMethod: checkout.paymentMethod,
        amountPaid: checkout.amountPaid,
        ...(checkout.dueDate
          ? { dueDate: new Date(checkout.dueDate) }
          : {}),
      });
      if (checkout.paymentStatus === "PAID") {
        toast.success(t("saleComplete", { amount: formatMoney(total) }));
      } else {
        toast.success(
          t("creditSaleComplete", {
            amount: formatMoney(total),
            due: formatMoney(amountDuePreview),
          }),
        );
      }
      clearCart();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const chargeLabel =
    checkoutMode === "pay_now"
      ? t("charge", { amount: formatMoney(total) })
      : checkoutMode === "pay_later"
        ? t("recordCreditSale", { amount: formatMoney(total) })
        : t("recordPartialSale", {
            paid: formatMoney(depositAmount),
            due: formatMoney(amountDuePreview),
          });

  return (
    <>
      <section className="flex h-full min-h-0 flex-col bg-card">
        <div className="shrink-0 border-b border-border px-4 py-3">
          <h2 className="text-base font-semibold text-foreground">
            {t("checkout")}
          </h2>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="border-b border-border p-4">
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
                  <ChevronRight
                    className="h-4 w-4 shrink-0 text-muted-foreground"
                    aria-hidden
                  />
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
                className={cn(
                  "h-11 w-full justify-start gap-2",
                  needsCustomer
                    ? "border-amber-500/60 text-amber-800 dark:text-amber-200"
                    : "text-muted-foreground",
                )}
                onClick={() => setCustomerOpen(true)}
              >
                <User className="h-4 w-4" />
                {needsCustomer ? t("addCustomerRequired") : t("addCustomer")}
              </Button>
            )}
          </div>

          <div className="space-y-3 p-4">
            <button
              type="button"
              onClick={() => setDiscountOpen(true)}
              className="flex w-full items-center justify-between gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2.5 text-left text-sm transition hover:bg-muted/60"
            >
              <span className="text-muted-foreground">{t("discountEtb")}</span>
              <span className="flex items-center gap-1 tabular-nums font-medium text-foreground">
                {discount > 0 ? formatMoney(discount) : "—"}
                <ChevronRight
                  className="h-4 w-4 text-muted-foreground"
                  aria-hidden
                />
              </span>
            </button>

            <div className="grid gap-1.5">
              <Label className="text-xs text-muted-foreground">
                {t("checkoutMode")}
              </Label>
              <Select
                value={checkoutMode}
                onValueChange={(v) => setCheckoutMode(v as PosCheckoutMode)}
              >
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pay_now">{t("payNow")}</SelectItem>
                  <SelectItem value="pay_later">{t("payLater")}</SelectItem>
                  <SelectItem value="partial">{t("partialPay")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {checkoutMode !== "pay_later" && (
              <div className="grid gap-1.5">
                <Label className="text-xs text-muted-foreground">
                  {tc("payment")}
                </Label>
                <Select
                  value={paymentMethod}
                  onValueChange={(v) =>
                    setPaymentMethod(v as typeof paymentMethod)
                  }
                >
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {POS_PAYMENT_METHODS.map((key) => (
                      <SelectItem key={key} value={key}>
                        {paymentLabels[key]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {checkoutMode === "partial" && (
              <div className="grid gap-1.5">
                <Label
                  htmlFor="deposit-amount"
                  className="text-xs text-muted-foreground"
                >
                  {t("depositAmount")}
                </Label>
                <Input
                  id="deposit-amount"
                  type="number"
                  min={0.01}
                  max={total}
                  step="0.01"
                  value={depositAmount || ""}
                  onChange={(e) => setDepositAmount(Number(e.target.value))}
                  className="h-10"
                />
              </div>
            )}

            {(checkoutMode === "pay_later" || checkoutMode === "partial") && (
              <div className="grid gap-1.5">
                <Label htmlFor="due-date" className="text-xs text-muted-foreground">
                  {t("dueDate")}
                </Label>
                <Input
                  id="due-date"
                  type="date"
                  value={dueDate ?? ""}
                  onChange={(e) => setDueDate(e.target.value || null)}
                  className="h-10"
                />
              </div>
            )}
          </div>
        </div>

        <div className="shrink-0 space-y-3 border-t border-border p-4">
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
            {amountDuePreview > 0 && (
              <div className="flex justify-between text-amber-800 dark:text-amber-200">
                <dt>{t("balanceDue")}</dt>
                <dd className="tabular-nums font-medium">
                  {formatMoney(amountDuePreview)}
                </dd>
              </div>
            )}
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
            {createSale.isPending ? tc("processing") : chargeLabel}
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
      </section>

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
