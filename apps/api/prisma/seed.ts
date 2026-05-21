/**
 * Demo seed for development + portfolio demos.
 *
 * Run: pnpm db:seed   (from repo root)
 *
 * Creates:
 *   - Supabase auth user (auto-confirmed)
 *   - Organization + owner
 *   - 4 categories, 14 products (2 intentionally low stock, 1 archived)
 *   - 5 customers
 *   - ~30 days of sales with mixed payment methods, occasional discounts
 *   - Stock quantities adjusted to reflect seeded sales
 *
 * Demo logins (password for all): Password123!
 *   owner@demo.local    — OWNER
 *   manager@demo.local  — MANAGER (shop manager)
 *   inventory@demo.local — INVENTORY_MANAGER (categories + products only)
 *   cashier@demo.local  — CASHIER
 */
import {
  PaymentMethod,
  PrismaClient,
  UserRole,
  type Prisma,
} from "@prisma/client";
import { createClient } from "@supabase/supabase-js";

const prisma = new PrismaClient();

const DEMO_PASSWORD = "Password123!";

const DEMO_TEAM: Array<{
  email: string;
  name: string;
  role: UserRole;
}> = [
  { email: "owner@demo.local", name: "Abel Demo", role: UserRole.OWNER },
  { email: "manager@demo.local", name: "Sara Manager", role: UserRole.MANAGER },
  {
    email: "inventory@demo.local",
    name: "Mesfin Inventory",
    role: UserRole.INVENTORY_MANAGER,
  },
  { email: "cashier@demo.local", name: "Kebede Cashier", role: UserRole.CASHIER },
];

const PAYMENT_METHODS: PaymentMethod[] = [
  PaymentMethod.CASH,
  PaymentMethod.MOBILE_MONEY,
  PaymentMethod.CARD,
];

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

async function ensureSupabaseUser(
  email: string,
  name: string,
): Promise<string> {
  const supabase = getSupabaseAdmin();

  const { data: list, error: listErr } = await supabase.auth.admin.listUsers();
  if (listErr) throw listErr;
  const existing = list.users.find((u) => u.email === email);
  if (existing) {
    console.log(`  Reusing Supabase user ${email}`);
    return existing.id;
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password: DEMO_PASSWORD,
    email_confirm: true,
    user_metadata: { name },
  });
  if (error || !data.user) throw error ?? new Error(`Could not create ${email}`);
  console.log(`  Created Supabase user ${email}`);
  return data.user.id;
}

function pickPayment(): PaymentMethod {
  const r = Math.random();
  if (r < 0.55) return PaymentMethod.CASH;
  if (r < 0.85) return PaymentMethod.MOBILE_MONEY;
  return PaymentMethod.CARD;
}

