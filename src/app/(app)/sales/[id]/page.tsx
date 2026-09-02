import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentBusiness } from "@/lib/current-user";
import { markSalePaid } from "@/lib/actions/sales";
import { paymentStatusLabel } from "@/lib/labels";
import { formatIDR, formatDateTime, invoiceNumber } from "@/lib/format";
import { PageHeader } from "@/components/page-header";
import { Card, Pill, SectionTitle } from "@/components/ui";
import { InvoiceActions } from "@/components/invoice-actions";

const TONE: Record<string, "positive" | "negative" | "warning" | "neutral"> = {
  Paid: "positive",
  Unpaid: "negative",
  "Partially Paid": "warning",
  Cancelled: "neutral",
};

export default async function SaleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const business = await getCurrentBusiness();
  if (!business) return null;

  const sale = await prisma.sale.findFirst({
    where: { id, businessId: business.id },
    include: {
      customer: true,
      channel: true,
      paymentMethod: true,
      items: { include: { product: true } },
    },
  });
  if (!sale) notFound();

  const markPaid = markSalePaid.bind(null, sale.id);
  const number = invoiceNumber("INV", sale.id, sale.date);

  return (
    <>
      <PageHeader title="Detail Penjualan" subtitle={formatDateTime(sale.date)} back="/sales" />

      <Card>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="label">Nomor Invoice</p>
            <p className="tnum truncate text-[15px] font-semibold text-charcoal">{number}</p>
          </div>
          <Pill tone={TONE[sale.paymentStatus] ?? "neutral"}>{paymentStatusLabel(sale.paymentStatus)}</Pill>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-3.5 text-[13px]">
          <div>
            <span className="label block">Pelanggan</span>
            <span className="font-medium text-charcoal">{sale.customer?.name ?? "Pelanggan umum"}</span>
          </div>
          <div>
            <span className="label block">Tempat Jualan</span>
            <span className="font-medium text-charcoal">{sale.channel?.name ?? "-"}</span>
          </div>
        </div>

        <div className="mt-4 border-t border-border pt-3.5">
          {sale.items.map((item) => (
            <div key={item.id} className="flex items-baseline justify-between gap-3 py-1.5">
              <span className="min-w-0 text-[14px] text-charcoal">
                <span className="font-medium">{item.product.name}</span>
                <span className="text-muted"> × {item.quantity}</span>
              </span>
              <span className="tnum shrink-0 text-[14px] font-medium">{formatIDR(item.lineTotal)}</span>
            </div>
          ))}
        </div>

        <div className="mt-3 border-t border-border pt-3.5">
          <div className="flex justify-between py-1 text-[13px] text-muted">
            <span>Subtotal</span>
            <span className="tnum">{formatIDR(sale.subtotal)}</span>
          </div>
          {sale.discount > 0 && (
            <div className="flex justify-between py-1 text-[13px] text-muted">
              <span>Diskon</span>
              <span className="tnum">−{formatIDR(sale.discount)}</span>
            </div>
          )}
          <div className="mt-1 flex items-baseline justify-between border-t border-border pt-3">
            <span className="text-[15px] font-bold text-charcoal">Total</span>
            <span className="tnum text-[19px] font-bold text-charcoal">{formatIDR(sale.total)}</span>
          </div>
          <div className="flex justify-between py-1 text-[13px] text-muted">
            <span>Sudah dibayar</span>
            <span className="tnum">{formatIDR(sale.amountPaid)}</span>
          </div>
          <div className="flex justify-between py-1 text-[14px] font-semibold">
            <span className={sale.outstandingBalance > 0 ? "text-terracotta" : "text-sage"}>Sisa tagihan</span>
            <span className={`tnum ${sale.outstandingBalance > 0 ? "text-terracotta" : "text-sage"}`}>
              {formatIDR(sale.outstandingBalance)}
            </span>
          </div>
        </div>

        {sale.notes && (
          <p className="mt-4 border-t border-border pt-3.5 text-[13px] text-muted">Catatan: {sale.notes}</p>
        )}

        {sale.outstandingBalance > 0 && (
          <form action={markPaid} className="mt-4 border-t border-border pt-4">
            <button type="submit" className="btn btn-primary w-full">
              Tandai Lunas
            </button>
          </form>
        )}
      </Card>

      <SectionTitle>Invoice</SectionTitle>
      <Card>
        <p className="mb-3.5 text-[13px] leading-relaxed text-muted">
          Buat invoice PDF berisi rincian barang, total, dan terbilang. Bisa dikirim ke pembeli lewat WhatsApp atau
          disimpan sebagai bukti transaksi.
        </p>
        <InvoiceActions url={`/api/invoice/sale/${sale.id}`} filename={`Invoice-${number.replace(/\//g, "-")}.pdf`} />
      </Card>
    </>
  );
}
