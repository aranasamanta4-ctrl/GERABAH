"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { getCurrentBusiness } from "@/lib/current-user";
import { saveUploadedFile } from "@/lib/upload";

async function requireBusiness() {
  const session = await getSession();
  if (!session) redirect("/login");
  const business = await getCurrentBusiness();
  if (!business) redirect("/onboarding");
  return business;
}

async function findOrCreateCategory(businessId: string, name: string) {
  const trimmed = name.trim();
  if (!trimmed) return null;
  const existing = await prisma.productCategory.findFirst({
    where: { businessId, name: trimmed },
  });
  if (existing) return existing.id;
  const created = await prisma.productCategory.create({
    data: { businessId, name: trimmed },
  });
  return created.id;
}

export async function createProduct(formData: FormData) {
  const business = await requireBusiness();

  const name = String(formData.get("name") ?? "").trim();
  const categoryName = String(formData.get("category") ?? "");
  const description = String(formData.get("description") ?? "");
  const material = String(formData.get("material") ?? "");
  const sellingPrice = Number(formData.get("sellingPrice") ?? 0);
  const stock = Number(formData.get("stock") ?? 0);
  const minStock = Number(formData.get("minStock") ?? 0);
  const photoFile = formData.get("photo") as File | null;

  const materialCost = Number(formData.get("materialCost") ?? 0);
  const laborCost = Number(formData.get("laborCost") ?? 0);
  const packagingCost = Number(formData.get("packagingCost") ?? 0);
  const otherCost = Number(formData.get("otherCost") ?? 0);

  if (!name || !sellingPrice) {
    throw new Error("Nama produk dan harga jual wajib diisi.");
  }

  const categoryId = categoryName ? await findOrCreateCategory(business.id, categoryName) : null;
  const photoUrl = await saveUploadedFile(photoFile);

  const product = await prisma.product.create({
    data: {
      businessId: business.id,
      name,
      categoryId: categoryId ?? undefined,
      description: description || undefined,
      material: material || undefined,
      sellingPrice,
      stock,
      minStock,
      photoUrl: photoUrl || undefined,
      status: stock > 0 ? "active" : "out_of_stock",
      costComponents: {
        create: [
          { label: "Material Cost", amount: materialCost },
          { label: "Labor Cost", amount: laborCost },
          { label: "Packaging Cost", amount: packagingCost },
          { label: "Other Cost", amount: otherCost },
        ].filter((c) => c.amount > 0),
      },
    },
  });

  revalidatePath("/products");
  redirect(`/products/${product.id}`);
}

export async function adjustProductStock(formData: FormData) {
  await requireBusiness();

  const productId = String(formData.get("productId") ?? "");
  const delta = Number(formData.get("delta") ?? 0);
  if (!productId || !delta) return;

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new Error("Produk tidak ditemukan.");

  const newStock = Math.max(product.stock + delta, 0);

  await prisma.product.update({
    where: { id: productId },
    data: {
      stock: newStock,
      status: product.status === "inactive" ? "inactive" : newStock <= 0 ? "out_of_stock" : "active",
    },
  });

  revalidatePath("/products");
  revalidatePath(`/products/${productId}`);
}

export async function productHasHistory(productId: string) {
  const [saleItemCount, orderItemCount, postCount] = await Promise.all([
    prisma.saleItem.count({ where: { productId } }),
    prisma.orderItem.count({ where: { productId } }),
    prisma.post.count({ where: { productId } }),
  ]);
  return saleItemCount > 0 || orderItemCount > 0 || postCount > 0;
}

export async function deleteProduct(productId: string) {
  await requireBusiness();

  if (await productHasHistory(productId)) {
    // Product has sales/order/community history — hard delete would break those
    // records' referential integrity, so archive it instead.
    await prisma.product.update({ where: { id: productId }, data: { status: "inactive" } });
    revalidatePath("/products");
    redirect("/products");
  }

  await prisma.product.delete({ where: { id: productId } });
  revalidatePath("/products");
  redirect("/products");
}
