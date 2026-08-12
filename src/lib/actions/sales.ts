"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { getCurrentBusiness } from "@/lib/current-user";

async function findOrCreateChannel(businessId: string, name: string) {
  const trimmed = name.trim();
  if (!trimmed) return null;
  const existing = await prisma.salesChannel.findFirst({ where: { businessId, name: trimmed } });
  if (existing) return existing.id;
  const created = await prisma.salesChannel.create({ data: { businessId, name: trimmed } });
  return created.id;
}

async function findOrCreatePaymentMethod(businessId: string, name: string) {
  const trimmed = name.trim();
  if (!trimmed) return null;
  const existing = await prisma.paymentMethod.findFirst({ where: { businessId, name: trimmed } });
  if (existing) return existing.id;
  const created = await prisma.paymentMethod.create({ data: { businessId, name: trimmed } });
  return created.id;
}

async function findOrCreateSalesIncomeCategory(businessId: string) {
  const existing = await prisma.incomeCategory.findFirst({ where: { businessId, name: "Penjualan" } });
  if (existing) return existing.id;
  const created = await prisma.incomeCategory.create({ data: { businessId, name: "Penjualan" } });
  return created.id;
}

export async function createSale(formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/login");
  const business = await getCurrentBusiness();
  if (!business) redirect("/onboarding");

  const productId = String(formData.get("productId") ?? "");
  const customerId = String(formData.get("customerId") ?? "") || null;
  const quantity = Number(formData.get("quantity") ?? 0);
  const unitPrice = Number(formData.get("unitPrice") ?? 0);
  const discount = Number(formData.get("discount") ?? 0);
  const channelName = String(formData.get("channel") ?? "");
  const paymentMethodName = String(formData.get("paymentMethod") ?? "");
  const paymentStatus = String(formData.get("paymentStatus") ?? "Paid");
  const amountPaidInput = formData.get("amountPaid");
  const notes = String(formData.get("notes") ?? "");

  if (!productId || quantity <= 0) throw new Error("Produk dan jumlah wajib diisi.");

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || product.businessId !== business.id) throw new Error("Produk tidak ditemukan.");
  if (quantity > product.stock) {
    throw new Error(`Stok tidak cukup: tersisa ${product.stock}`);
  }

  const subtotal = quantity * unitPrice;
  const total = Math.max(subtotal - discount, 0);
  const amountPaid =
    paymentStatus === "Paid"
      ? total
      : paymentStatus === "Unpaid"
      ? 0
      : Math.min(Number(amountPaidInput ?? 0), total);
  const outstandingBalance = total - amountPaid;

  const [channelId, paymentMethodId, incomeCategoryId] = await Promise.all([
    channelName ? findOrCreateChannel(business.id, channelName) : Promise.resolve(null),
    paymentMethodName ? findOrCreatePaymentMethod(business.id, paymentMethodName) : Promise.resolve(null),
    findOrCreateSalesIncomeCategory(business.id),
  ]);

  const sale = await prisma.$transaction(async (tx) => {
    const created = await tx.sale.create({
      data: {
        businessId: business.id,
        customerId: customerId ?? undefined,
        channelId: channelId ?? undefined,
        subtotal,
        discount,
        total,
        amountPaid,
        outstandingBalance,
        paymentStatus,
        paymentMethodId: paymentMethodId ?? undefined,
        notes: notes || undefined,
        items: {
          create: [{ productId, quantity, unitPrice, lineTotal: subtotal }],
        },
      },
    });

    await tx.product.update({
      where: { id: productId },
      data: {
        stock: { decrement: quantity },
        status: product.stock - quantity <= 0 ? "out_of_stock" : "active",
      },
    });

    await tx.financialTransaction.create({
      data: {
        businessId: business.id,
        type: "INCOME",
        incomeCategoryId,
        description: `Penjualan ${product.name}`,
        amount: amountPaid,
        paymentMethodId: paymentMethodId ?? undefined,
        relatedSaleId: created.id,
      },
    });

    return created;
  });

  revalidatePath("/sales");
  revalidatePath("/products");
  revalidatePath("/finance");
  revalidatePath("/dashboard");
  redirect(`/sales/${sale.id}`);
}

export async function markSalePaid(saleId: string) {
  const sale = await prisma.sale.findUnique({ where: { id: saleId } });
  if (!sale) throw new Error("Penjualan tidak ditemukan.");

  const remaining = sale.outstandingBalance;
  if (remaining <= 0) return;

  await prisma.$transaction([
    prisma.sale.update({
      where: { id: saleId },
      data: { amountPaid: sale.total, outstandingBalance: 0, paymentStatus: "Paid" },
    }),
    prisma.financialTransaction.create({
      data: {
        businessId: sale.businessId,
        type: "INCOME",
        description: "Pelunasan penjualan",
        amount: remaining,
        relatedSaleId: sale.id,
      },
    }),
  ]);

  revalidatePath(`/sales/${saleId}`);
  revalidatePath("/finance");
  revalidatePath("/dashboard");
}
