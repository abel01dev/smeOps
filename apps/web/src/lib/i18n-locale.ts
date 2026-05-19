import type { AppLocale } from "@/stores/locale.store";

/** Default timezone for next-intl and date formatting (Ethiopia). */
export const APP_TIME_ZONE = "Africa/Addis_Ababa";

/** BCP 47 tags for Intl formatters (dates, numbers). */
export function intlLocale(locale: AppLocale): string {
  return locale === "am" ? "am-ET" : "en-ET";
}
