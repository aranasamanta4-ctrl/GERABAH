import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentBusiness } from "@/lib/current-user";
import { customerTypeLabel } from "@/lib/labels";
import { formatIDR, formatIDRCompact, formatDate } from "@/lib/format";
import { PageHeader } from "@/components/page-header";
import { Card, List, Row, SectionTitle, Stat } from "@/components/ui";

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const business = await getCurrentBusiness();
  if (!business) return null;

  const customer = await prisma.customer.findFirst({
    where: { id, businessId: business.id },
    include: {
      sales: {
        include: { items: { include: { product: true } } },
        orderBy: { date: "desc" },
      },
    },
  });
  if (!customer) notFound();

  const spent = customer.sales.reduce((s, sale) => s + sale.amountPaid, 0);
  const outstanding = customer.sales.reduce((s, sale) => s + sale.outstandingBalance, 0);
  const lastPurchase = customer.sales[0]?.date;

  return (
    <>
      <PageHeader
        title={customer.name}
        subtitle={[customer.phone, customerTypeLabel(customer.type)].filter(Boolean).join(" · ")}
        back="/customers"
      />

      <div className="grid grid-cols-3 gap-2.5">
        <Stat label="Transaksi" value={String(customer.sales.length)} />
        <Stat label="Total Belanja" value={formatIDRCompact(spent)} exact={formatIDR(spent)} />
        <Stat
          label="Piutang"
          value={formatIDRCompact(outstanding)}
          exact={formatIDR(outstanding)}
          tone={outstanding > 0 ? "negative" : "neutral"}
        />
      </div>

      {(customer.address || customer.email || lastPurchase) && (
        <>
          <SectionTitle>Kontak</SectionTitle>
          <Card>
            <div className="flex flex-col gap-2.5 text-[13px]">
              {customer.phone && (
                <div className="flex justify-between gap-4">
                  <span className="text-muted">Nomor HP</span>
                  <a href={`tel:${customer.phone}`} className="font-medium text-terracotta">
                    {customer.phone}
                  </a>
                </div>
              )}
              {customer.email && (
                <div className="flex justify-between gap-4">
                  <span className="text-muted">Email</span>
                  <span className="truncate font-medium text-charcoal">{customer.email}</span>
                </div>
              )}
              {customer.address && (
                <div className="flex justify-between gap-4">
                  <span className="shrink-0 text-muted">Alamat</span>
                  <span className="text-right font-medium text-charcoal">{customer.address}</span>
                </div>
              )}
              {lastPurchase && (
                <div className="flex justify-between gap-4">
                  <span className="text-muted">Pembelian terakhir</span>
                  <span className="font-medium text-charcoal">{formatDate(lastPurchase)}</span>
                </div>
              )}
            </div>
          </Card>
        </>
      )}

      <SectionTitle>Riwayat Pembelian</SectionTitle>
      {customer.sales.length === 0 ? (
        <Card>
          <p className="text-[13px] text-muted">Belum ada transaksi dari pelanggan ini.</p>
        </Card>
      ) : (
        <List>
          {customer.sales.map((s) => (
            <Row
              key={s.id}
              href={`/sales/${s.id}`}
              title={s.items.map((i) => i.product.name).join(", ") || "Penjualan"}
              meta={formatDate(s.date)}
              amount={formatIDR(s.total)}
              amountTone={s.outstandingBalance > 0 ? "negative" : "neutral"}
            />
          ))}
        </List>
      )}
    </>
  );
}
