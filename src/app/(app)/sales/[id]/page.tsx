import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { markSalePaid } from "@/lib/actions/sales";
import { paymentStatusLabel } from "@/lib/labels";

function formatIDR(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

export default async function SaleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const sale = await prisma.sale.findUnique({
    where: { id },
    include: {
      customer: true,
      channel: true,
      paymentMethod: true,
      items: { include: { product: true } },
    },
  });
  if (!sale) notFound();

  const markPaid = markSalePaid.bind(null, sale.id);

  return (
    <div className="mx-auto max-w-xl p-6 sm:p-8">
      <h1 className="mb-1 font-serif text-2xl font-semibold text-charcoal">Detail Penjualan</h1>
      <p className="mb-6 text-sm text-charcoal/50">{sale.date.toLocaleString("id-ID")}</p>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm text-charcoal/60">Pelanggan</span>
          <span className="text-sm font-medium text-charcoal">{sale.customer?.name ?? "Tanpa nama"}</span>
        </div>
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm text-charcoal/60">Channel</span>
          <span className="text-sm font-medium text-charcoal">{sale.channel?.name ?? "-"}</span>
        </div>

        <div className="mb-4 border-t border-border pt-4">
          {sale.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between text-sm">
              <span className="text-charcoal/70">
                {item.product.name} × {item.quantity}
              </span>
              <span className="text-charcoal">{formatIDR(item.lineTotal)}</span>
            </div>
          ))}
        </div>

        <div className="space-y-1 border-t border-border pt-4 text-sm">
          <div className="flex justify-between text-charcoal/60">
            <span>Subtotal</span>
            <span>{formatIDR(sale.subtotal)}</span>
          </div>
          <div className="flex justify-between text-charcoal/60">
            <span>Diskon</span>
            <span>-{formatIDR(sale.discount)}</span>
          </div>
          <div className="flex justify-between text-base font-semibold text-charcoal">
            <span>Total</span>
            <span>{formatIDR(sale.total)}</span>
          </div>
          <div className="flex justify-between text-charcoal/60">
            <span>Dibayar</span>
            <span>{formatIDR(sale.amountPaid)}</span>
          </div>
          <div className="flex justify-between font-medium text-terracotta">
            <span>Sisa Tagihan</span>
            <span>{formatIDR(sale.outstandingBalance)}</span>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              sale.paymentStatus === "Paid"
                ? "bg-sage/15 text-sage"
                : sale.paymentStatus === "Unpaid"
                ? "bg-red-100 text-red-600"
                : "bg-amber-100 text-amber-700"
            }`}
          >
            {paymentStatusLabel(sale.paymentStatus)}
          </span>
          {sale.outstandingBalance > 0 && (
            <form action={markPaid}>
              <button
                type="submit"
                className="rounded-full bg-terracotta px-4 py-2 text-sm font-medium text-white hover:bg-terracotta-dark"
              >
                Tandai Lunas
              </button>
            </form>
          )}
        </div>

        {sale.notes && <p className="mt-4 text-sm text-charcoal/60">Catatan: {sale.notes}</p>}
      </div>
    </div>
  );
}
