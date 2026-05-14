"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  type Category,
  createProductSchema,
  type CreateProductInput,
  formatMoney,
  type Product,
} from "@sme/shared";
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
        toast.success("Product updated");
      } else {
        await createMut.mutateAsync(values);
        toast.success("Product created");
      }
      onOpenChange(false);
    } catch (e) {
      toast.error((e as Error).message);
    }
  });

  const onArchive = async () => {
    if (!product) return;
    if (
      !window.confirm(
        "Archive this product? It will be hidden from POS but past sales stay intact.",
      )
    ) {
      return;
    }
    try {
      await archiveMut.mutateAsync(product.id);
      toast.success("Product archived");
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
          <DialogTitle>{isEdit ? "Edit product" : "Add product"}</DialogTitle>
          <DialogDescription>
            Prices are in ETB. Sell price must be at least the buy price.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="p-name">Name</Label>
            <Input
              id="p-name"
              autoComplete="off"
              className="h-11"
              placeholder="e.g. Coca Cola 500ml"
              {...form.register("name")}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="p-desc">Description (optional)</Label>
            <Textarea
              id="p-desc"
              rows={2}
              placeholder="Notes for staff…"
              {...form.register("description")}
            />
          </div>

          <div className="grid gap-2">
            <Label>Category</Label>
            <Select
              value={categoryId ?? NO_CATEGORY}
              onValueChange={(v) =>
                form.setValue("categoryId", v === NO_CATEGORY ? null : v, {
                  shouldDirty: true,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="No category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_CATEGORY}>No category</SelectItem>
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
              <Label htmlFor="p-buy">Buy price</Label>
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
              <Label htmlFor="p-sell">Sell price</Label>
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

          <ProfitHint margin={margin} marginPct={marginPct} />

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="p-stock">Stock quantity</Label>
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
              <Label htmlFor="p-min">Low-stock alert at</Label>
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
              <Label>Status</Label>
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
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="ARCHIVED">Archived</SelectItem>
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
                Archive
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              className="h-11"
              disabled={busy}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="h-11" disabled={busy}>
              {busy
                ? "Saving…"
                : isEdit
                  ? "Save changes"
                  : "Create product"}
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
}: {
  margin: number;
  marginPct: number | null;
}) {
  if (margin <= 0) {
    return (
      <p className="-mt-1 text-xs text-slate-500">
        Profit per unit appears here once both prices are set.
      </p>
    );
  }
  return (
    <p className="-mt-1 text-xs text-emerald-700">
      Profit per unit:{" "}
      <span className="font-medium">{formatMoney(margin)}</span>
      {marginPct != null && (
        <span className="text-slate-500"> · {marginPct.toFixed(0)}% margin</span>
      )}
    </p>
  );
}
