import { loginSchema, type LoginInput } from "@sme/shared";
import { Link, router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslation } from "@/i18n/context";
import { formatApiError } from "@/lib/api-errors";
import { authApi } from "@/lib/api/auth";
import { useAuthStore } from "@/stores/auth.store";

export default function LoginScreen() {
  const t = useTranslation();
  const setSession = useAuthStore((s) => s.setSession);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      Alert.alert("Error", parsed.error.errors[0]?.message ?? "Invalid input");
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.login(parsed.data as LoginInput);
      await setSession(res.user, res.tokens);
      router.replace("/");
    } catch (e) {
      Alert.alert("Error", formatApiError(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerClassName="flex-grow justify-center p-6">
        <Text className="text-3xl font-bold text-foreground">{t("auth.welcomeBack")}</Text>
        <Text className="mt-2 text-muted-foreground">{t("auth.signInSubtitle")}</Text>

        <View className="mt-8 gap-4">
          <Input
            value={email}
            onChangeText={setEmail}
            placeholder={t("auth.email")}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <Input
            value={password}
            onChangeText={setPassword}
            placeholder={t("auth.password")}
            secureTextEntry
          />
          <Button
            label={loading ? t("auth.signingIn") : t("auth.signIn")}
            loading={loading}
            onPress={() => void submit()}
          />
        </View>

        <Pressable className="mt-6" onPress={() => router.push("/(auth)/register")}>
          <Text className="text-center text-primary">
            {t("auth.newToApp")} {t("auth.createAccount")}
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
