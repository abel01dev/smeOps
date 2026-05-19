"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  createCustomerSchema,
  type CreateCustomerInput,
  type Customer,
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
import { Textarea } from "@/components/ui/textarea";
import { useCreateCustomer, useUpdateCustomer } from "@/hooks/use-customers";

const EMPTY: CreateCustomerInput = {
  name: "",
  phone: "",
  address: "",
};

export interface CustomerFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer?: Customer | null;
}

export function CustomerFormDialog({
  open,
  onOpenChange,
  customer,
}: CustomerFormDialogProps) {
  const isEdit = !!customer;
  const createMut = useCreateCustomer();
  const updateMut = useUpdateCustomer();

  const form = useForm<CreateCustomerInput>({
    resolver: zodResolver(createCustomerSchema),
    defaultValues: EMPTY,
  });

  React.useEffect(() => {
    if (!open) return;
    if (customer) {
      form.reset({
        name: customer.name,
        phone: customer.phone ?? "",
        address: customer.address ?? "",
      });
    } else {
      form.reset(EMPTY);
    }
  }, [open, customer, form]);

  const busy = createMut.isPending || updateMut.isPending;
  const errors = form.formState.errors;

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      if (customer) {
        await updateMut.mutateAsync({ id: customer.id, input: values });
        toast.success("Customer updated");
      } else {
        await createMut.mutateAsync(values);
        toast.success("Customer added");
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
          <DialogTitle>{isEdit ? "Edit customer" : "Add customer"}</DialogTitle>
          <DialogDescription>
            Track name, phone, and address for repeat buyers and POS checkout.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="c-name">Name</Label>
            <Input id="c-name" className="h-11" {...form.register("name")} />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="c-phone">Phone (optional)</Label>
            <Input
              id="c-phone"
              className="h-11"
              inputMode="tel"
              {...form.register("phone")}
            />
            {errors.phone && (
              <p className="text-sm text-red-600">
                {errors.phone.message as string}
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="c-address">Address (optional)</Label>
            <Textarea
              id="c-address"
              rows={2}
              {...form.register("address")}
            />
          </div>
          <DialogFooter className="gap-2">
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
              {busy ? "Saving…" : isEdit ? "Save" : "Add customer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
