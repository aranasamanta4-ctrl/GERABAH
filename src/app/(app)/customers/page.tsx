import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentBusiness } from "@/lib/current-user";
import { customerTypeLabel } from "@/lib/labels";

function formatIDR(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

export default async function CustomersPage() {
  const business = await getCurrentBusiness();
  if (!business) return null;

  const customers = await prisma.customer.findMany({
    where: { businessId: business.id },
    include: { sales: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-serif text-2xl font-semibold text-charcoal">Pelanggan</h1>
        <Link
          href="/customers/new"
          className="rounded-full bg-terracotta px-4 py-2 text-sm font-medium text-white hover:bg-terracotta-dark"
        >
          + Tambah Pelanggan
        </Link>
      </div>

      {customers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <p className="text-charcoal/60">Belum ada pelanggan tercatat.</p>
          <Link
            href="/customers/new"
            className="mt-4 inline-block rounded-full bg-terracotta px-5 py-2 text-sm font-medium text-white hover:bg-terracotta-dark"
          >
            + Tambah Pelanggan
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          {customers.map((c) => {
            const totalSpending = c.sales.reduce((s, sale) => s + sale.amountPaid, 0);
            const outstanding = c.sales.reduce((s, sale) => s + sale.outstandingBalance, 0);
            return (
              <Link
                key={c.id}
                href={`/customers/${c.id}`}
                className="flex items-center justify-between border-b border-border bg-card px-4 py-3 text-sm last:border-b-0 hover:bg-beige/30"
              >
                <div>
                  <p className="font-medium text-charcoal">{c.name}</p>
                  <p className="text-xs text-charcoal/50">
                    {c.phone ?? "-"} · {customerTypeLabel(c.type)} · {c.sales.length} transaksi
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-charcoal">{formatIDR(totalSpending)}</p>
                  {outstanding > 0 && (
                    <p className="text-xs font-medium text-terracotta">
                      Piutang {formatIDR(outstanding)}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
