"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { type Category, createCategorySchema } from "@sme/shared";
import { Pencil, Plus, Tag, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("inventory");
  const tc = useTranslations("common");
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
      toast.success(t("categoryAdded"));
      addForm.reset({ name: "" });
    } catch (e) {
      toast.error((e as Error).message);
    }
  });

  const onRename = renameForm.handleSubmit(async ({ name }) => {
    if (!renameTarget) return;
    try {
      await updateMut.mutateAsync({ id: renameTarget.id, input: { name } });
      toast.success(t("categoryRenamed"));
      setRenameTarget(null);
    } catch (e) {
      toast.error((e as Error).message);
    }
  });

  const onDelete = async (c: Category) => {
    const ok = window.confirm(t("deleteCategoryConfirm", { name: c.name }));
    if (!ok) return;
    try {
      await deleteMut.mutateAsync(c.id);
      toast.success(t("categoryRemoved"));
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const busy =
    createMut.isPending || updateMut.isPending || deleteMut.isPending;
  const list = q.data ?? [];

  return (
    <>
      <Card className="border-border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Tag className="h-4 w-4 text-muted-foreground" />
            {t("categoriesTitle")}
          </CardTitle>
          <CardDescription>{t("categoriesDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={onAdd} className="flex flex-col gap-2 sm:flex-row">
            <div className="flex-1">
              <Label htmlFor="new-cat" className="sr-only">
                New category
              </Label>
              <Input
                id="new-cat"
                placeholder={t("newCategoryPlaceholder")}
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
              {tc("add")}
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
                {tc("retry")}
              </Button>
            </div>
          )}

          {!q.isLoading && !q.isError && list.length === 0 && (
            <p className="rounded-lg bg-muted/50 px-3 py-6 text-center text-sm text-muted-foreground">
              {t("noCategoriesHint")}
            </p>
          )}

          {!q.isLoading && !q.isError && list.length > 0 && (
            <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border">
              {list.map((c) => (
                <li
                  key={c.id}
                  className="flex items-center justify-between gap-2 px-3 py-2.5 hover:bg-muted/50"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">
                      {c.name}
                    </p>
                    {typeof c.productCount === "number" && (
                      <p className="text-xs text-muted-foreground">
                        {t("categoryProductCount", { count: c.productCount })}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-0.5">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-muted-foreground hover:text-foreground"
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
                      className="h-9 w-9 text-muted-foreground hover:text-red-600"
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
            <DialogTitle>{t("renameCategory")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={onRename} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="rename-cat">{t("categoryName")}</Label>
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
                {tc("cancel")}
              </Button>
              <Button type="submit" className="h-11" disabled={busy}>
                {updateMut.isPending ? tc("saving") : tc("save")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
