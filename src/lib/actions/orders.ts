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

async function findOrCreateSalesIncomeCategory(businessId: string) {
  const existing = await prisma.incomeCategory.findFirst({ where: { businessId, name: "Penjualan" } });
  if (existing) return existing.id;
  const created = await prisma.incomeCategory.create({ data: { businessId, name: "Penjualan" } });
  return created.id;
}

export async function createOrder(formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/login");
  const business = await getCurrentBusiness();
  if (!business) redirect("/onboarding");

  const productId = String(formData.get("productId") ?? "");
  const customerId = String(formData.get("customerId") ?? "") || null;
  const quantity = Number(formData.get("quantity") ?? 0);
  const price = Number(formData.get("price") ?? 0);
  const discount = Number(formData.get("discount") ?? 0);
  const downPayment = Number(formData.get("downPayment") ?? 0);
  const channelName = String(formData.get("channel") ?? "");
  const dueDateValue = String(formData.get("dueDate") ?? "");
  const notes = String(formData.get("notes") ?? "");

  if (!productId || quantity <= 0) throw new Error("Produk dan jumlah wajib diisi.");

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || product.businessId !== business.id) throw new Error("Produk tidak ditemukan.");

  const total = Math.max(quantity * price - discount, 0);
  const remainingPayment = Math.max(total - downPayment, 0);
  const paymentStatus = remainingPayment <= 0 ? "Paid" : downPayment > 0 ? "Partially Paid" : "Unpaid";

  const channelId = channelName ? await findOrCreateChannel(business.id, channelName) : null;

  const order = await prisma.order.create({
    data: {
      businessId: business.id,
      customerId: customerId ?? undefined,
      channelId: channelId ?? undefined,
      status: "New",
      paymentStatus,
      downPayment,
      remainingPayment,
      total,
      dueDate: dueDateValue ? new Date(dueDateValue) : undefined,
      notes: notes || undefined,
      items: {
        create: [{ productId, quantity, price, discount }],
      },
    },
  });

  revalidatePath("/orders");
  revalidatePath("/dashboard");
  redirect(`/orders/${order.id}`);
}

const STATUS_FLOW = ["New", "Confirmed", "Processing", "Ready", "Completed"];

export async function advanceOrderStatus(orderId: string, nextStatus: string) {
  if (!STATUS_FLOW.includes(nextStatus) && nextStatus !== "Cancelled") {
    throw new Error("Status tidak valid.");
  }

  if (nextStatus === "Completed") {
    await completeOrder(orderId);
    return;
  }

  await prisma.order.update({ where: { id: orderId }, data: { status: nextStatus } });
  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/orders");
}

export async function completeOrder(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { product: true } } },
  });
  if (!order) throw new Error("Order tidak ditemukan.");
  if (order.items.length === 0) throw new Error("Order tidak memiliki item.");

  const item = order.items[0];
  if (item.quantity > item.product.stock) {
    throw new Error(`Stok tidak mencukupi: tersisa ${item.product.stock}`);
  }

  const incomeCategoryId = await findOrCreateSalesIncomeCategory(order.businessId);

  await prisma.$transaction(async (tx) => {
    const sale = await tx.sale.create({
      data: {
        businessId: order.businessId,
        customerId: order.customerId ?? undefined,
        channelId: order.channelId ?? undefined,
        subtotal: item.quantity * item.price,
        discount: item.discount,
        total: order.total,
        amountPaid: order.total - order.remainingPayment,
        outstandingBalance: order.remainingPayment,
        paymentStatus: order.paymentStatus,
        orderId: order.id,
        items: {
          create: [
            {
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.price,
              lineTotal: item.quantity * item.price,
            },
          ],
        },
      },
    });

    await tx.product.update({
      where: { id: item.productId },
      data: {
        stock: { decrement: item.quantity },
        status: item.product.stock - item.quantity <= 0 ? "out_of_stock" : "active",
      },
    });

    const amountReceived = order.total - order.remainingPayment;
    if (amountReceived > 0) {
      await tx.financialTransaction.create({
        data: {
          businessId: order.businessId,
          type: "INCOME",
          incomeCategoryId,
          description: `Penjualan ${item.product.name} (dari Order)`,
          amount: amountReceived,
          relatedSaleId: sale.id,
        },
      });
    }

    await tx.order.update({ where: { id: order.id }, data: { status: "Completed" } });
  });

  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/orders");
  revalidatePath("/sales");
  revalidatePath("/products");
  revalidatePath("/finance");
  revalidatePath("/dashboard");
}

export async function recordOrderPayment(orderId: string, amount: number) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new Error("Order tidak ditemukan.");
  if (amount <= 0 || amount > order.remainingPayment) throw new Error("Jumlah pembayaran tidak valid.");

  const newDownPayment = order.downPayment + amount;
  const newRemaining = order.remainingPayment - amount;

  await prisma.order.update({
    where: { id: orderId },
    data: {
      downPayment: newDownPayment,
      remainingPayment: newRemaining,
      paymentStatus: newRemaining <= 0 ? "Paid" : "Partially Paid",
    },
  });

  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/orders");
}
