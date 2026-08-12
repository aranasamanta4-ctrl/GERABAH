import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order: orderId } = await searchParams;

  const order = orderId
    ? await prisma.order.findUnique({
        where: { id: orderId },
        include: { business: true, items: { include: { product: true } } },
      })
    : null;

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
        <div className="mb-4 text-4xl">🎉</div>
        <h1 className="mb-2 font-serif text-xl font-semibold text-charcoal">
          Pesanan Terkirim{order?.business ? ` ke ${order.business.name}` : ""}
        </h1>
        {order && (
          <p className="mb-6 text-sm text-charcoal/60">
            {order.items.map((i) => i.product.name).join(", ")} · Ref #{order.id.slice(-6)}
          </p>
        )}
        <div className="flex flex-col gap-2">
          <Link
            href="/explore"
            className="rounded-full bg-terracotta px-5 py-2.5 text-sm font-medium text-white hover:bg-terracotta-dark"
          >
            Lanjut Jelajahi
          </Link>
          <Link href="/orders" className="rounded-full border border-border px-5 py-2.5 text-sm font-medium text-charcoal hover:bg-beige/50">
            Lihat Pesanan Saya
          </Link>
        </div>
      </div>
    </div>
  );
}
