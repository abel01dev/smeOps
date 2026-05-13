/**
 * Demo seed for development + the graduation demo.
 *
 * Run with: pnpm db:seed
 *
 * Creates:
 *   - One Supabase auth user (auto-confirmed) you can log in with
 *   - One Organization linked to that user
 *   - 4 categories, 12 products (2 below minStock for low-stock demo)
 *   - 3 customers, ~30 days of randomized sales
 *
 * Demo login:
 *   email:    owner@demo.local
 *   password: Password123!
 */
import { PrismaClient, type Prisma } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";

const prisma = new PrismaClient();

const DEMO_EMAIL = "owner@demo.local";
const DEMO_PASSWORD = "Password123!";

function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Seed requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in apps/api/.env",
    );
  }
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function ensureSupabaseUser(): Promise<string> {
  const supabase = getSupabaseAdmin();

  // listUsers is paginated; the demo project only has a handful of users, so
  // page 1 is enough.
  const { data: list, error: listErr } = await supabase.auth.admin.listUsers();
  if (listErr) throw listErr;
  const existing = list.users.find((u) => u.email === DEMO_EMAIL);
  if (existing) {
    console.log(`Reusing existing Supabase user ${existing.id}`);
    return existing.id;
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
    email_confirm: true,
    user_metadata: { name: "Abel Demo" },
  });
  if (error || !data.user) throw error ?? new Error("Could not create demo user");
  console.log(`Created Supabase user ${data.user.id}`);
  return data.user.id;
}

