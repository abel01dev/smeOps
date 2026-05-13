"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  createProductSchema,
  type Category,
  type CreateProductInput,
  type Product,
  updateProductSchema,
  type UpdateProductInput,
} from "@sme/shared";
import * as React from "react";
import { Controller, useForm } from "react-hook-form";
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

const NONE = "__none__";

export interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  product?: Product | null;
  categories: Category[];
}

export function ProductFormDialog({
  open,
  onOpenChange,
  mode,
  product,
  categories,
}: ProductFormDialogProps) {
  const createMut = useCreateProduct();
  const updateMut = useUpdateProduct();
  const archiveMut = useArchiveProduct();

  const createForm = useForm<CreateProductInput>({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      name: "",
      description: "",
      categoryId: null,
      buyPrice: 0,
      sellPrice: 0,
      stockQuantity: 0,
      minStock: 0,
      status: "ACTIVE",
    },
  });

  const editForm = useForm<UpdateProductInput>({
    resolver: zodResolver(updateProductSchema),
    defaultValues: {},
  });

  React.useEffect(() => {
    if (!open) return;
    if (mode === "create") {
      createForm.reset({
        name: "",
        description: "",
        categoryId: null,
        buyPrice: 0,
        sellPrice: 0,
        stockQuantity: 0,
        minStock: 0,
        status: "ACTIVE",
      });
      return;
    }
    if (product) {
      editForm.reset({
        name: product.name,
        description: product.description ?? "",
        categoryId: product.categoryId,
        buyPrice: Number(product.buyPrice),
        sellPrice: Number(product.sellPrice),
        stockQuantity: product.stockQuantity,
        minStock: product.minStock,
        status: product.status,
      });
    }
  }, [open, mode, product, createForm, editForm]);

  const busy =
    createMut.isPending || updateMut.isPending || archiveMut.isPending;

  const onCreateSubmit = createForm.handleSubmit(async (values) => {
    try {
      await createMut.mutateAsync(values);
      toast.success("Product created");
      onOpenChange(false);
    } catch (e) {
      toast.error((e as Error).message);
    }
  });

  const onEditSubmit = editForm.handleSubmit(async (values) => {
    if (!product) return;
    try {
      await updateMut.mutateAsync({ id: product.id, input: values });
      toast.success("Product updated");
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

  const isCreate = mode === "create";
  const errors = isCreate
    ? createForm.formState.errors
    : editForm.formState.errors;

  const categorySelect = (
    <Select
      value={
        (isCreate
          ? createForm.watch("categoryId")
          : editForm.watch("categoryId")) ?? NONE
      }
      onValueChange={(v) => {
        const next = v === NONE ? null : v;
        if (isCreate) createForm.setValue("categoryId", next);
        else editForm.setValue("categoryId", next);
      }}
    >
      <SelectTrigger className="min-h-11">
        <SelectValue placeholder="No category" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={NONE}>No category</SelectItem>
        {categories.map((c) => (
          <SelectItem key={c.id} value={c.id}>
            {c.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[min(90vh,720px)] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isCreate ? "Add product" : "Edit product"}
          </DialogTitle>
          <DialogDescription>
            {isCreate
              ? "Prices are in ETB. Sell price must be at least the buy price."
              : "Update details or archive when the item is discontinued."}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={isCreate ? onCreateSubmit : onEditSubmit}
          className="grid gap-4"
        >
          <div className="grid gap-2">
            <Label htmlFor="inv-name">Name</Label>
            <Input
              id="inv-name"
              {...(isCreate ? createForm.register("name") : editForm.register("name"))}
              autoComplete="off"
              className="min-h-11"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="inv-desc">Description (optional)</Label>
            <Textarea
              id="inv-desc"
              {...(isCreate
                ? createForm.register("description")
                : editForm.register("description"))}
              rows={3}
              placeholder="Notes for staff…"
            />
            {errors.description && (
              <p className="text-sm text-destructive">
                {errors.description.message as string}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label>Category</Label>
            {categorySelect}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="inv-buy">Buy price (ETB)</Label>
              <Input
                id="inv-buy"
                type="number"
                step="0.01"
                min={0}
                {...(isCreate
                  ? createForm.register("buyPrice")
                  : editForm.register("buyPrice"))}
                className="min-h-11"
              />
              {errors.buyPrice && (
                <p className="text-sm text-destructive">
                  {errors.buyPrice.message as string}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="inv-sell">Sell price (ETB)</Label>
              <Input
                id="inv-sell"
                type="number"
                step="0.01"
                min={0}
                {...(isCreate
                  ? createForm.register("sellPrice")
                  : editForm.register("sellPrice"))}
                className="min-h-11"
              />
              {errors.sellPrice && (
                <p className="text-sm text-destructive">
                  {errors.sellPrice.message as string}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="inv-stock">Stock quantity</Label>
              <Input
                id="inv-stock"
                type="number"
                min={0}
                step={1}
                {...(isCreate
                  ? createForm.register("stockQuantity")
                  : editForm.register("stockQuantity"))}
                className="min-h-11"
              />
              {errors.stockQuantity && (
                <p className="text-sm text-destructive">
                  {errors.stockQuantity.message as string}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="inv-min">Minimum stock alert</Label>
              <Input
                id="inv-min"
                type="number"
                min={0}
                step={1}
                {...(isCreate
                  ? createForm.register("minStock")
                  : editForm.register("minStock"))}
                className="min-h-11"
              />
              {errors.minStock && (
                <p className="text-sm text-destructive">
                  {errors.minStock.message as string}
                </p>
              )}
            </div>
          </div>

          {!isCreate && (
            <div className="grid gap-2">
              <Label>Status</Label>
              <Controller
                control={editForm.control}
                name="status"
                render={({ field }) => (
                  <Select
                    value={field.value ?? "ACTIVE"}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className="min-h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="ARCHIVED">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            {!isCreate && product?.status === "ACTIVE" && (
              <Button
                type="button"
                variant="destructive"
                className="min-h-11 sm:mr-auto"
                disabled={busy}
                onClick={() => void onArchive()}
              >
                Archive
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              className="min-h-11"
              disabled={busy}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="min-h-11" disabled={busy}>
              {busy ? "Saving…" : isCreate ? "Create" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
