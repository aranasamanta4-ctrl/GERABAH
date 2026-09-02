import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentBusiness } from "@/lib/current-user";
import { paymentStatusLabel } from "@/lib/labels";
import { formatIDR, formatDate } from "@/lib/format";
import { PageHeader } from "@/components/page-header";
import { EmptyState, List, Pill, Row } from "@/components/ui";
import { IconPlus } from "@/components/icons";

const TONE: Record<string, "positive" | "negative" | "warning" | "neutral"> = {
  Paid: "positive",
  Unpaid: "negative",
  "Partially Paid": "warning",
  Cancelled: "neutral",
};

export default async function SalesPage() {
  const business = await getCurrentBusiness();
  if (!business) return null;

  const sales = await prisma.sale.findMany({
    where: { businessId: business.id },
    include: { customer: true, channel: true, items: { include: { product: true } } },
    orderBy: { date: "desc" },
  });

  const total = sales.reduce((s, x) => s + x.total, 0);

  return (
    <>
      <PageHeader
        title="Penjualan"
        subtitle={sales.length > 0 ? `${sales.length} transaksi · ${formatIDR(total)}` : "Barang yang sudah terjual"}
        action={
          <Link
            href="/sales/new"
            aria-label="Tambah penjualan"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-terracotta text-white active:bg-terracotta-dark"
          >
            <IconPlus className="h-5 w-5" strokeWidth={2.2} />
          </Link>
        }
      />

      {sales.length === 0 ? (
        <EmptyState
          title="Belum ada penjualan"
          body="Catat penjualan supaya stok produk berkurang otomatis dan uang masuk langsung tercatat di keuangan."
          actionLabel="Catat Penjualan"
          actionHref="/sales/new"
        />
      ) : (
        <List>
          {sales.map((s) => (
            <Row
              key={s.id}
              href={`/sales/${s.id}`}
              title={s.items.map((i) => i.product.name).join(", ") || "Penjualan"}
              meta={`${formatDate(s.date)} · ${s.customer?.name ?? "Pelanggan umum"}`}
              amount={formatIDR(s.total)}
              trailing={
                s.paymentStatus !== "Paid" ? (
                  <Pill tone={TONE[s.paymentStatus] ?? "neutral"}>{paymentStatusLabel(s.paymentStatus)}</Pill>
                ) : undefined
              }
            />
          ))}
        </List>
      )}
    </>
  );
}
