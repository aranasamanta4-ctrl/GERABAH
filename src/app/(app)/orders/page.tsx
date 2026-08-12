import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentBusiness } from "@/lib/current-user";
import { daysFromNow } from "@/lib/date-range";
import { orderStatusLabel } from "@/lib/labels";

function formatIDR(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

const FILTERS = [
  { key: "all", label: "Semua" },
  { key: "due", label: "Segera Jatuh Tempo" },
  { key: "unpaid", label: "Belum Lunas" },
  { key: "processing", label: "Diproses" },
  { key: "completed", label: "Selesai" },
];

const STATUS_STYLES: Record<string, string> = {
  New: "bg-beige text-clay",
  Confirmed: "bg-amber-100 text-amber-700",
  Processing: "bg-amber-100 text-amber-700",
  Ready: "bg-sage/15 text-sage",
  Completed: "bg-sage/20 text-sage",
  Cancelled: "bg-charcoal/10 text-charcoal/50",
};

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter } = await searchParams;
  const business = await getCurrentBusiness();
  if (!business) return null;

  const orders = await prisma.order.findMany({
    where: { businessId: business.id },
    include: { customer: true, items: { include: { product: true } } },
    orderBy: { date: "desc" },
  });

  const soon = daysFromNow(3);

  const filtered = orders.filter((o) => {
    switch (filter) {
      case "due":
        return o.dueDate && o.dueDate <= soon && o.status !== "Completed";
      case "unpaid":
        return o.paymentStatus !== "Paid";
      case "processing":
        return o.status === "Processing" || o.status === "Confirmed";
      case "completed":
        return o.status === "Completed";
      default:
        return true;
    }
  });

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-serif text-2xl font-semibold text-charcoal">Pesanan</h1>
        <Link
          href="/orders/new"
          className="rounded-full bg-terracotta px-4 py-2 text-sm font-medium text-white hover:bg-terracotta-dark"
        >
          + Tambah Pesanan
        </Link>
      </div>

      <div className="mb-4 flex flex-wrap gap-1 border-b border-border">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={f.key === "all" ? "/orders" : `/orders?filter=${f.key}`}
            className={`border-b-2 px-3 py-2 text-sm font-medium ${
              (filter ?? "all") === f.key
                ? "border-terracotta text-terracotta"
                : "border-transparent text-charcoal/50 hover:text-charcoal"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <p className="text-charcoal/60">Belum ada order.</p>
          <p className="mt-1 text-xs text-charcoal/40">
            Pesanan akan otomatis muncul di sini saat pelanggan memesan dari Komunitas.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          {filtered.map((o) => (
            <Link
              key={o.id}
              href={`/orders/${o.id}`}
              className="flex items-center justify-between border-b border-border bg-card px-4 py-3 text-sm last:border-b-0 hover:bg-beige/30"
            >
              <div>
                <p className="font-medium text-charcoal">
                  {o.items.map((i) => i.product.name).join(", ")}
                </p>
                <p className="text-xs text-charcoal/50">
                  {o.customer?.name ?? "Tanpa nama"} ·{" "}
                  {o.dueDate ? `Jatuh tempo ${o.dueDate.toLocaleDateString("id-ID")}` : "Tanpa jatuh tempo"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-charcoal">{formatIDR(o.total)}</span>
                <span className={`rounded-full px-2 py-1 text-[10px] font-medium ${STATUS_STYLES[o.status]}`}>
                  {orderStatusLabel(o.status)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
