"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { getCurrentBusiness } from "@/lib/current-user";
import { saveUploadedFile } from "@/lib/upload";

const POST_TYPES = ["Karya", "Produk", "Di Balik Layar", "Inspirasi", "Cerita"];

export async function createPost(formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/login");
  const business = await getCurrentBusiness();
  if (!business) redirect("/onboarding");

  const mediaFile = formData.get("media") as File | null;
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "");
  const category = String(formData.get("category") ?? "");
  const material = String(formData.get("material") ?? "");
  const type = String(formData.get("type") ?? "Creation");
  const productId = String(formData.get("productId") ?? "") || null;

  if (!title) throw new Error("Judul wajib diisi.");
  if (!POST_TYPES.includes(type)) throw new Error("Tipe post tidak valid.");

  const imageUrl = await saveUploadedFile(mediaFile);
  if (!imageUrl) throw new Error("Foto atau video wajib diunggah.");

  const post = await prisma.post.create({
    data: {
      businessId: business.id,
      authorId: session.userId,
      productId: productId ?? undefined,
      type,
      imageUrl,
      title,
      description: description || undefined,
      category: category || undefined,
      material: material || undefined,
    },
  });

  revalidatePath("/community");
  revalidatePath("/explore");
  redirect(`/community/${post.id}`);
}

export async function toggleLike(postId: string) {
  const session = await getSession();
  if (!session) redirect("/login");

  const existing = await prisma.postLike.findUnique({
    where: { postId_userId: { postId, userId: session.userId } },
  });

  if (existing) {
    await prisma.postLike.delete({ where: { id: existing.id } });
  } else {
    await prisma.postLike.create({ data: { postId, userId: session.userId } });
  }

  revalidatePath("/community");
  revalidatePath(`/community/${postId}`);
  revalidatePath("/explore");
}

export async function toggleSave(postId: string) {
  const session = await getSession();
  if (!session) redirect("/login");

  const existing = await prisma.postSave.findUnique({
    where: { postId_userId: { postId, userId: session.userId } },
  });

  if (existing) {
    await prisma.postSave.delete({ where: { id: existing.id } });
  } else {
    await prisma.postSave.create({ data: { postId, userId: session.userId } });
  }

  revalidatePath("/community");
  revalidatePath(`/community/${postId}`);
}

export async function addComment(formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/login");

  const postId = String(formData.get("postId") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  if (!postId || !body) return;

  await prisma.postComment.create({ data: { postId, userId: session.userId, body } });

  revalidatePath(`/community/${postId}`);
}
