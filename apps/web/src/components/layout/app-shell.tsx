"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import * as React from "react";

import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";
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
import { ArrowLeft, ChevronDown, Menu, X } from "lucide-react";

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations();
  const { user, isInitialized, logout } = useAuthStore();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const isPosFullscreen =
    pathname === "/pos" || pathname.startsWith("/pos/");

  const navItems = React.useMemo(
    () => (user ? navForRole(user.role) : []),
    [user],
  );

  const exitPosHref = React.useMemo(() => {
    if (!user) return "/dashboard";
    const alt = navForRole(user.role).find((item) => item.href !== "/pos");
    return alt?.href ?? DEFAULT_ROUTE_BY_ROLE[user.role];
  }, [user]);

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
      <div className="grid min-h-screen place-items-center bg-background text-sm text-muted-foreground">
        {t("common.loading")}
      </div>
    );
  }
  if (!user) return null;

  if (!canAccessRoute(user.role, pathname)) {
    return (
      <div className="grid min-h-screen place-items-center bg-background p-6">
        <div className="max-w-sm text-center">
          <h1 className="text-lg font-semibold text-foreground">
            {t("access.deniedTitle")}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("access.deniedMessage")}
          </p>
          <Button
            type="button"
            className="mt-4"
            onClick={() => router.replace(DEFAULT_ROUTE_BY_ROLE[user.role])}
          >
            {user.role === "CASHIER"
              ? t("access.goToPos")
              : user.role === "INVENTORY_MANAGER"
                ? t("access.goToInventory")
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
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            <Icon className="h-5 w-5 shrink-0 opacity-90" aria-hidden />
            {t(`nav.${item.labelKey}`)}
          </Link>
        );
      })}
    </nav>
  );

  const SidebarFooter = ({ onNavigate }: { onNavigate?: () => void }) => (
    <div className="shrink-0 space-y-3 border-t border-border bg-muted/30 p-3">
      <div className="flex gap-2">
        <ThemeSwitcher className="h-9 shrink-0 px-2" />
        <LanguageSwitcher className="h-9 min-w-0 flex-1 justify-center gap-1 px-2 sm:justify-start" />
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-10 w-full justify-between gap-2 px-3 font-normal"
          >
            <span className="min-w-0 truncate text-left">{user.name}</span>
            <ChevronDown className="h-4 w-4 shrink-0 opacity-60" aria-hidden />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right" align="end" className="w-56">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.name}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
              <p className="text-xs font-medium text-muted-foreground">
                {t(roleLabelKey(user.role))}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {canAccessRoute(user.role, "/dashboard") ? (
            <>
              <DropdownMenuItem asChild>
                <Link href="/dashboard" onClick={onNavigate}>
                  {t("common.accountOverview")}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          ) : null}
          <DropdownMenuItem
            onClick={() => {
              onNavigate?.();
              logout();
              router.replace("/login");
            }}
          >
            {t("common.signOut")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

  if (isPosFullscreen) {
    return (
      <div className="flex h-[100dvh] min-h-0 flex-col overflow-hidden bg-background">
        <header className="z-30 flex h-12 shrink-0 items-center gap-2 border-b border-border bg-card px-3 sm:px-4">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="gap-1.5"
            onClick={() => router.push(exitPosHref)}
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            {t("pos.exit")}
          </Button>
          <div className="min-w-0 flex-1 text-center sm:text-left">
            <p className="truncate text-sm font-semibold text-foreground">
              {t("nav.pos")}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {user.organizationName}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <ThemeSwitcher className="h-9 px-2" />
            <LanguageSwitcher className="h-9 px-2" />
          </div>
        </header>
        <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-muted/40">
      <aside className="sticky top-0 hidden h-screen max-h-screen w-60 shrink-0 flex-col border-r border-border bg-card md:flex">
        <div className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-xs font-semibold text-primary-foreground">
            SO
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">
              {user.organizationName}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {t("common.appName")}
            </p>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <NavLinks />
        </div>
        <SidebarFooter />
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-40 md:hidden" role="dialog" aria-modal>
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label={t("common.closeMenu")}
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute left-0 top-0 flex h-full w-[min(18rem,85vw)] flex-col bg-card shadow-xl">
            <div className="flex h-14 shrink-0 items-center justify-between border-b border-border px-3">
              <span className="text-sm font-semibold text-foreground">
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
            <div className="min-h-0 flex-1 overflow-y-auto">
              <NavLinks onNavigate={() => setMobileOpen(false)} />
            </div>
            <SidebarFooter onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-card/95 px-3 backdrop-blur supports-[backdrop-filter]:bg-card/80 md:hidden md:px-4">
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
            <p className="truncate text-sm font-semibold text-foreground">
              {user.organizationName}
            </p>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
