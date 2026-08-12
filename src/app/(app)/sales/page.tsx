import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentBusiness } from "@/lib/current-user";
import { paymentStatusLabel } from "@/lib/labels";

function formatIDR(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

const STATUS_STYLES: Record<string, string> = {
  Paid: "bg-sage/15 text-sage",
  Unpaid: "bg-red-100 text-red-600",
  "Partially Paid": "bg-amber-100 text-amber-700",
  Cancelled: "bg-charcoal/10 text-charcoal/50",
};

export default async function SalesPage() {
  const business = await getCurrentBusiness();
  if (!business) return null;

  const sales = await prisma.sale.findMany({
    where: { businessId: business.id },
    include: { customer: true, channel: true, items: { include: { product: true } } },
    orderBy: { date: "desc" },
  });

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-serif text-2xl font-semibold text-charcoal">Penjualan</h1>
        <Link
          href="/sales/new"
          className="rounded-full bg-terracotta px-4 py-2 text-sm font-medium text-white hover:bg-terracotta-dark"
        >
          + Tambah Penjualan
        </Link>
      </div>

      {sales.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <p className="text-charcoal/60">Belum ada penjualan tercatat.</p>
          <Link
            href="/sales/new"
            className="mt-4 inline-block rounded-full bg-terracotta px-5 py-2 text-sm font-medium text-white hover:bg-terracotta-dark"
          >
            + Tambah Penjualan
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          {sales.map((s) => (
            <Link
              key={s.id}
              href={`/sales/${s.id}`}
              className="flex items-center justify-between border-b border-border bg-card px-4 py-3 text-sm last:border-b-0 hover:bg-beige/30"
            >
              <div>
                <p className="font-medium text-charcoal">
                  {s.items.map((i) => i.product.name).join(", ")}
                </p>
                <p className="text-xs text-charcoal/50">
                  {s.date.toLocaleDateString("id-ID")} · {s.customer?.name ?? "Tanpa nama"} ·{" "}
                  {s.channel?.name ?? "-"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-charcoal">{formatIDR(s.total)}</span>
                <span className={`rounded-full px-2 py-1 text-[10px] font-medium ${STATUS_STYLES[s.paymentStatus]}`}>
                  {paymentStatusLabel(s.paymentStatus)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
