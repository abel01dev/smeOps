import type { Product } from "@sme/shared";
import { Plus, Search } from "lucide-react-native";
import * as React from "react";
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslation } from "@/i18n/context";
import {
  useCreateProduct,
  useProductsList,
  useCategories,
} from "@/hooks/use-inventory";
import { cn } from "@/lib/cn";

export function InventoryScreen({ showFab = true }: { showFab?: boolean }) {
  const t = useTranslation();
  const [search, setSearch] = React.useState("");
  const [formOpen, setFormOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [sellPrice, setSellPrice] = React.useState("");
  const [buyPrice, setBuyPrice] = React.useState("");
  const [stock, setStock] = React.useState("0");

  const products = useProductsList({
    search: search || undefined,
    pageSize: 50,
    status: "ACTIVE",
  });
  const categories = useCategories();
  const createProduct = useCreateProduct();

  const handleCreate = async () => {
    if (!name.trim() || !sellPrice) {
      Alert.alert("Error", "Name and sell price required");
      return;
    }
    try {
      await createProduct.mutateAsync({
        name: name.trim(),
        sellPrice: Number(sellPrice),
        buyPrice: Number(buyPrice || sellPrice),
        stockQuantity: Number(stock) || 0,
        minStock: 5,
        status: "ACTIVE",
        categoryId: categories.data?.[0]?.id ?? null,
      });
      setFormOpen(false);
      setName("");
      setSellPrice("");
      setBuyPrice("");
      setStock("0");
    } catch (e) {
      Alert.alert("Error", (e as Error).message);
    }
  };

  return (
    <View className="flex-1 bg-background">
      <View className="px-4 py-3 border-b border-border">
        <Text className="text-xl font-bold text-foreground">{t("nav.inventory")}</Text>
        <View className="mt-3 relative">
          <Search size={18} color="#94a3b8" style={{ position: "absolute", left: 12, top: 12, zIndex: 1 }} />
          <Input
            value={search}
            onChangeText={setSearch}
            placeholder={t("inventory.searchPlaceholder")}
            className="pl-10"
          />
        </View>
      </View>

      <FlatList
        data={products.data?.items ?? []}
        keyExtractor={(p) => p.id}
        contentContainerClassName="p-4 gap-3"
        renderItem={({ item }) => <ProductRow product={item} />}
        refreshing={products.isFetching}
        onRefresh={() => products.refetch()}
        ListEmptyComponent={
          <Text className="text-center text-muted-foreground py-8">
            {products.isLoading ? t("common.loading") : t("inventory.noProductsYet")}
          </Text>
        }
      />

      {showFab ? (
        <Pressable
          onPress={() => setFormOpen(true)}
          className="absolute bottom-6 right-6 h-14 w-14 items-center justify-center rounded-full bg-primary shadow-lg"
        >
          <Plus color="#fff" size={28} />
        </Pressable>
      ) : null}

      <Modal visible={formOpen} animationType="slide" presentationStyle="pageSheet">
        <View className="flex-1 bg-background p-4 pt-12 gap-4">
          <Text className="text-xl font-bold">{t("inventory.addProduct")}</Text>
          <Input placeholder={t("inventory.productName")} value={name} onChangeText={setName} />
          <Input placeholder={t("inventory.sellPrice")} value={sellPrice} onChangeText={setSellPrice} keyboardType="decimal-pad" />
          <Input placeholder={t("inventory.buyPrice")} value={buyPrice} onChangeText={setBuyPrice} keyboardType="decimal-pad" />
          <Input placeholder={t("inventory.stockQty")} value={stock} onChangeText={setStock} keyboardType="number-pad" />
          <Button label={t("common.save")} loading={createProduct.isPending} onPress={() => void handleCreate()} />
          <Button variant="outline" label={t("common.cancel")} onPress={() => setFormOpen(false)} />
        </View>
      </Modal>
    </View>
  );
}

function ProductRow({ product }: { product: Product }) {
  const low = product.isLowStock;
  return (
    <View className="rounded-xl border border-border bg-card p-4">
      <Text className="font-semibold text-foreground">{product.name}</Text>
      <Text className="text-sm text-muted-foreground mt-1">
        {Number(product.sellPrice).toFixed(2)} ETB · Stock {product.stockQuantity}
      </Text>
      {low ? (
        <Text className="text-xs text-destructive mt-1">Low stock</Text>
      ) : null}
    </View>
  );
}
