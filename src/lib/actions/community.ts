"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function shareProductToCommunity(productId: string) {
  const session = await getSession();
  if (!session) redirect("/login");

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new Error("Produk tidak ditemukan.");

  await prisma.post.create({
    data: {
      businessId: product.businessId,
      authorId: session.userId,
      productId: product.id,
      type: "Produk",
      imageUrl: product.photoUrl ?? "",
      title: product.name,
      description: product.description ?? undefined,
      category: undefined,
      material: product.material ?? undefined,
    },
  });

  revalidatePath(`/products/${productId}`);
  revalidatePath("/community");
}
