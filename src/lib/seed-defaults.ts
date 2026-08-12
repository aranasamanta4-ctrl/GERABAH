import { prisma } from "@/lib/prisma";

const DEFAULT_PRODUCT_CATEGORIES = ["Vas", "Pot", "Cangkir", "Piring", "Patung", "Dekorasi Rumah", "Lainnya"];
const DEFAULT_EXPENSE_CATEGORIES = [
  "Bahan Baku",
  "Kemasan",
  "Transportasi",
  "Pemasaran",
  "Utilitas",
  "Sewa",
  "Peralatan",
  "Operasional",
  "Lainnya",
];
const DEFAULT_INCOME_CATEGORIES = ["Penjualan", "Uang Muka", "Pendapatan Lain"];
const DEFAULT_SALES_CHANNELS = [
  "Toko",
  "WhatsApp",
  "Instagram",
  "Marketplace",
  "Reseller",
  "Event",
  "Komunitas",
  "Lainnya",
];
const DEFAULT_PAYMENT_METHODS = ["Tunai", "Transfer Bank", "QRIS", "E-wallet", "Debit/Kredit", "Lainnya"];

export async function seedBusinessDefaults(businessId: string) {
  await prisma.$transaction([
    prisma.productCategory.createMany({
      data: DEFAULT_PRODUCT_CATEGORIES.map((name) => ({ businessId, name })),
    }),
    prisma.expenseCategory.createMany({
      data: DEFAULT_EXPENSE_CATEGORIES.map((name) => ({ businessId, name })),
    }),
    prisma.incomeCategory.createMany({
      data: DEFAULT_INCOME_CATEGORIES.map((name) => ({ businessId, name })),
    }),
    prisma.salesChannel.createMany({
      data: DEFAULT_SALES_CHANNELS.map((name) => ({ businessId, name })),
    }),
    prisma.paymentMethod.createMany({
      data: DEFAULT_PAYMENT_METHODS.map((name) => ({ businessId, name })),
    }),
  ]);
}
