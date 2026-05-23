"use client";

import { formatMoney } from "@sme/shared";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { cartTotals, usePosCartStore } from "@/stores/pos-cart.store";

export function PosCartLines() {
  const t = useTranslations("pos");
  const tc = useTranslations("common");

  const lines = usePosCartStore((s) => s.lines);
  const discount = usePosCartStore((s) => s.discount);
  const setQuantity = usePosCartStore((s) => s.setQuantity);
  const removeLine = usePosCartStore((s) => s.removeLine);

  const { itemCount } = cartTotals(lines, discount);

  return (
    <section className="flex h-full min-h-0 flex-col bg-muted/30">
      <div className="shrink-0 border-b border-border bg-card px-4 py-3">
        <h2 className="text-base font-semibold text-foreground">
          {t("cartItems")}
          {itemCount > 0 && (
            <span className="ml-1.5 font-normal text-muted-foreground">
              ({itemCount})
            </span>
          )}
        </h2>
      </div>

      <ul className="min-h-0 flex-1 space-y-1 overflow-y-auto p-3">
        {lines.length === 0 && (
          <li className="py-12 text-center text-sm text-muted-foreground">
            {t("tapToAdd")}
          </li>
        )}
        {lines.map((line) => (
          <li
            key={line.productId}
            className="rounded-lg border border-border bg-card p-3 shadow-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-medium text-foreground">{line.name}</p>
                <p className="text-sm tabular-nums text-muted-foreground">
                  {formatMoney(line.sellPrice)} {tc("each")}
                </p>
              </div>
              <p className="shrink-0 text-sm font-semibold tabular-nums text-foreground">
                {formatMoney(Number(line.sellPrice) * line.quantity)}
              </p>
            </div>
            <div className="mt-2 flex items-center justify-between gap-2">
              <div className="inline-flex items-center rounded-lg border border-border bg-muted/50">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-none"
                  aria-label={t("decreaseQty")}
                  onClick={() => setQuantity(line.productId, line.quantity - 1)}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="min-w-[2rem] text-center text-sm font-semibold tabular-nums">
                  {line.quantity}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-none"
                  aria-label={t("increaseQty")}
                  disabled={line.quantity >= line.stockQuantity}
                  onClick={() => setQuantity(line.productId, line.quantity + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-muted-foreground hover:text-red-600"
                aria-label={t("removeItem")}
                onClick={() => removeLine(line.productId)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
