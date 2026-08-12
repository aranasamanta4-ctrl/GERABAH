"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { getCurrentBusiness } from "@/lib/current-user";

async function findOrCreatePaymentMethod(businessId: string, name: string) {
  const trimmed = name.trim();
  if (!trimmed) return null;
  const existing = await prisma.paymentMethod.findFirst({ where: { businessId, name: trimmed } });
  if (existing) return existing.id;
  const created = await prisma.paymentMethod.create({ data: { businessId, name: trimmed } });
  return created.id;
}

async function findOrCreateIncomeCategory(businessId: string, name: string) {
  const trimmed = name.trim();
  if (!trimmed) return null;
  const existing = await prisma.incomeCategory.findFirst({ where: { businessId, name: trimmed } });
  if (existing) return existing.id;
  const created = await prisma.incomeCategory.create({ data: { businessId, name: trimmed } });
  return created.id;
}

async function findOrCreateExpenseCategory(businessId: string, name: string) {
  const trimmed = name.trim();
  if (!trimmed) return null;
  const existing = await prisma.expenseCategory.findFirst({ where: { businessId, name: trimmed } });
  if (existing) return existing.id;
  const created = await prisma.expenseCategory.create({ data: { businessId, name: trimmed } });
  return created.id;
}

export async function createFinancialTransaction(formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/login");
  const business = await getCurrentBusiness();
  if (!business) redirect("/onboarding");

  const type = String(formData.get("type") ?? "EXPENSE");
  const categoryName = String(formData.get("category") ?? "");
  const description = String(formData.get("description") ?? "");
  const amount = Number(formData.get("amount") ?? 0);
  const paymentMethodName = String(formData.get("paymentMethod") ?? "");
  const reference = String(formData.get("reference") ?? "");
  const notes = String(formData.get("notes") ?? "");
  const dateValue = String(formData.get("date") ?? "");

  if (!amount || amount <= 0) throw new Error("Jumlah harus lebih dari 0.");

  const paymentMethodId = paymentMethodName
    ? await findOrCreatePaymentMethod(business.id, paymentMethodName)
    : null;

  const incomeCategoryId =
    type === "INCOME" && categoryName ? await findOrCreateIncomeCategory(business.id, categoryName) : null;
  const expenseCategoryId =
    type === "EXPENSE" && categoryName ? await findOrCreateExpenseCategory(business.id, categoryName) : null;

  await prisma.financialTransaction.create({
    data: {
      businessId: business.id,
      type,
      incomeCategoryId: incomeCategoryId ?? undefined,
      expenseCategoryId: expenseCategoryId ?? undefined,
      description: description || undefined,
      amount,
      paymentMethodId: paymentMethodId ?? undefined,
      reference: reference || undefined,
      notes: notes || undefined,
      date: dateValue ? new Date(dateValue) : new Date(),
    },
  });

  revalidatePath("/finance");
  revalidatePath("/dashboard");
  redirect("/finance");
}
