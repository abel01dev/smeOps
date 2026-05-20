"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  type Category,
  createProductSchema,
  type CreateProductInput,
  formatMoney,
  type Product,
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
  useArchiveProduct,
  useCreateProduct,
  useUpdateProduct,
} from "@/hooks/use-inventory";

const NO_CATEGORY = "__none__";

const EMPTY_VALUES: CreateProductInput = {
  name: "",
  description: "",
  categoryId: null,
  buyPrice: 0,
  sellPrice: 0,
  stockQuantity: 0,
  minStock: 0,
  status: "ACTIVE",
};

export interface ProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
  categories: Category[];
}

/**
 * Single dialog used for both create and edit. We always validate against the
 * full `createProductSchema` — for edit, the server's `updateProductSchema` is
 * `.partial()` so accepting the full payload is safe and the UX is simpler.
 */
export function ProductDialog({
  open,
  onOpenChange,
  product,
  categories,
}: ProductDialogProps) {
  const t = useTranslations("inventory");
  const tc = useTranslations("common");
  const isEdit = !!product;

  const createMut = useCreateProduct();
  const updateMut = useUpdateProduct();
  const archiveMut = useArchiveProduct();

  const form = useForm<CreateProductInput>({
    resolver: zodResolver(createProductSchema),
    defaultValues: EMPTY_VALUES,
  });

  React.useEffect(() => {
    if (!open) return;
    if (product) {
      form.reset({
        name: product.name,
        description: product.description ?? "",
        categoryId: product.categoryId,
        buyPrice: Number(product.buyPrice),
        sellPrice: Number(product.sellPrice),
        stockQuantity: product.stockQuantity,
        minStock: product.minStock,
        status: product.status,
      });
    } else {
      form.reset(EMPTY_VALUES);
    }
  }, [open, product, form]);

  const buyPrice = Number(form.watch("buyPrice")) || 0;
  const sellPrice = Number(form.watch("sellPrice")) || 0;
  const margin = sellPrice - buyPrice;
  const marginPct = buyPrice > 0 ? (margin / buyPrice) * 100 : null;

  const categoryId = form.watch("categoryId");
  const status = form.watch("status");

  const busy =
    createMut.isPending || updateMut.isPending || archiveMut.isPending;

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      if (product) {
        await updateMut.mutateAsync({ id: product.id, input: values });
        toast.success(t("productSaved"));
      } else {
        await createMut.mutateAsync(values);
        toast.success(t("productCreated"));
      }
      onOpenChange(false);
    } catch (e) {
      toast.error((e as Error).message);
    }
  });

  const onArchive = async () => {
    if (!product) return;
    if (
      !window.confirm(t("archiveConfirm"))
    ) {
      return;
    }
    try {
      await archiveMut.mutateAsync(product.id);
      toast.success(t("productArchived"));
      onOpenChange(false);
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const errors = form.formState.errors;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[min(90vh,760px)] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? t("dialogEdit") : t("dialogCreate")}</DialogTitle>
          <DialogDescription>{t("dialogDesc")}</DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="p-name">{t("productName")}</Label>
            <Input
              id="p-name"
              autoComplete="off"
              className="h-11"
              placeholder={t("productNamePlaceholder")}
              {...form.register("name")}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="p-desc">
              {t("description")} ({tc("optional")})
            </Label>
            <Textarea
              id="p-desc"
              rows={2}
              placeholder={t("descriptionPlaceholder")}
              {...form.register("description")}
            />
          </div>

          <div className="grid gap-2">
            <Label>{tc("category")}</Label>
            <Select
              value={categoryId ?? NO_CATEGORY}
              onValueChange={(v) =>
                form.setValue("categoryId", v === NO_CATEGORY ? null : v, {
                  shouldDirty: true,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder={tc("noCategory")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_CATEGORY}>{tc("noCategory")}</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="p-buy">{t("buyPrice")}</Label>
              <Input
                id="p-buy"
                type="number"
                step="0.01"
                min={0}
                inputMode="decimal"
                className="h-11"
                {...form.register("buyPrice")}
              />
              {errors.buyPrice && (
                <p className="text-sm text-red-600">
                  {errors.buyPrice.message as string}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="p-sell">{t("sellPrice")}</Label>
              <Input
                id="p-sell"
                type="number"
                step="0.01"
                min={0}
                inputMode="decimal"
                className="h-11"
                {...form.register("sellPrice")}
              />
              {errors.sellPrice && (
                <p className="text-sm text-red-600">
                  {errors.sellPrice.message as string}
                </p>
              )}
            </div>
          </div>

          <ProfitHint margin={margin} marginPct={marginPct} t={t} />

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="p-stock">{t("stockQty")}</Label>
              <Input
                id="p-stock"
                type="number"
                min={0}
                step={1}
                inputMode="numeric"
                className="h-11"
                {...form.register("stockQuantity")}
              />
              {errors.stockQuantity && (
                <p className="text-sm text-red-600">
                  {errors.stockQuantity.message as string}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="p-min">{t("minStockAlert")}</Label>
              <Input
                id="p-min"
                type="number"
                min={0}
                step={1}
                inputMode="numeric"
                className="h-11"
                {...form.register("minStock")}
              />
              {errors.minStock && (
                <p className="text-sm text-red-600">
                  {errors.minStock.message as string}
                </p>
              )}
            </div>
          </div>

          {isEdit && (
            <div className="grid gap-2">
              <Label>{tc("status")}</Label>
              <Select
                value={status}
                onValueChange={(v) =>
                  form.setValue("status", v as "ACTIVE" | "ARCHIVED", {
                    shouldDirty: true,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">{t("statusActive")}</SelectItem>
                  <SelectItem value="ARCHIVED">{t("statusArchived")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-2">
            {isEdit && product?.status === "ACTIVE" && (
              <Button
                type="button"
                variant="destructive"
                className="h-11 sm:mr-auto"
                disabled={busy}
                onClick={() => void onArchive()}
              >
                {t("archive")}
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              className="h-11"
              disabled={busy}
              onClick={() => onOpenChange(false)}
            >
              {tc("cancel")}
            </Button>
            <Button type="submit" className="h-11" disabled={busy}>
              {busy ? tc("saving") : isEdit ? tc("save") : t("dialogCreate")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ProfitHint({
  margin,
  marginPct,
  t,
}: {
  margin: number;
  marginPct: number | null;
  t: (key: string, values?: Record<string, string | number>) => string;
}) {
  if (margin <= 0) {
    return (
      <p className="-mt-1 text-xs text-muted-foreground">{t("profitHintEmpty")}</p>
    );
  }
  return (
    <p className="-mt-1 text-xs text-emerald-700">
      {t("profitHint", { amount: formatMoney(margin) })}
      {marginPct != null && (
        <span className="text-muted-foreground">
          {t("profitMargin", { percent: marginPct.toFixed(0) })}
        </span>
      )}
    </p>
  );
}
