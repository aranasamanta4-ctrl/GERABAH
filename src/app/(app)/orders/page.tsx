import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentBusiness } from "@/lib/current-user";
import { daysFromNow } from "@/lib/date-range";
import { orderStatusLabel } from "@/lib/labels";
import { formatIDR, formatDate } from "@/lib/format";
import { PageHeader } from "@/components/page-header";
import { EmptyState, List, Pill, Row } from "@/components/ui";
import { IconPlus } from "@/components/icons";

const FILTERS = [
  { key: "all", label: "Semua" },
  { key: "due", label: "Jatuh Tempo" },
  { key: "unpaid", label: "Belum Lunas" },
  { key: "processing", label: "Diproses" },
  { key: "completed", label: "Selesai" },
];

const TONE: Record<string, "positive" | "negative" | "warning" | "neutral"> = {
  New: "neutral",
  Confirmed: "warning",
  Processing: "warning",
  Ready: "positive",
  Completed: "positive",
  Cancelled: "neutral",
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
  const activeFilter = filter ?? "all";

  const filtered = orders.filter((o) => {
    switch (activeFilter) {
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

  const outstanding = orders
    .filter((o) => o.status !== "Cancelled")
    .reduce((s, o) => s + o.remainingPayment, 0);

  return (
    <>
      <PageHeader
        title="Pesanan"
        subtitle={outstanding > 0 ? `${formatIDR(outstanding)} belum tertagih` : "Pesanan yang sedang dikerjakan"}
        action={
          <Link
            href="/orders/new"
            aria-label="Tambah pesanan"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-terracotta text-white active:bg-terracotta-dark"
          >
            <IconPlus className="h-5 w-5" strokeWidth={2.2} />
          </Link>
        }
      />

      <div className="no-scrollbar -mx-4 mb-4 flex gap-1.5 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={f.key === "all" ? "/orders" : `/orders?filter=${f.key}`}
            className={`shrink-0 rounded-full px-3.5 py-2 text-[13px] font-medium ${
              activeFilter === f.key
                ? "bg-charcoal text-cream"
                : "border border-border bg-card text-muted active:bg-sand"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title={activeFilter === "all" ? "Belum ada pesanan" : "Tidak ada yang cocok"}
          body={
            activeFilter === "all"
              ? "Pakai pesanan untuk barang yang dikerjakan dulu dan dibayar belakangan, supaya DP dan sisa tagihan terpantau."
              : "Coba pilih penyaring lain untuk melihat pesanan yang tersedia."
          }
          actionLabel={activeFilter === "all" ? "Catat Pesanan" : undefined}
          actionHref={activeFilter === "all" ? "/orders/new" : undefined}
        />
      ) : (
        <List>
          {filtered.map((o) => (
            <Row
              key={o.id}
              href={`/orders/${o.id}`}
              title={o.items.map((i) => i.product.name).join(", ") || "Pesanan"}
              meta={`${o.customer?.name ?? "Tanpa nama"} · ${
                o.dueDate ? `Tempo ${formatDate(o.dueDate)}` : "Tanpa jatuh tempo"
              }`}
              amount={formatIDR(o.total)}
              trailing={<Pill tone={TONE[o.status] ?? "neutral"}>{orderStatusLabel(o.status)}</Pill>}
            />
          ))}
        </List>
      )}
    </>
  );
}
