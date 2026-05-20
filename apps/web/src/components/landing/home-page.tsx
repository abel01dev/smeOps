"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import { Button } from "@/components/ui/button";

export function HomePage() {
  const t = useTranslations("landing");
  const tc = useTranslations("common");

  return (
    <main className="min-h-screen bg-gradient-to-b from-muted/50 to-background">
      <div className="container mx-auto flex min-h-screen max-w-5xl flex-col justify-between px-6 py-12">
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground">
              SO
            </div>
            <span className="text-base font-semibold tracking-tight text-foreground">
              {tc("appName")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeSwitcher />
            <nav className="hidden gap-6 text-sm font-medium text-muted-foreground md:flex">
              <Link href="#features" className="hover:text-foreground">
                {t("featuresNav")}
              </Link>
              <Link href="/login" className="hover:text-foreground">
                {t("signIn")}
              </Link>
            </nav>
          </div>
        </header>

        <section className="mx-auto max-w-3xl py-20 text-center">
          <span className="inline-flex items-center rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
            {t("badge")}
          </span>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
            {t("hero")}
          </h1>
          <p className="mt-5 text-balance text-base leading-relaxed text-muted-foreground md:text-lg">
            {t("heroSubtitle")}
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="h-11 px-6 shadow-sm">
              <Link href="/register">{t("cta")}</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-11 px-6 shadow-sm">
              <Link href="/login">{t("signIn")}</Link>
            </Button>
          </div>
        </section>

        <section id="features" className="grid gap-6 pb-16 md:grid-cols-3">
          <FeatureCard title={t("feature1Title")} description={t("feature1Desc")} />
          <FeatureCard title={t("feature2Title")} description={t("feature2Desc")} />
          <FeatureCard title={t("feature3Title")} description={t("feature3Desc")} />
        </section>

        <footer className="border-t border-border pt-6 text-center text-xs text-muted-foreground">
          {t("footer", { year: new Date().getFullYear() })}
        </footer>
      </div>
    </main>
  );
}

function FeatureCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  );
}
