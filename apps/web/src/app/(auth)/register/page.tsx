"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { type RegisterInput, registerSchema } from "@sme/shared";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import { authApi } from "@/lib/api/auth";
import { useAuthStore } from "@/stores/auth.store";

export default function RegisterPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      organizationName: "",
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: RegisterInput) => {
    try {
      const res = await authApi.register(values);
      setSession(res.user, res.tokens);
      toast.success(t("welcomeToast", { name: res.user.name }));
      router.replace("/dashboard");
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  return (
    <Card>
      <CardHeader className="space-y-3">
        <div className="flex justify-end gap-2">
          <ThemeSwitcher />
          <LanguageSwitcher />
        </div>
        <CardTitle>{t("registerTitle")}</CardTitle>
        <CardDescription>{t("registerSubtitle")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="organizationName">{t("businessName")}</Label>
            <Input
              id="organizationName"
              placeholder={t("orgPlaceholder")}
              {...register("organizationName")}
            />
            {errors.organizationName && (
              <p className="text-xs text-destructive">
                {errors.organizationName.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">{t("yourName")}</Label>
            <Input
              id="name"
              placeholder={t("namePlaceholder")}
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">{t("email")}</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder={t("emailPlaceholder")}
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{t("password")}</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder={t("passwordPlaceholder")}
              {...register("password")}
            />
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? t("registering") : t("register")}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          {t("haveAccount")}{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            {t("signInLink")}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
