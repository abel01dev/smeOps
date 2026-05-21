/** Read chart palette from CSS variables (supports light/dark). */
export function chartHsl(name: string): string {
  if (typeof window === "undefined") return `hsl(var(--${name}))`;
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(`--${name}`)
    .trim();
  return raw ? `hsl(${raw})` : `hsl(var(--${name}))`;
}
