import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { seedBusinessDefaults } from "@/lib/seed-defaults";

const schema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  location: z.string().optional(),
});

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Belum login." }, { status: 401 });
  }

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Data tidak valid." }, { status: 400 });
  }

  try {
    let business = await prisma.business.findFirst({ where: { ownerId: session.userId } });
    if (!business) {
      business = await prisma.business.create({
        data: {
          ownerId: session.userId,
          name: parsed.data.name,
          description: parsed.data.description,
          location: parsed.data.location,
        },
      });
    }

    // idempotent — aman diulang kalau langkah ini gagal separuh jalan
    await seedBusinessDefaults(business.id);

    return NextResponse.json({ id: business.id });
  } catch (err) {
    console.error("POST /api/business gagal:", err);
    const message = err instanceof Error ? err.message : "Gagal membuat usaha.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
