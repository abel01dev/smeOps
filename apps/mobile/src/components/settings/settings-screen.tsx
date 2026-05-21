import { useEffect, useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslation } from "@/i18n/context";
import { aiAssistantApi } from "@/lib/api/ai-assistant";
import { useLocaleStore, type AppLocale } from "@/stores/locale.store";
import { useThemeStore, type ThemeMode } from "@/stores/theme.store";

export function SettingsScreen() {
  const t = useTranslation();
  const mode = useThemeStore((s) => s.mode);
  const setMode = useThemeStore((s) => s.setMode);
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);
  const [apiKey, setApiKey] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void aiAssistantApi.settings().then((s) => {
      if (s.hasApiKey) setApiKey("••••••••");
    });
  }, []);

  const saveAi = async () => {
    if (apiKey.startsWith("•")) return;
    setSaving(true);
    try {
      await aiAssistantApi.updateSettings({ openRouterApiKey: apiKey });
      Alert.alert(t("common.save"), "AI settings updated");
    } catch (e) {
      Alert.alert("Error", (e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-background p-4">
      <Text className="text-lg font-semibold mb-2">{t("common.theme")}</Text>
      <View className="flex-row gap-2 mb-6">
        <Button
          variant={mode === "light" ? "default" : "outline"}
          label={t("common.themeLight")}
          size="sm"
          onPress={() => void setMode("light")}
        />
        <Button
          variant={mode === "dark" ? "default" : "outline"}
          label={t("common.themeDark")}
          size="sm"
          onPress={() => void setMode("dark")}
        />
        <Button
          variant={mode === "system" ? "default" : "outline"}
          label={t("common.themeSystem")}
          size="sm"
          onPress={() => void setMode("system")}
        />
      </View>

      <Text className="text-lg font-semibold mb-2">{t("common.language")}</Text>
      <View className="flex-row gap-2 mb-6">
        {(["en", "am"] as AppLocale[]).map((l) => (
          <Button
            key={l}
            variant={locale === l ? "default" : "outline"}
            label={l === "en" ? "English" : "አማርኛ"}
            size="sm"
            onPress={() => void setLocale(l)}
          />
        ))}
      </View>

      <Text className="text-lg font-semibold mb-2">{t("assistant.settingsTitle")}</Text>
      <Input
        value={apiKey}
        onChangeText={setApiKey}
        placeholder={t("assistant.apiKeyPlaceholder")}
        secureTextEntry
        className="mb-3"
      />
      <Button
        label={saving ? t("common.saving") : t("common.save")}
        loading={saving}
        onPress={() => void saveAi()}
      />
    </ScrollView>
  );
}
