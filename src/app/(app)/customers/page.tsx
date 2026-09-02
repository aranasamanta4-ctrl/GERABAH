import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentBusiness } from "@/lib/current-user";
import { customerTypeLabel } from "@/lib/labels";
import { formatIDR } from "@/lib/format";
import { PageHeader } from "@/components/page-header";
import { EmptyState, List, Row } from "@/components/ui";
import { IconPlus } from "@/components/icons";

export default async function CustomersPage() {
  const business = await getCurrentBusiness();
  if (!business) return null;

  const customers = await prisma.customer.findMany({
    where: { businessId: business.id },
    include: { sales: true },
    orderBy: { name: "asc" },
  });

  const totalReceivable = customers.reduce(
    (s, c) => s + c.sales.reduce((x, sale) => x + sale.outstandingBalance, 0),
    0
  );

  return (
    <>
      <PageHeader
        title="Pelanggan"
        subtitle={
          totalReceivable > 0
            ? `Total piutang ${formatIDR(totalReceivable)}`
            : "Kontak dan riwayat belanja pembeli"
        }
        action={
          <Link
            href="/customers/new"
            aria-label="Tambah pelanggan"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-terracotta text-white active:bg-terracotta-dark"
          >
            <IconPlus className="h-5 w-5" strokeWidth={2.2} />
          </Link>
        }
      />

      {customers.length === 0 ? (
        <EmptyState
          title="Belum ada pelanggan"
          body="Simpan nama dan nomor pembeli, supaya mudah menagih sisa pembayaran dan menawarkan produk baru."
          actionLabel="Tambah Pelanggan"
          actionHref="/customers/new"
        />
      ) : (
        <List>
          {customers.map((c) => {
            const spent = c.sales.reduce((s, sale) => s + sale.amountPaid, 0);
            const outstanding = c.sales.reduce((s, sale) => s + sale.outstandingBalance, 0);
            return (
              <Row
                key={c.id}
                href={`/customers/${c.id}`}
                title={c.name}
                meta={`${c.phone ?? "Tanpa nomor"} · ${customerTypeLabel(c.type)} · ${c.sales.length} transaksi`}
                amount={outstanding > 0 ? `Piutang ${formatIDR(outstanding)}` : formatIDR(spent)}
                amountTone={outstanding > 0 ? "negative" : "neutral"}
              />
            );
          })}
        </List>
      )}
    </>
  );
}
