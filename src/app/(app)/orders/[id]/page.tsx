import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentBusiness } from "@/lib/current-user";
import { advanceOrderStatus, recordOrderPayment } from "@/lib/actions/orders";
import { orderStatusLabel } from "@/lib/labels";
import { formatIDR, formatDate, formatDateTime, invoiceNumber } from "@/lib/format";
import { PageHeader } from "@/components/page-header";
import { Card, Pill, SectionTitle } from "@/components/ui";
import { InvoiceActions } from "@/components/invoice-actions";

const STATUS_FLOW = ["New", "Confirmed", "Processing", "Ready", "Completed"];

const STATUS_TONE: Record<string, "positive" | "negative" | "warning" | "neutral"> = {
  New: "neutral",
  Confirmed: "warning",
  Processing: "warning",
  Ready: "positive",
  Completed: "positive",
  Cancelled: "neutral",
};

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const business = await getCurrentBusiness();
  if (!business) return null;

  const order = await prisma.order.findFirst({
    where: { id, businessId: business.id },
    include: { customer: true, channel: true, items: { include: { product: true } }, sale: true },
  });
  if (!order) notFound();

  const orderId = order.id;
  const currentIndex = STATUS_FLOW.indexOf(order.status);
  const nextStatus = currentIndex >= 0 && currentIndex < STATUS_FLOW.length - 1 ? STATUS_FLOW[currentIndex + 1] : null;
  const number = invoiceNumber("ORD", order.id, order.date);
  const isOpen = order.status !== "Completed" && order.status !== "Cancelled";

  async function advance(next: string) {
    "use server";
    await advanceOrderStatus(orderId, next);
  }

  async function cancelOrder() {
    "use server";
    await advanceOrderStatus(orderId, "Cancelled");
  }

  async function payRemaining(formData: FormData) {
    "use server";
    await recordOrderPayment(orderId, Number(formData.get("amount") ?? 0));
  }

  return (
    <>
      <PageHeader title="Detail Pesanan" subtitle={formatDateTime(order.date)} back="/orders" />

      <Card>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="label">Nomor Pesanan</p>
            <p className="tnum truncate text-[15px] font-semibold text-charcoal">{number}</p>
          </div>
          <Pill tone={STATUS_TONE[order.status] ?? "neutral"}>{orderStatusLabel(order.status)}</Pill>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-3.5 text-[13px]">
          <div>
            <span className="label block">Pelanggan</span>
            <span className="font-medium text-charcoal">{order.customer?.name ?? "Belum ada nama"}</span>
          </div>
          <div>
            <span className="label block">Jatuh Tempo</span>
            <span className="font-medium text-charcoal">
              {order.dueDate ? formatDate(order.dueDate) : "Tidak ditentukan"}
            </span>
          </div>
        </div>

        <div className="mt-4 border-t border-border pt-3.5">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-baseline justify-between gap-3 py-1.5">
              <span className="min-w-0 text-[14px] text-charcoal">
                <span className="font-medium">{item.product.name}</span>
                <span className="text-muted"> × {item.quantity}</span>
              </span>
              <span className="tnum shrink-0 text-[14px] font-medium">
                {formatIDR(item.quantity * item.price - item.discount)}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-3 border-t border-border pt-3.5">
          <div className="flex items-baseline justify-between">
            <span className="text-[15px] font-bold text-charcoal">Total</span>
            <span className="tnum text-[19px] font-bold text-charcoal">{formatIDR(order.total)}</span>
          </div>
          <div className="flex justify-between py-1 text-[13px] text-muted">
            <span>DP / sudah dibayar</span>
            <span className="tnum">{formatIDR(order.total - order.remainingPayment)}</span>
          </div>
          <div className="flex justify-between py-1 text-[14px] font-semibold">
            <span className={order.remainingPayment > 0 ? "text-terracotta" : "text-sage"}>Sisa pembayaran</span>
            <span className={`tnum ${order.remainingPayment > 0 ? "text-terracotta" : "text-sage"}`}>
              {formatIDR(order.remainingPayment)}
            </span>
          </div>
        </div>

        {order.notes && (
          <p className="mt-4 border-t border-border pt-3.5 text-[13px] text-muted">Catatan: {order.notes}</p>
        )}

        {order.status === "Completed" && order.sale && (
          <p className="mt-4 border-t border-border pt-3.5 text-[13px] text-sage">
            Pesanan selesai. Penjualan sudah tercatat otomatis.
          </p>
        )}
      </Card>

      {order.remainingPayment > 0 && order.status !== "Cancelled" && (
        <>
          <SectionTitle>Catat Pembayaran</SectionTitle>
          <Card>
            <form action={payRemaining} className="flex flex-col gap-3">
              <label className="block">
                <span className="label mb-1.5 block">Jumlah diterima (Rp)</span>
                <input
                  name="amount"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={order.remainingPayment}
                  placeholder={String(Math.round(order.remainingPayment))}
                  required
                  className="field tnum"
                />
              </label>
              <button type="submit" className="btn btn-primary w-full">
                Simpan Pembayaran
              </button>
            </form>
          </Card>
        </>
      )}

      {isOpen && (
        <>
          <SectionTitle>Status Pesanan</SectionTitle>
          <Card>
            <div className="flex flex-col gap-2.5">
              {nextStatus && (
                <form action={advance.bind(null, nextStatus)}>
                  <button type="submit" className="btn btn-primary w-full">
                    Tandai {orderStatusLabel(nextStatus)}
                  </button>
                </form>
              )}
              <form action={cancelOrder}>
                <button type="submit" className="btn btn-secondary w-full text-muted">
                  Batalkan Pesanan
                </button>
              </form>
            </div>
          </Card>
        </>
      )}

      <SectionTitle>Nota Pesanan</SectionTitle>
      <Card>
        <p className="mb-3.5 text-[13px] leading-relaxed text-muted">
          Cetak nota PDF berisi rincian pesanan, DP, sisa pembayaran, dan tanggal jatuh tempo untuk diberikan ke
          pemesan.
        </p>
        <InvoiceActions
          url={`/api/invoice/order/${order.id}`}
          filename={`Nota-${number.replace(/\//g, "-")}.pdf`}
        />
      </Card>
    </>
  );
}
