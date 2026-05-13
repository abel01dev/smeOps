import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function InventoryPlaceholderPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Inventory
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Product and category management UI ships on{" "}
          <span className="font-medium">Day 8</span>.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>API is ready</CardTitle>
          <CardDescription>
            Use Swagger at <code className="text-xs">/docs</code> to exercise{" "}
            <code className="text-xs">/products</code> and{" "}
            <code className="text-xs">/categories</code> until the UI lands.
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
