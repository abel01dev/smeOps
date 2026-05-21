import type { LucideIcon } from "lucide-react";
import * as React from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  icon?: LucideIcon;
  tone?: "default" | "success" | "warning" | "danger";
  isLoading?: boolean;
}

const TONE: Record<NonNullable<KpiCardProps["tone"]>, string> = {
  default: "bg-muted text-foreground",
  success: "bg-emerald-100 text-emerald-700",
  warning: "bg-amber-100 text-amber-700",
  danger: "bg-red-100 text-red-700",
};

export function KpiCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "default",
  isLoading = false,
}: KpiCardProps) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-4 p-5">
        <div className="min-w-0 flex-1 space-y-1.5">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          {isLoading ? (
            <Skeleton className="h-7 w-28" />
          ) : (
            <p className="truncate text-2xl font-semibold tracking-tight text-foreground">
              {value}
            </p>
          )}
          {hint ? (
            isLoading ? (
              <Skeleton className="h-3.5 w-20" />
            ) : (
              <p className="text-xs text-muted-foreground">{hint}</p>
            )
          ) : null}
        </div>
        {Icon ? (
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
              TONE[tone],
            )}
            aria-hidden
          >
            <Icon className="h-5 w-5" />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
