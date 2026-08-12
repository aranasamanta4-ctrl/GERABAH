"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { getCurrentBusiness } from "@/lib/current-user";

export async function createCustomer(formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/login");
  const business = await getCurrentBusiness();
  if (!business) redirect("/onboarding");

  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const type = String(formData.get("type") ?? "New");

  if (!name) throw new Error("Nama pelanggan wajib diisi.");

  if (phone) {
    const existing = await prisma.customer.findFirst({ where: { businessId: business.id, phone } });
    if (existing) throw new Error(`Nomor ini sudah terdaftar atas nama ${existing.name}.`);
  }

  const customer = await prisma.customer.create({
    data: {
      businessId: business.id,
      name,
      phone: phone || undefined,
      email: email || undefined,
      address: address || undefined,
      type,
    },
  });

  revalidatePath("/customers");
  redirect(`/customers/${customer.id}`);
}
