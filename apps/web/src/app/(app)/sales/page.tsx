import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function SalesPlaceholderPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Sales
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          A searchable sales register with receipt-style detail ships on{" "}
          <span className="font-medium">Day 10</span> alongside richer customer
          views.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>API is ready</CardTitle>
          <CardDescription>
            <code className="text-xs">POST /sales</code> records checkout;{" "}
            <code className="text-xs">GET /sales</code> lists history with
            filters.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" asChild>
            <Link href="/dashboard">Back to dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
