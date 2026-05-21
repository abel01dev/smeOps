import type { AppLocale } from "@/stores/locale.store";

import am from "./am.json";
import en from "./en.json";

const catalogs = { en, am } as const;

type NestedMessages = Record<string, unknown>;

function getNested(obj: NestedMessages, path: string): string | undefined {
  const parts = path.split(".");
  let cur: unknown = obj;
  for (const p of parts) {
    if (cur == null || typeof cur !== "object") return undefined;
    cur = (cur as NestedMessages)[p];
  }
  return typeof cur === "string" ? cur : undefined;
}

function interpolate(
  template: string,
  vars?: Record<string, string | number>,
): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    String(vars[key] ?? `{${key}}`),
  );
}

export function createTranslator(locale: AppLocale) {
  const catalog = catalogs[locale] as NestedMessages;
  return function t(
    key: string,
    vars?: Record<string, string | number>,
  ): string {
    const value = getNested(catalog, key);
    if (!value) return key;
    return interpolate(value, vars);
  };
}

export type TranslateFn = ReturnType<typeof createTranslator>;
