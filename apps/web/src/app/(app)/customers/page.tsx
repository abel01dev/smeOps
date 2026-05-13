import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function CustomersPlaceholderPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Customers
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Customer list, profile, and history UI ships on{" "}
          <span className="font-medium">Day 10</span>.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>API is ready</CardTitle>
          <CardDescription>
            Endpoints under <code className="text-xs">/customers</code> are live
            and tenant-scoped.
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
