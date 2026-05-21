"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  createOperationalExpenseSchema,
  type CreateOperationalExpenseInput,
  type OperationalExpense,
} from "@sme/shared";
import { useTranslations } from "next-intl";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateExpense,
  useExpenseCategories,
  useUpdateExpense,
} from "@/hooks/use-expenses";

function todayYmd(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

const EMPTY: CreateOperationalExpenseInput = {
  categoryId: "",
  amount: "",
  description: "",
  expenseDate: todayYmd(),
  paymentMethod: "CASH",
  note: "",
};

export interface ExpenseFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense?: OperationalExpense | null;
}

export function ExpenseFormDialog({
  open,
  onOpenChange,
  expense,
}: ExpenseFormDialogProps) {
  const t = useTranslations("expenses");
  const tp = useTranslations("payments");
  const tc = useTranslations("common");
  const isEdit = !!expense;
  const createMut = useCreateExpense();
  const updateMut = useUpdateExpense();
  const categories = useExpenseCategories(open);

  const form = useForm<CreateOperationalExpenseInput>({
    resolver: zodResolver(createOperationalExpenseSchema),
    defaultValues: EMPTY,
  });

  const categoryList = categories.data ?? [];

  React.useEffect(() => {
    if (!open) return;
    if (expense) {
      form.reset({
        categoryId: expense.categoryId,
        amount: expense.amount,
        description: expense.description ?? "",
        expenseDate: expense.expenseDate,
        paymentMethod: expense.paymentMethod,
        note: expense.note ?? "",
      });
      return;
    }
    form.reset({ ...EMPTY, expenseDate: todayYmd() });
  }, [open, expense, form]);

  React.useEffect(() => {
    if (!open || expense || categoryList.length === 0) return;
    const current = form.getValues("categoryId");
    const valid =
      current && categoryList.some((c) => c.id === current);
    if (!valid) {
      form.setValue("categoryId", categoryList[0].id, {
        shouldDirty: false,
        shouldValidate: true,
      });
    }
  }, [open, expense, categoryList, form]);

  const busy = createMut.isPending || updateMut.isPending;
  const errors = form.formState.errors;
  const paymentMethod = form.watch("paymentMethod");
  const categoryId = form.watch("categoryId");
  const selectedCategoryId =
    categoryId && categoryList.some((c) => c.id === categoryId)
      ? categoryId
      : undefined;

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      if (expense) {
        await updateMut.mutateAsync({ id: expense.id, input: values });
        toast.success(t("updated"));
      } else {
        await createMut.mutateAsync(values);
        toast.success(t("added"));
      }
      onOpenChange(false);
    } catch (e) {
      toast.error((e as Error).message);
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? t("dialogEdit") : t("dialogAdd")}</DialogTitle>
          <DialogDescription>{t("subtitle")}</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label>{t("category")}</Label>
            <Select
              modal={false}
              value={selectedCategoryId}
              onValueChange={(v) =>
                form.setValue("categoryId", v, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
              disabled={
                categories.isLoading ||
                categories.isError ||
                categoryList.length === 0
              }
            >
              <SelectTrigger className="h-11">
                <SelectValue
                  placeholder={
                    categories.isLoading
                      ? tc("loading")
                      : categories.isError
                        ? t("categoriesLoadError")
                        : categoryList.length === 0
                          ? t("noCategories")
                          : t("categoryPlaceholder")
                  }
                />
              </SelectTrigger>
              <SelectContent position="popper" className="z-[200]">
                {categoryList.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {categories.isError && (
              <p className="text-sm text-red-600">{t("categoriesLoadError")}</p>
            )}
            {errors.categoryId && (
              <p className="text-sm text-red-600">{errors.categoryId.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="ex-amount">{t("amount")}</Label>
            <Input
              id="ex-amount"
              className="h-11"
              inputMode="decimal"
              {...form.register("amount")}
            />
            {errors.amount && (
              <p className="text-sm text-red-600">{errors.amount.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="ex-date">{t("expenseDate")}</Label>
            <Input
              id="ex-date"
              type="date"
              className="h-11"
              {...form.register("expenseDate")}
            />
            {errors.expenseDate && (
              <p className="text-sm text-red-600">
                {errors.expenseDate.message}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label>{t("paymentMethod")}</Label>
            <Select
              modal={false}
              value={paymentMethod}
              onValueChange={(v) =>
                form.setValue(
                  "paymentMethod",
                  v as CreateOperationalExpenseInput["paymentMethod"],
                )
              }
            >
              <SelectTrigger className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" className="z-[200]">
                <SelectItem value="CASH">{tp("CASH")}</SelectItem>
                <SelectItem value="MOBILE_MONEY">{tp("MOBILE_MONEY")}</SelectItem>
                <SelectItem value="CARD">{tp("CARD")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="ex-desc">{t("description")}</Label>
            <Input
              id="ex-desc"
              className="h-11"
              placeholder={t("descriptionPlaceholder")}
              {...form.register("description")}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="ex-note">{t("note")}</Label>
            <Textarea id="ex-note" rows={2} {...form.register("note")} />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {tc("cancel")}
            </Button>
            <Button type="submit" disabled={busy}>
              {busy ? tc("saving") : isEdit ? tc("save") : t("recordExpense")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
