/** Read chart palette from CSS variables (supports light/dark). */
export function chartHsl(name: string): string {
  if (name.includes(" ")) return `hsl(${name})`;
  if (typeof window === "undefined") return `hsl(var(--${name}))`;
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(`--${name}`)
    .trim();
  return raw ? `hsl(${raw})` : `hsl(var(--${name}))`;
}

export const CATEGORY_PIE_COLORS = [
  "chart-revenue",
  "chart-profit",
  "chart-slice-3",
  "chart-slice-4",
  "chart-slice-5",
  "chart-axis",
  "chart-cursor",
] as const;
