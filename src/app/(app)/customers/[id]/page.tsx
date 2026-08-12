import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { customerTypeLabel } from "@/lib/labels";

function formatIDR(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      sales: {
        include: { items: { include: { product: true } } },
        orderBy: { date: "desc" },
      },
      orders: { orderBy: { date: "desc" } },
    },
  });
  if (!customer) notFound();

  const totalSpending = customer.sales.reduce((s, sale) => s + sale.amountPaid, 0);
  const outstanding = customer.sales.reduce((s, sale) => s + sale.outstandingBalance, 0);
  const lastPurchase = customer.sales[0]?.date;

  return (
    <div className="mx-auto max-w-2xl p-6 sm:p-8">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-charcoal">{customer.name}</h1>
          <p className="text-sm text-charcoal/50">
            {customer.phone ?? "-"} {customer.email ? `· ${customer.email}` : ""}
          </p>
        </div>
        <span className="rounded-full bg-beige px-3 py-1 text-xs font-medium text-clay">{customerTypeLabel(customer.type)}</span>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl bg-beige/40 p-3">
          <p className="text-[11px] text-charcoal/50">Total Transaksi</p>
          <p className="text-lg font-semibold text-charcoal">{customer.sales.length}</p>
        </div>
        <div className="rounded-xl bg-beige/40 p-3">
          <p className="text-[11px] text-charcoal/50">Total Belanja</p>
          <p className="text-lg font-semibold text-charcoal">{formatIDR(totalSpending)}</p>
        </div>
        <div className="rounded-xl bg-beige/40 p-3">
          <p className="text-[11px] text-charcoal/50">Piutang</p>
          <p className={`text-lg font-semibold ${outstanding > 0 ? "text-terracotta" : "text-charcoal"}`}>
            {formatIDR(outstanding)}
          </p>
        </div>
        <div className="rounded-xl bg-beige/40 p-3">
          <p className="text-[11px] text-charcoal/50">Pembelian Terakhir</p>
          <p className="text-sm font-semibold text-charcoal">
            {lastPurchase ? lastPurchase.toLocaleDateString("id-ID") : "-"}
          </p>
        </div>
      </div>

      {customer.address && (
        <p className="mb-6 text-sm text-charcoal/60">Alamat: {customer.address}</p>
      )}

      <h2 className="mb-2 text-sm font-medium text-charcoal">Riwayat Pembelian</h2>
      {customer.sales.length === 0 ? (
        <p className="text-sm text-charcoal/50">Belum ada transaksi.</p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          {customer.sales.map((s) => (
            <div key={s.id} className="flex items-center justify-between border-b border-border bg-card px-4 py-3 text-sm last:border-b-0">
              <div>
                <p className="text-charcoal">{s.items.map((i) => i.product.name).join(", ")}</p>
                <p className="text-xs text-charcoal/50">{s.date.toLocaleDateString("id-ID")}</p>
              </div>
              <span className="font-medium text-charcoal">{formatIDR(s.total)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
