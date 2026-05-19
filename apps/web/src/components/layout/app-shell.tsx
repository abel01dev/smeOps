"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import * as React from "react";

import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { navForRole } from "@/config/nav";
import {
  canAccessRoute,
  DEFAULT_ROUTE_BY_ROLE,
  roleLabelKey,
} from "@/lib/roles";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth.store";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, X } from "lucide-react";

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations();
  const { user, isInitialized, logout } = useAuthStore();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const navItems = React.useMemo(
    () => (user ? navForRole(user.role) : []),
    [user],
  );

  React.useEffect(() => {
    if (isInitialized && !user) router.replace("/login");
  }, [isInitialized, user, router]);

  React.useEffect(() => {
    if (!user) return;
    if (!canAccessRoute(user.role, pathname)) {
      router.replace(DEFAULT_ROUTE_BY_ROLE[user.role]);
    }
  }, [user, pathname, router]);

  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  if (!isInitialized) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50 text-sm text-slate-500">
        {t("common.loading")}
      </div>
    );
  }
  if (!user) return null;

  if (!canAccessRoute(user.role, pathname)) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50 p-6">
        <div className="max-w-sm text-center">
          <h1 className="text-lg font-semibold text-slate-900">
            {t("access.deniedTitle")}
          </h1>
          <p className="mt-2 text-sm text-slate-600">{t("access.deniedMessage")}</p>
          <Button
            type="button"
            className="mt-4"
            onClick={() => router.replace(DEFAULT_ROUTE_BY_ROLE[user.role])}
          >
            {user.role === "CASHIER"
              ? t("access.goToPos")
              : t("nav.dashboard")}
          </Button>
        </div>
      </div>
    );
  }

  const NavLinks = ({ onNavigate }: { onNavigate?: () => void }) => (
    <nav className="flex flex-col gap-0.5 p-3">
      {navItems.map((item) => {
        const active =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-slate-900 text-white"
                : "text-slate-700 hover:bg-slate-100",
            )}
          >
            <Icon className="h-5 w-5 shrink-0 opacity-90" aria-hidden />
            {t(`nav.${item.labelKey}`)}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="hidden w-60 shrink-0 border-r border-slate-200 bg-white md:flex md:flex-col">
        <div className="flex h-14 items-center gap-2 border-b border-slate-200 px-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-900 text-xs font-semibold text-white">
            SO
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">
              {user.organizationName}
            </p>
            <p className="truncate text-xs text-slate-500">{t("common.appName")}</p>
          </div>
        </div>
        <NavLinks />
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-40 md:hidden" role="dialog" aria-modal>
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label={t("common.closeMenu")}
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute left-0 top-0 flex h-full w-[min(18rem,85vw)] flex-col bg-white shadow-xl">
            <div className="flex h-14 items-center justify-between border-b border-slate-200 px-3">
              <span className="text-sm font-semibold text-slate-900">
                {t("common.menu")}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setMobileOpen(false)}
                aria-label={t("common.closeMenu")}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <NavLinks onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-slate-200 bg-white px-3 md:px-4">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label={t("common.openMenu")}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="min-w-0 flex-1 md:hidden">
            <p className="truncate text-sm font-semibold text-slate-900">
              {user.organizationName}
            </p>
          </div>
          <div className="hidden flex-1 md:block" />

          <LanguageSwitcher />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="max-w-[10rem] shrink-0 truncate md:max-w-xs"
              >
                {user.name}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                  <p className="text-xs font-medium text-slate-600">
                    {t(roleLabelKey(user.role))}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {canAccessRoute(user.role, "/dashboard") ? (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">{t("common.accountOverview")}</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              ) : null}
              <DropdownMenuItem
                onClick={() => {
                  logout();
                  router.replace("/login");
                }}
              >
                {t("common.signOut")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
