"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuthStore } from "@/stores/auth.store";

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          KPI cards and charts ship on Day 7. You&apos;re on the authenticated
          shell (Day 6).
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>
            Signed in as <span className="font-medium">{user?.name}</span> at{" "}
            <span className="font-medium">{user?.organizationName}</span>.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-700">
          <div>
            <span className="text-slate-500">Email:</span> {user?.email}
          </div>
          <div>
            <span className="text-slate-500">Role:</span> {user?.role}
          </div>
          <div>
            <span className="text-slate-500">Organization ID:</span>{" "}
            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">
              {user?.organizationId}
            </code>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
