import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { advanceOrderStatus, recordOrderPayment } from "@/lib/actions/orders";
import { orderStatusLabel } from "@/lib/labels";

function formatIDR(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

const STATUS_FLOW = ["New", "Confirmed", "Processing", "Ready", "Completed"];

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: { customer: true, channel: true, items: { include: { product: true } }, sale: true },
  });
  if (!order) notFound();

  const currentIndex = STATUS_FLOW.indexOf(order.status);
  const nextStatus = currentIndex >= 0 && currentIndex < STATUS_FLOW.length - 1 ? STATUS_FLOW[currentIndex + 1] : null;

  async function advance(nextStatus: string) {
    "use server";
    await advanceOrderStatus(order!.id, nextStatus);
  }

  async function cancelOrder() {
    "use server";
    await advanceOrderStatus(order!.id, "Cancelled");
  }

  async function payRemaining(formData: FormData) {
    "use server";
    const amount = Number(formData.get("amount") ?? 0);
    await recordOrderPayment(order!.id, amount);
  }

  return (
    <div className="mx-auto max-w-xl p-6 sm:p-8">
      <div className="mb-1 flex items-center justify-between">
        <h1 className="font-serif text-2xl font-semibold text-charcoal">Detail Pesanan</h1>
        <span className="rounded-full bg-beige px-3 py-1 text-xs font-medium text-clay">{orderStatusLabel(order.status)}</span>
      </div>
      <p className="mb-6 text-sm text-charcoal/50">{order.date.toLocaleString("id-ID")}</p>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between text-sm">
          <span className="text-charcoal/60">Pelanggan</span>
          <span className="font-medium text-charcoal">{order.customer?.name ?? "Belum ada nama"}</span>
        </div>
        <div className="mb-4 flex items-center justify-between text-sm">
          <span className="text-charcoal/60">Channel</span>
          <span className="font-medium text-charcoal">{order.channel?.name ?? "-"}</span>
        </div>
        <div className="mb-4 flex items-center justify-between text-sm">
          <span className="text-charcoal/60">Jatuh Tempo</span>
          <span className="font-medium text-charcoal">
            {order.dueDate ? order.dueDate.toLocaleDateString("id-ID") : "-"}
          </span>
        </div>

        <div className="mb-4 border-t border-border pt-4">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between text-sm">
              <span className="text-charcoal/70">
                {item.product.name} × {item.quantity}
              </span>
              <span className="text-charcoal">{formatIDR(item.quantity * item.price - item.discount)}</span>
            </div>
          ))}
        </div>

        <div className="space-y-1 border-t border-border pt-4 text-sm">
          <div className="flex justify-between text-base font-semibold text-charcoal">
            <span>Total</span>
            <span>{formatIDR(order.total)}</span>
          </div>
          <div className="flex justify-between text-charcoal/60">
            <span>DP / Dibayar</span>
            <span>{formatIDR(order.total - order.remainingPayment)}</span>
          </div>
          <div className="flex justify-between font-medium text-terracotta">
            <span>Sisa Pembayaran</span>
            <span>{formatIDR(order.remainingPayment)}</span>
          </div>
        </div>

        {order.remainingPayment > 0 && order.status !== "Cancelled" && (
          <form action={payRemaining} className="mt-4 flex items-end gap-2 border-t border-border pt-4">
            <div className="flex-1">
              <label className="mb-1 block text-xs text-charcoal/60">Catat Pembayaran (Rp)</label>
              <input
                name="amount"
                type="number"
                min={1}
                max={order.remainingPayment}
                required
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-terracotta"
              />
            </div>
            <button
              type="submit"
              className="rounded-full border border-border px-4 py-2 text-sm font-medium text-charcoal hover:bg-beige/50"
            >
              Simpan
            </button>
          </form>
        )}

        {order.status !== "Completed" && order.status !== "Cancelled" && (
          <div className="mt-6 flex flex-wrap gap-3 border-t border-border pt-4">
            {nextStatus && (
              <form action={advance.bind(null, nextStatus)}>
                <button
                  type="submit"
                  className="rounded-full bg-terracotta px-4 py-2 text-sm font-medium text-white hover:bg-terracotta-dark"
                >
                  Tandai {orderStatusLabel(nextStatus)}
                </button>
              </form>
            )}
            <form action={cancelOrder}>
              <button
                type="submit"
                className="rounded-full border border-border px-4 py-2 text-sm font-medium text-charcoal/70 hover:bg-beige/60"
              >
                Batalkan Pesanan
              </button>
            </form>
          </div>
        )}

        {order.status === "Completed" && order.sale && (
          <p className="mt-4 border-t border-border pt-4 text-sm text-sage">
            Pesanan selesai → Penjualan tercatat.
          </p>
        )}

        {order.notes && <p className="mt-4 text-sm text-charcoal/60">Catatan: {order.notes}</p>}
      </div>
    </div>
  );
}