async function main(): Promise<void> {
  console.log("Seeding database...");

  await prisma.saleItem.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();

  const supabaseUserId = await ensureSupabaseUser();

  const org = await prisma.organization.create({
    data: {
      name: "Abel Mini Market",
      slug: "abel-mini-market",
      currency: "ETB",
    },
  });

  const owner = await prisma.user.create({
    data: {
      id: supabaseUserId,
      organizationId: org.id,
      email: DEMO_EMAIL,
      name: "Abel Demo",
      role: "OWNER",
    },
  });

  const categoriesData = ["Beverages", "Snacks", "Household", "Personal Care"];
  const categories = await Promise.all(
    categoriesData.map((name) =>
      prisma.category.create({ data: { organizationId: org.id, name } }),
    ),
  );
  const catBy = (name: string) => categories.find((c) => c.name === name)!.id;

  const productsData: Array<Omit<Prisma.ProductCreateManyInput, "organizationId">> = [
    { name: "Coca-Cola 500ml", categoryId: catBy("Beverages"), buyPrice: "25.00", sellPrice: "35.00", stockQuantity: 80, minStock: 12 },
    { name: "Pepsi 500ml", categoryId: catBy("Beverages"), buyPrice: "23.00", sellPrice: "33.00", stockQuantity: 60, minStock: 12 },
    { name: "Mineral Water 1L", categoryId: catBy("Beverages"), buyPrice: "12.00", sellPrice: "20.00", stockQuantity: 120, minStock: 24 },
    { name: "Mango Juice 250ml", categoryId: catBy("Beverages"), buyPrice: "18.00", sellPrice: "28.00", stockQuantity: 45, minStock: 12 },
    { name: "Potato Chips", categoryId: catBy("Snacks"), buyPrice: "20.00", sellPrice: "30.00", stockQuantity: 50, minStock: 10 },
    { name: "Chocolate Bar", categoryId: catBy("Snacks"), buyPrice: "30.00", sellPrice: "45.00", stockQuantity: 35, minStock: 10 },
    { name: "Biscuits Pack", categoryId: catBy("Snacks"), buyPrice: "15.00", sellPrice: "25.00", stockQuantity: 70, minStock: 15 },
    { name: "Dish Soap 500ml", categoryId: catBy("Household"), buyPrice: "45.00", sellPrice: "65.00", stockQuantity: 25, minStock: 8 },
    { name: "Laundry Powder 1kg", categoryId: catBy("Household"), buyPrice: "120.00", sellPrice: "160.00", stockQuantity: 8, minStock: 10 }, // low
    { name: "Toilet Paper 4-pack", categoryId: catBy("Household"), buyPrice: "90.00", sellPrice: "130.00", stockQuantity: 30, minStock: 8 },
    { name: "Toothpaste", categoryId: catBy("Personal Care"), buyPrice: "60.00", sellPrice: "90.00", stockQuantity: 22, minStock: 8 },
    { name: "Shampoo 400ml", categoryId: catBy("Personal Care"), buyPrice: "150.00", sellPrice: "210.00", stockQuantity: 5, minStock: 6 }, // low
  ];

  await prisma.product.createMany({
    data: productsData.map((p) => ({ ...p, organizationId: org.id })),
  });
  const products = await prisma.product.findMany({ where: { organizationId: org.id } });

  const customers = await Promise.all(
    [
      { name: "Walk-in Customer", phone: null, address: null },
      { name: "Selam Bekele", phone: "+251911223344", address: "Bole, Addis Ababa" },
      { name: "Daniel Tesfaye", phone: "+251922334455", address: "Piassa, Addis Ababa" },
    ].map((c) => prisma.customer.create({ data: { organizationId: org.id, ...c } })),
  );

  const now = new Date();
  for (let d = 30; d >= 0; d--) {
    const day = new Date(now);
    day.setDate(day.getDate() - d);
    const salesCount = 3 + Math.floor(Math.random() * 6);

    for (let s = 0; s < salesCount; s++) {
      const itemCount = 1 + Math.floor(Math.random() * 4);
      const used = new Set<string>();
      const items: Array<{
        productId: string;
        productName: string;
        quantity: number;
        buyPriceAtSale: string;
        sellPriceAtSale: string;
        lineTotal: number;
        lineProfit: number;
      }> = [];

      for (let i = 0; i < itemCount; i++) {
        const p = products[Math.floor(Math.random() * products.length)];
        if (used.has(p.id)) continue;
        used.add(p.id);
        const qty = 1 + Math.floor(Math.random() * 3);
        const sell = Number(p.sellPrice);
        const buy = Number(p.buyPrice);
        items.push({
          productId: p.id,
          productName: p.name,
          quantity: qty,
          buyPriceAtSale: p.buyPrice.toString(),
          sellPriceAtSale: p.sellPrice.toString(),
          lineTotal: sell * qty,
          lineProfit: (sell - buy) * qty,
        });
      }
      if (items.length === 0) continue;

      const subtotal = items.reduce((acc, it) => acc + it.lineTotal, 0);
      const profit = items.reduce((acc, it) => acc + it.lineProfit, 0);
      const customer = customers[Math.floor(Math.random() * customers.length)];

      const saleTime = new Date(day);
      saleTime.setHours(8 + Math.floor(Math.random() * 12));
      saleTime.setMinutes(Math.floor(Math.random() * 60));

      await prisma.sale.create({
        data: {
          organizationId: org.id,
          customerId: customer.id,
          cashierId: owner.id,
          subtotal: subtotal.toFixed(2),
          discount: "0.00",
          total: subtotal.toFixed(2),
          profit: profit.toFixed(2),
          paymentMethod: "CASH",
          createdAt: saleTime,
          items: {
            create: items.map((it) => ({
              productId: it.productId,
              productName: it.productName,
              quantity: it.quantity,
              buyPriceAtSale: it.buyPriceAtSale,
              sellPriceAtSale: it.sellPriceAtSale,
              lineTotal: it.lineTotal.toFixed(2),
              lineProfit: it.lineProfit.toFixed(2),
            })),
          },
        },
      });

      await prisma.customer.update({
        where: { id: customer.id },
        data: { totalSpent: { increment: subtotal } },
      });
    }
  }

  console.log("Seed complete.");
  console.log(`   Login: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
