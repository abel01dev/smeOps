"use client";

import { useRouter } from "next/navigation";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuthStore } from "@/stores/auth.store";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isInitialized, logout } = useAuthStore();

  React.useEffect(() => {
    if (isInitialized && !user) router.replace("/login");
  }, [isInitialized, user, router]);

  if (!isInitialized) {
    return (
      <main className="grid min-h-screen place-items-center text-sm text-slate-500">
        Loading...
      </main>
    );
  }
  if (!user) return null;

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="container mx-auto flex h-14 items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-900 text-xs font-semibold text-white">
              SO
            </div>
            <span className="text-sm font-semibold tracking-tight text-slate-900">
              {user.organizationName}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              logout();
              router.replace("/login");
            }}
          >
            Sign out
          </Button>
        </div>
      </header>

      <div className="container mx-auto max-w-4xl px-6 py-12">
        <Card>
          <CardHeader>
            <CardTitle>You&apos;re signed in</CardTitle>
            <CardDescription>
              The dashboard, POS, and inventory pages are coming next (Days 5–9).
              For now, this page proves authentication is wired correctly.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-700">
            <div>
              <span className="text-slate-500">Name:</span> {user.name}
            </div>
            <div>
              <span className="text-slate-500">Email:</span> {user.email}
            </div>
            <div>
              <span className="text-slate-500">Role:</span> {user.role}
            </div>
            <div>
              <span className="text-slate-500">Organization ID:</span>{" "}
              <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">
                {user.organizationId}
              </code>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
