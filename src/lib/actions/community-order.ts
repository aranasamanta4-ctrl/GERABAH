"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

async function findOrCreateCommunityChannel(businessId: string) {
  const existing = await prisma.salesChannel.findFirst({ where: { businessId, name: "Komunitas" } });
  if (existing) return existing.id;
  const created = await prisma.salesChannel.create({ data: { businessId, name: "Komunitas" } });
  return created.id;
}

export async function createCommunityOrder(formData: FormData) {
  const session = await getSession();
  const productId = String(formData.get("productId") ?? "");
  if (!session) {
    redirect(`/login?redirect=/product/${productId}/order`);
  }

  const quantity = Number(formData.get("quantity") ?? 1);
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const notes = String(formData.get("notes") ?? "");
  const postId = String(formData.get("postId") ?? "") || null;

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new Error("Produk tidak ditemukan.");
  if (quantity <= 0) throw new Error("Jumlah tidak valid.");
  if (quantity > product.stock) {
    throw new Error(`Stok tidak mencukupi, tersisa ${product.stock}`);
  }
  if (!name) throw new Error("Nama wajib diisi.");

  let customer = await prisma.customer.findFirst({
    where: { businessId: product.businessId, userId: session!.userId },
  });
  if (!customer) {
    customer = await prisma.customer.create({
      data: {
        businessId: product.businessId,
        userId: session!.userId,
        name,
        phone: phone || undefined,
        address: address || undefined,
        type: "New",
      },
    });
  } else {
    customer = await prisma.customer.update({
      where: { id: customer.id },
      data: { name, phone: phone || undefined, address: address || undefined },
    });
  }

  const channelId = await findOrCreateCommunityChannel(product.businessId);
  const total = quantity * product.sellingPrice;

  const order = await prisma.order.create({
    data: {
      businessId: product.businessId,
      customerId: customer.id,
      channelId,
      status: "New",
      paymentStatus: "Unpaid",
      downPayment: 0,
      remainingPayment: total,
      total,
      sourcePostId: postId ?? undefined,
      notes: notes || undefined,
      items: {
        create: [{ productId: product.id, quantity, price: product.sellingPrice, discount: 0 }],
      },
    },
  });

  revalidatePath("/orders");
  redirect(`/product/${productId}/order/success?order=${order.id}`);
}
