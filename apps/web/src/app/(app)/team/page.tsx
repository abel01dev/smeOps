"use client";

import { EMPLOYEE_INVITE_ROLES, type EmployeeInviteRole } from "@sme/shared";
import { useTranslations } from "next-intl";
import * as React from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useCreateEmployee,
  useEmployees,
  useUpdateEmployeeRole,
} from "@/hooks/use-employees";
import { useAuthStore } from "@/stores/auth.store";

const ROLE_OPTIONS: EmployeeInviteRole[] = [...EMPLOYEE_INVITE_ROLES];

function roleMessageKey(
  role: "MANAGER" | "INVENTORY_MANAGER" | "CASHIER",
): "roleShopManager" | "roleInventoryManager" | "roleCashier" {
  if (role === "MANAGER") return "roleShopManager";
  if (role === "INVENTORY_MANAGER") return "roleInventoryManager";
  return "roleCashier";
}

export default function TeamPage() {
  const t = useTranslations("team");
  const tr = useTranslations("roles");
  const user = useAuthStore((s) => s.user);
  const listQ = useEmployees();
  const createMut = useCreateEmployee();
  const roleMut = useUpdateEmployeeRole();

  const [email, setEmail] = React.useState("");
  const [name, setName] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [role, setRole] = React.useState<EmployeeInviteRole>("CASHIER");

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMut.mutateAsync({ email, name, password, role });
      toast.success(t("createdToast"));
      setEmail("");
      setName("");
      setPassword("");
      setRole("CASHIER");
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const onRoleChange = async (employeeId: string, next: EmployeeInviteRole) => {
    try {
      await roleMut.mutateAsync({ id: employeeId, input: { role: next } });
      toast.success(t("roleUpdated"));
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          {t("title")}
        </h1>
        <p className="mt-1 text-sm text-slate-600">{t("subtitle")}</p>
      </header>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">{t("listTitle")}</CardTitle>
          <CardDescription>
            {listQ.isLoading ? "…" : String(listQ.data?.length ?? 0)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {listQ.isError && (
            <p className="text-sm text-red-600">{(listQ.error as Error).message}</p>
          )}
          {!listQ.isLoading && !listQ.isError && listQ.data?.length === 0 && (
            <p className="text-sm text-slate-500">{t("empty")}</p>
          )}
          {listQ.data && listQ.data.length > 0 && (
            <ul className="divide-y divide-slate-100 rounded-xl border border-slate-100">
              {listQ.data.map((row) => {
                const isSelf = row.id === user?.id;
                const isOwner = row.role === "OWNER";
                const canReassign = !isOwner && ROLE_OPTIONS.includes(row.role as EmployeeInviteRole);

                return (
                  <li
                    key={row.id}
                    className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900">
                        {row.name}
                        {isSelf && (
                          <span className="ml-2 text-xs font-normal text-slate-500">
                            ({t("you")})
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-slate-600">{row.email}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {row.role === "OWNER"
                          ? tr("owner")
                          : row.role === "MANAGER"
                            ? t("roleShopManager")
                            : row.role === "INVENTORY_MANAGER"
                              ? t("roleInventoryManager")
                              : t("roleCashier")}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      <Badge variant="secondary" className="font-normal">
                        {tr(row.role.toLowerCase() as "owner" | "manager" | "cashier" | "inventory_manager")}
                      </Badge>
                      {canReassign && (
                        <Select
                          value={row.role as EmployeeInviteRole}
                          disabled={roleMut.isPending}
                          onValueChange={(v) =>
                            void onRoleChange(row.id, v as EmployeeInviteRole)
                          }
                        >
                          <SelectTrigger className="h-10 w-[12rem]">
                            <SelectValue placeholder={t("changeRole")} />
                          </SelectTrigger>
                          <SelectContent>
                            {ROLE_OPTIONS.map((r) => (
                              <SelectItem key={r} value={r}>
                                {tr(
                                  r.toLowerCase() as
                                    | "manager"
                                    | "inventory_manager"
                                    | "cashier",
                                )}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">{t("addTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onCreate} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="emp-email">{t("email")}</Label>
                <Input
                  id="emp-email"
                  type="email"
                  autoComplete="off"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emp-name">{t("name")}</Label>
                <Input
                  id="emp-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  minLength={2}
                  className="h-11"
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>{t("role")}</Label>
                <Select
                  value={role}
                  onValueChange={(v) => setRole(v as EmployeeInviteRole)}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLE_OPTIONS.map((r) => (
                      <SelectItem key={r} value={r}>
                        {tr(
                          r.toLowerCase() as
                            | "manager"
                            | "inventory_manager"
                            | "cashier",
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500">
                  {t(roleMessageKey(role))}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="emp-pass">{t("password")}</Label>
                <Input
                  id="emp-pass"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="h-11"
                />
              </div>
            </div>
            <p className="text-xs text-slate-500">{t("passwordHint")}</p>
            <Button
              type="submit"
              className="h-11"
              disabled={createMut.isPending}
            >
              {createMut.isPending ? t("creating") : t("create")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
