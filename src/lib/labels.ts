export const PAYMENT_STATUS_LABEL: Record<string, string> = {
  Paid: "Lunas",
  Unpaid: "Belum Lunas",
  "Partially Paid": "Dibayar Sebagian",
  Cancelled: "Dibatalkan",
};

export const ORDER_STATUS_LABEL: Record<string, string> = {
  New: "Baru",
  Confirmed: "Dikonfirmasi",
  Processing: "Diproses",
  Ready: "Siap",
  Completed: "Selesai",
  Cancelled: "Dibatalkan",
};

export function paymentStatusLabel(status: string): string {
  return PAYMENT_STATUS_LABEL[status] ?? status;
}

export function orderStatusLabel(status: string): string {
  return ORDER_STATUS_LABEL[status] ?? status;
}

export const CUSTOMER_TYPE_LABEL: Record<string, string> = {
  New: "Baru",
  Returning: "Pelanggan Tetap",
  Reseller: "Reseller",
  Wholesale: "Grosir",
  Other: "Lainnya",
};

export function customerTypeLabel(type: string): string {
  return CUSTOMER_TYPE_LABEL[type] ?? type;
}
