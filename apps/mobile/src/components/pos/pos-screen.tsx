import type { Product } from "@sme/shared";
import { router } from "expo-router";
import { Minus, Plus, Search, ShoppingCart, X } from "lucide-react-native";
import * as React from "react";
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  Text,
  View,
} from "react-native";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslation } from "@/i18n/context";
import { usePosCategories, usePosProducts, useCreateSale } from "@/hooks/use-pos";
import {
  cartTotals,
  usePosCartStore,
} from "@/stores/pos-cart.store";
import { cn } from "@/lib/cn";

export function PosScreen() {
  const t = useTranslation();
  const [search, setSearch] = React.useState("");
  const [debounced, setDebounced] = React.useState("");
  const [categoryId, setCategoryId] = React.useState<string | undefined>();
  const [cartOpen, setCartOpen] = React.useState(false);

  const lines = usePosCartStore((s) => s.lines);
  const discount = usePosCartStore((s) => s.discount);
  const paymentMethod = usePosCartStore((s) => s.paymentMethod);
  const addProduct = usePosCartStore((s) => s.addProduct);
  const setQuantity = usePosCartStore((s) => s.setQuantity);
  const setDiscount = usePosCartStore((s) => s.setDiscount);
  const setPaymentMethod = usePosCartStore((s) => s.setPaymentMethod);
  const clear = usePosCartStore((s) => s.clear);

  const cats = usePosCategories();
  const products = usePosProducts(debounced, categoryId);
  const checkout = useCreateSale();

  React.useEffect(() => {
    const id = setTimeout(() => setDebounced(search.trim()), 250);
    return () => clearTimeout(id);
  }, [search]);

  const totals = cartTotals(lines, discount);

  const handleCheckout = async () => {
    if (!lines.length) return;
    try {
      await checkout.mutateAsync({
        items: lines.map((l) => ({
          productId: l.productId,
          quantity: l.quantity,
        })),
        discount,
        paymentMethod,
      });
      clear();
      setCartOpen(false);
      Alert.alert(t("pos.saleComplete", { amount: totals.total.toFixed(2) }));
      router.back();
    } catch (e) {
      Alert.alert("Error", (e as Error).message);
    }
  };

  return (
    <View className="flex-1 bg-background">
      <View className="flex-row items-center justify-between border-b border-border px-4 py-3">
        <Pressable onPress={() => router.back()}>
          <X size={24} color="#64748b" />
        </Pressable>
        <Text className="text-lg font-semibold text-foreground">{t("nav.pos")}</Text>
        <Pressable onPress={() => setCartOpen(true)} className="relative">
          <ShoppingCart size={24} color="#E15A65" />
          {totals.itemCount > 0 ? (
            <View className="absolute -right-2 -top-2 h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1">
              <Text className="text-xs font-bold text-white">
                {totals.itemCount}
              </Text>
            </View>
          ) : null}
        </Pressable>
      </View>

      <View className="px-4 py-2">
        <View className="relative">
          <Search
            size={18}
            color="#94a3b8"
            style={{ position: "absolute", left: 12, top: 12, zIndex: 1 }}
          />
          <Input
            value={search}
            onChangeText={setSearch}
            placeholder={t("pos.searchProducts")}
            className="pl-10"
          />
        </View>
      </View>

      <FlatList
        horizontal
        data={[{ id: "", name: t("common.allProducts") }, ...(cats.data ?? [])]}
        keyExtractor={(item) => item.id || "all"}
        showsHorizontalScrollIndicator={false}
        className="max-h-12 px-2"
        renderItem={({ item }) => (
          <Pressable
            onPress={() => setCategoryId(item.id || undefined)}
            className={cn(
              "mr-2 rounded-full px-4 py-2",
              (categoryId ?? "") === (item.id || "")
                ? "bg-primary"
                : "bg-muted",
            )}
          >
            <Text
              className={cn(
                "text-sm font-medium",
                (categoryId ?? "") === (item.id || "")
                  ? "text-primary-foreground"
                  : "text-foreground",
              )}
            >
              {item.name}
            </Text>
          </Pressable>
        )}
      />

      <FlatList
        data={products.data?.items ?? []}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerClassName="p-3 gap-3"
        columnWrapperStyle={{ gap: 12 }}
        renderItem={({ item }) => (
          <ProductTile product={item} onPress={() => addProduct(item)} />
        )}
        ListEmptyComponent={
          <Text className="py-8 text-center text-muted-foreground">
            {products.isLoading ? t("common.loading") : t("pos.noProducts")}
          </Text>
        }
      />

      <Modal visible={cartOpen} animationType="slide" presentationStyle="pageSheet">
        <View className="flex-1 bg-background pt-12">
          <View className="flex-row items-center justify-between px-4 pb-4">
            <Text className="text-xl font-bold">{t("pos.currentSale")}</Text>
            <Pressable onPress={() => setCartOpen(false)}>
              <X size={24} />
            </Pressable>
          </View>
          <FlatList
            data={lines}
            keyExtractor={(l) => l.productId}
            contentContainerClassName="px-4"
            renderItem={({ item }) => (
              <View className="mb-3 flex-row items-center justify-between rounded-lg border border-border p-3">
                <View className="flex-1">
                  <Text className="font-medium">{item.name}</Text>
                  <Text className="text-sm text-muted-foreground">
                    {item.sellPrice.toFixed(2)} ETB
                  </Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <Pressable
                    onPress={() =>
                      setQuantity(item.productId, item.quantity - 1)
                    }
                    className="rounded-full bg-muted p-2"
                  >
                    <Minus size={16} />
                  </Pressable>
                  <Text className="min-w-6 text-center font-semibold">
                    {item.quantity}
                  </Text>
                  <Pressable
                    onPress={() =>
                      setQuantity(item.productId, item.quantity + 1)
                    }
                    className="rounded-full bg-muted p-2"
                  >
                    <Plus size={16} />
                  </Pressable>
                </View>
              </View>
            )}
            ListEmptyComponent={
              <Text className="text-center text-muted-foreground py-8">
                {t("pos.tapToAdd")}
              </Text>
            }
          />
          <View className="border-t border-border p-4 gap-3">
            <View className="flex-row gap-2">
              {(["CASH", "MOBILE_MONEY", "CARD"] as const).map((m) => (
                <Pressable
                  key={m}
                  onPress={() => setPaymentMethod(m)}
                  className={cn(
                    "flex-1 rounded-lg border py-2 items-center",
                    paymentMethod === m
                      ? "border-primary bg-primary/10"
                      : "border-border",
                  )}
                >
                  <Text className="text-xs font-medium">{m.replace("_", " ")}</Text>
                </Pressable>
              ))}
            </View>
            <Text className="text-lg font-bold">
              {t("common.total")}: {totals.total.toFixed(2)} ETB
            </Text>
            <Button
              label={checkout.isPending ? t("common.processing") : t("pos.charge", { amount: totals.total.toFixed(2) })}
              loading={checkout.isPending}
              disabled={!lines.length}
              onPress={() => void handleCheckout()}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

function ProductTile({
  product,
  onPress,
}: {
  product: Product;
  onPress: () => void;
}) {
  const stock = product.stockQuantity;
  const low = product.isLowStock;
  return (
    <Pressable
      onPress={onPress}
      className="flex-1 rounded-xl border border-border bg-card p-3 min-h-[120px] active:opacity-80"
    >
      <Text className="font-semibold text-foreground" numberOfLines={2}>
        {product.name}
      </Text>
      <Text className="mt-2 text-lg font-bold text-primary">
        {Number(product.sellPrice).toFixed(2)} ETB
      </Text>
      <Text
        className={cn(
          "mt-1 text-xs",
          low ? "text-destructive" : "text-muted-foreground",
        )}
      >
        Stock: {stock}
      </Text>
    </Pressable>
  );
}
