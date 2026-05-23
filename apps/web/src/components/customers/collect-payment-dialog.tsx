"use client";

import {
  COLLECT_PAYMENT_METHODS,
  formatMoney,
  type CollectPaymentMethod,
  type RecordSalePaymentInput,
} from "@sme/shared";
import { useTranslations } from "next-intl";
import * as React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePaymentLabels } from "@/hooks/use-payment-labels";
import { useRecordSalePayment } from "@/hooks/use-sales";

const COLLECT_METHODS = COLLECT_PAYMENT_METHODS;

export interface CollectPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  saleId: string;
  amountDue: string;
  customerName?: string;
}

export function CollectPaymentDialog({
  open,
  onOpenChange,
  saleId,
  amountDue,
  customerName,
}: CollectPaymentDialogProps) {
  const t = useTranslations("customers");
  const tc = useTranslations("common");
  const paymentLabels = usePaymentLabels();
  const recordPayment = useRecordSalePayment();

  const maxDue = Number(amountDue);
  const [amount, setAmount] = React.useState(maxDue);
  const [method, setMethod] = React.useState<CollectPaymentMethod>("CASH");
  const [note, setNote] = React.useState("");

  React.useEffect(() => {
    if (open) {
      setAmount(maxDue);
      setMethod("CASH");
      setNote("");
    }
  }, [open, maxDue]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0 || amount > maxDue) {
      toast.error(t("paymentAmountInvalid"));
      return;
    }
    const input: RecordSalePaymentInput = {
      amount,
      paymentMethod: method,
      note: note.trim() || null,
    };
    try {
      await recordPayment.mutateAsync({ saleId, input });
      toast.success(t("paymentRecorded"));
      onOpenChange(false);
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={(e) => void onSubmit(e)}>
          <DialogHeader>
            <DialogTitle>{t("collectPayment")}</DialogTitle>
            {customerName && (
              <p className="text-sm text-muted-foreground">{customerName}</p>
            )}
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <p className="text-sm text-muted-foreground">
              {t("balanceDue")}:{" "}
              <span className="font-semibold tabular-nums text-foreground">
                {formatMoney(amountDue)}
              </span>
            </p>

            <div className="grid gap-1.5">
              <Label htmlFor="payment-amount">{t("paymentAmount")}</Label>
              <Input
                id="payment-amount"
                type="number"
                min={0.01}
                max={maxDue}
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
              />
            </div>

            <div className="grid gap-1.5">
              <Label>{tc("payment")}</Label>
              <Select
                value={method}
                onValueChange={(v) => setMethod(v as CollectPaymentMethod)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COLLECT_METHODS.map((key) => (
                    <SelectItem key={key} value={key}>
                      {paymentLabels[key]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="payment-note">{t("paymentNote")}</Label>
              <Input
                id="payment-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={300}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {tc("cancel")}
            </Button>
            <Button type="submit" disabled={recordPayment.isPending}>
              {recordPayment.isPending ? tc("processing") : t("recordPayment")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