async function main(): Promise<void> {
  console.log("Seeding database...\n");

  await prisma.saleItem.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.operationalExpense.deleteMany();
  await prisma.expenseCategory.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();

  const org = await prisma.organization.create({
    data: {
      name: "Abel Mini Market",
      slug: "abel-mini-market",
      currency: "ETB",
    },
  });

  console.log("Creating demo team users...");
  const team = await Promise.all(
    DEMO_TEAM.map(async (member) => {
      const id = await ensureSupabaseUser(member.email, member.name);
      return prisma.user.create({
        data: {
          id,
          organizationId: org.id,
          email: member.email,
          name: member.name,
          role: member.role,
        },
      });
    }),
  );
  const owner = team.find((u) => u.role === UserRole.OWNER)!;

  const categoriesData = ["Beverages", "Snacks", "Household", "Personal Care"];
  const categories = await Promise.all(
    categoriesData.map((name) =>
      prisma.category.create({ data: { organizationId: org.id, name } }),
    ),
  );
  const catBy = (name: string) => categories.find((c) => c.name === name)!.id;

  const productsData: Array<
    Omit<Prisma.ProductCreateManyInput, "organizationId"> & { description?: string }
  > = [
    { name: "Coca-Cola 500ml", categoryId: catBy("Beverages"), description: "Chilled soft drink", buyPrice: "25.00", sellPrice: "35.00", stockQuantity: 80, minStock: 12 },
    { name: "Pepsi 500ml", categoryId: catBy("Beverages"), description: "Chilled soft drink", buyPrice: "23.00", sellPrice: "33.00", stockQuantity: 60, minStock: 12 },
    { name: "Mineral Water 1L", categoryId: catBy("Beverages"), buyPrice: "12.00", sellPrice: "20.00", stockQuantity: 120, minStock: 24 },
    { name: "Mango Juice 250ml", categoryId: catBy("Beverages"), buyPrice: "18.00", sellPrice: "28.00", stockQuantity: 45, minStock: 12 },
    { name: "Coffee Sachets (10pk)", categoryId: catBy("Beverages"), buyPrice: "55.00", sellPrice: "75.00", stockQuantity: 40, minStock: 10 },
    { name: "Potato Chips", categoryId: catBy("Snacks"), buyPrice: "20.00", sellPrice: "30.00", stockQuantity: 50, minStock: 10 },
    { name: "Chocolate Bar", categoryId: catBy("Snacks"), buyPrice: "30.00", sellPrice: "45.00", stockQuantity: 35, minStock: 10 },
    { name: "Biscuits Pack", categoryId: catBy("Snacks"), buyPrice: "15.00", sellPrice: "25.00", stockQuantity: 70, minStock: 15 },
    { name: "Peanuts 200g", categoryId: catBy("Snacks"), buyPrice: "22.00", sellPrice: "32.00", stockQuantity: 28, minStock: 8 },
    { name: "Dish Soap 500ml", categoryId: catBy("Household"), buyPrice: "45.00", sellPrice: "65.00", stockQuantity: 25, minStock: 8 },
    { name: "Laundry Powder 1kg", categoryId: catBy("Household"), buyPrice: "120.00", sellPrice: "160.00", stockQuantity: 8, minStock: 10 },
    { name: "Toilet Paper 4-pack", categoryId: catBy("Household"), buyPrice: "90.00", sellPrice: "130.00", stockQuantity: 30, minStock: 8 },
    { name: "Toothpaste", categoryId: catBy("Personal Care"), buyPrice: "60.00", sellPrice: "90.00", stockQuantity: 22, minStock: 8 },
    { name: "Shampoo 400ml", categoryId: catBy("Personal Care"), buyPrice: "150.00", sellPrice: "210.00", stockQuantity: 5, minStock: 6 },
    {
      name: "Discontinued Soap Bar",
      categoryId: catBy("Personal Care"),
      buyPrice: "10.00",
      sellPrice: "15.00",
      stockQuantity: 0,
      minStock: 5,
      status: "ARCHIVED",
    },
  ];

  await prisma.product.createMany({
    data: productsData.map((p) => ({ ...p, organizationId: org.id })),
  });
  const products = await prisma.product.findMany({
    where: { organizationId: org.id, status: "ACTIVE" },
  });
  const stockByProduct = new Map(
    products.map((p) => [p.id, p.stockQuantity]),
  );

  const customers = await Promise.all(
    [
      { name: "Walk-in Customer", phone: null, address: null },
      { name: "Selam Bekele", phone: "+251911223344", address: "Bole, Addis Ababa" },
      { name: "Daniel Tesfaye", phone: "+251922334455", address: "Piassa, Addis Ababa" },
      { name: "Hanna Girma", phone: "+251933445566", address: "Megenagna, Addis Ababa" },
      { name: "Mikiyas Alemu", phone: "+251944556677", address: "Kazanchis, Addis Ababa" },
    ].map((c) => prisma.customer.create({ data: { organizationId: org.id, ...c } })),
  );

  let saleCount = 0;
  let totalRevenue = 0;

  const now = new Date();
  for (let d = 30; d >= 0; d--) {
    const day = new Date(now);
    day.setDate(day.getDate() - d);
    const salesPerDay = 4 + Math.floor(Math.random() * 7);

    for (let s = 0; s < salesPerDay; s++) {
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
        const available = products.filter(
          (p) => (stockByProduct.get(p.id) ?? 0) > 0 && !used.has(p.id),
        );
        if (available.length === 0) break;
        const p = available[Math.floor(Math.random() * available.length)];
        used.add(p.id);
        const maxQty = Math.min(3, stockByProduct.get(p.id) ?? 0);
        const qty = 1 + Math.floor(Math.random() * maxQty);
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
        stockByProduct.set(p.id, (stockByProduct.get(p.id) ?? 0) - qty);
      }
      if (items.length === 0) continue;

      const subtotal = items.reduce((acc, it) => acc + it.lineTotal, 0);
      const profit = items.reduce((acc, it) => acc + it.lineProfit, 0);
      const discount =
        Math.random() < 0.12
          ? Math.min(subtotal * 0.1, 50)
          : 0;
      const total = subtotal - discount;
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
          discount: discount.toFixed(2),
          total: total.toFixed(2),
          profit: (profit - discount).toFixed(2),
          paymentMethod: pickPayment(),
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
        data: { totalSpent: { increment: total } },
      });

      saleCount += 1;
      totalRevenue += total;
    }
  }

  await Promise.all(
    [...stockByProduct.entries()].map(([id, qty]) =>
      prisma.product.update({
        where: { id },
        data: { stockQuantity: Math.max(0, qty) },
      }),
    ),
  );

  const activeProducts = await prisma.product.findMany({
    where: { organizationId: org.id, status: "ACTIVE" },
    select: { stockQuantity: true, minStock: true },
  });
  const lowStockCount = activeProducts.filter(
    (p) => p.stockQuantity <= p.minStock,
  ).length;

  const expenseCategoryNames = [
    "Rent",
    "Salaries",
    "Transport",
    "Utilities",
    "Other",
  ] as const;
  const expenseCats = await Promise.all(
    expenseCategoryNames.map((name) =>
      prisma.expenseCategory.create({
        data: { organizationId: org.id, name },
      }),
    ),
  );
  const expCat = (name: string) =>
    expenseCats.find((c) => c.name === name)!.id;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expenseSamples = [
    {
      categoryId: expCat("Rent"),
      amount: "8500.00",
      description: "Shop rent",
      daysAgo: 2,
    },
    {
      categoryId: expCat("Salaries"),
      amount: "12000.00",
      description: "Staff salaries",
      daysAgo: 1,
    },
    {
      categoryId: expCat("Transport"),
      amount: "450.00",
      description: "Delivery fuel",
      daysAgo: 0,
    },
    {
      categoryId: expCat("Utilities"),
      amount: "320.00",
      description: "Electricity",
      daysAgo: 3,
    },
    {
      categoryId: expCat("Other"),
      amount: "180.00",
      description: "Cleaning supplies",
      daysAgo: 0,
    },
  ];

  for (const sample of expenseSamples) {
    const expenseDate = new Date(today);
    expenseDate.setDate(expenseDate.getDate() - sample.daysAgo);
    await prisma.operationalExpense.create({
      data: {
        organizationId: org.id,
        categoryId: sample.categoryId,
        recordedById: owner.id,
        amount: sample.amount,
        description: sample.description,
        expenseDate,
        paymentMethod: PaymentMethod.CASH,
      },
    });
  }

  console.log("Seed complete.\n");
  console.log("   Organization:", org.name);
  console.log("   Categories:  ", categories.length);
  console.log("   Products:    ", productsData.length, `(${lowStockCount} low stock)`);
  console.log("   Customers:   ", customers.length);
  console.log("   Sales:       ", saleCount);
  console.log("   Revenue:     ", `ETB ${totalRevenue.toFixed(2)}`);
  console.log("   Expenses:    ", expenseSamples.length, "sample OPEX rows");
  console.log("\n   Demo accounts (password for all: Password123!):");
  for (const m of DEMO_TEAM) {
    console.log(`     ${m.role.padEnd(7)} ${m.email}`);
  }
  console.log("\n   API docs:    http://localhost:4000/docs");
  console.log("   Web app:     http://localhost:3000");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
