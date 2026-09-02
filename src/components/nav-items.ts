export const NAV_ITEMS = [
  { href: "/dashboard", label: "Beranda" },
  { href: "/finance", label: "Keuangan" },
  { href: "/sales", label: "Penjualan" },
  { href: "/orders", label: "Pesanan" },
  { href: "/products", label: "Produk" },
  { href: "/customers", label: "Pelanggan" },
  { href: "/reports", label: "Laporan" },
];

// The two entries the training programme leads with: cash in, cash out.
export const ADD_ACTIONS = [
  { href: "/finance/new?type=INCOME", label: "Uang Masuk", hint: "Terima uang dari pembeli atau sumber lain" },
  { href: "/finance/new?type=EXPENSE", label: "Uang Keluar", hint: "Beli tanah liat, kayu bakar, ongkos kirim" },
  { href: "/sales/new", label: "Penjualan", hint: "Catat barang terjual, stok berkurang otomatis" },
  { href: "/orders/new", label: "Pesanan", hint: "Dikerjakan dulu, dibayar belakangan" },
  { href: "/products/new", label: "Produk", hint: "Tambah produk beserta biaya produksinya" },
  { href: "/customers/new", label: "Pelanggan", hint: "Simpan nama dan kontak pembeli" },
];

export const MORE_ITEMS = [
  { href: "/sales", label: "Penjualan", desc: "Riwayat barang terjual" },
  { href: "/orders", label: "Pesanan", desc: "Pesanan berjalan dan tagihannya" },
  { href: "/products", label: "Produk", desc: "Katalog, stok, dan biaya produksi" },
  { href: "/customers", label: "Pelanggan", desc: "Kontak dan riwayat belanja" },
  { href: "/settings", label: "Pengaturan", desc: "Profil usaha dan akun" },
];
