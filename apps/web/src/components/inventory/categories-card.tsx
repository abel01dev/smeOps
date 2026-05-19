"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { type Category, createCategorySchema } from "@sme/shared";
import { Pencil, Plus, Tag, Trash2 } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from "@/hooks/use-inventory";

type CategoryFormValues = { name: string };

export function CategoriesCard() {
  const q = useCategories();
  const createMut = useCreateCategory();
  const updateMut = useUpdateCategory();
  const deleteMut = useDeleteCategory();

  const [renameTarget, setRenameTarget] = React.useState<Category | null>(null);

  const addForm = useForm<CategoryFormValues>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: { name: "" },
  });

  const renameForm = useForm<CategoryFormValues>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: { name: "" },
  });

  React.useEffect(() => {
    if (renameTarget) renameForm.reset({ name: renameTarget.name });
  }, [renameTarget, renameForm]);

  const onAdd = addForm.handleSubmit(async ({ name }) => {
    try {
      await createMut.mutateAsync({ name });
      toast.success("Category added");
      addForm.reset({ name: "" });
    } catch (e) {
      toast.error((e as Error).message);
    }
  });

  const onRename = renameForm.handleSubmit(async ({ name }) => {
    if (!renameTarget) return;
    try {
      await updateMut.mutateAsync({ id: renameTarget.id, input: { name } });
      toast.success("Category renamed");
      setRenameTarget(null);
    } catch (e) {
      toast.error((e as Error).message);
    }
  });

  const onDelete = async (c: Category) => {
    const ok = window.confirm(
      `Delete "${c.name}"? Products in this category will lose their category link.`,
    );
    if (!ok) return;
    try {
      await deleteMut.mutateAsync(c.id);
      toast.success("Category removed");
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const busy =
    createMut.isPending || updateMut.isPending || deleteMut.isPending;
  const list = q.data ?? [];

  return (
    <>
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Tag className="h-4 w-4 text-slate-500" />
            Categories
          </CardTitle>
          <CardDescription>
            Group products for faster filtering in inventory and POS.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={onAdd} className="flex flex-col gap-2 sm:flex-row">
            <div className="flex-1">
              <Label htmlFor="new-cat" className="sr-only">
                New category
              </Label>
              <Input
                id="new-cat"
                placeholder="New category…"
                className="h-11"
                disabled={busy}
                {...addForm.register("name")}
              />
              {addForm.formState.errors.name && (
                <p className="mt-1 text-sm text-red-600">
                  {addForm.formState.errors.name.message}
                </p>
              )}
            </div>
            <Button
              type="submit"
              className="h-11 shrink-0 gap-2 sm:w-auto"
              disabled={busy}
            >
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </form>

          {q.isLoading && (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full rounded-lg" />
              <Skeleton className="h-12 w-full rounded-lg" />
              <Skeleton className="h-12 w-full rounded-lg" />
            </div>
          )}

          {q.isError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {(q.error as Error).message}
              <Button
                type="button"
                variant="link"
                className="ml-2 h-auto p-0 text-red-700"
                onClick={() => void q.refetch()}
              >
                Retry
              </Button>
            </div>
          )}

          {!q.isLoading && !q.isError && list.length === 0 && (
            <p className="rounded-lg bg-slate-50 px-3 py-6 text-center text-sm text-slate-500">
              No categories yet — add one above.
            </p>
          )}

          {!q.isLoading && !q.isError && list.length > 0 && (
            <ul className="divide-y divide-slate-100 overflow-hidden rounded-lg border border-slate-100">
              {list.map((c) => (
                <li
                  key={c.id}
                  className="flex items-center justify-between gap-2 px-3 py-2.5 hover:bg-slate-50/70"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-900">
                      {c.name}
                    </p>
                    {typeof c.productCount === "number" && (
                      <p className="text-xs text-slate-500">
                        {c.productCount} product
                        {c.productCount === 1 ? "" : "s"}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-0.5">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-slate-500 hover:text-slate-900"
                      aria-label={`Rename ${c.name}`}
                      disabled={busy}
                      onClick={() => setRenameTarget(c)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-slate-500 hover:text-red-600"
                      aria-label={`Delete ${c.name}`}
                      disabled={busy}
                      onClick={() => void onDelete(c)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={!!renameTarget}
        onOpenChange={(o) => !o && setRenameTarget(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rename category</DialogTitle>
          </DialogHeader>
          <form onSubmit={onRename} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="rename-cat">Name</Label>
              <Input
                id="rename-cat"
                className="h-11"
                disabled={busy}
                autoFocus
                {...renameForm.register("name")}
              />
              {renameForm.formState.errors.name && (
                <p className="text-sm text-red-600">
                  {renameForm.formState.errors.name.message}
                </p>
              )}
            </div>
            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                className="h-11"
                disabled={busy}
                onClick={() => setRenameTarget(null)}
              >
                Cancel
              </Button>
              <Button type="submit" className="h-11" disabled={busy}>
                {updateMut.isPending ? "Saving…" : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
