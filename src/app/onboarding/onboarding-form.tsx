"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function OnboardingForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/business", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, location }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Gagal membuat bisnis.");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div>
        <label className="mb-1 block text-sm text-charcoal/70">Nama Bisnis</label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Contoh: Ayu Ceramics"
          className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-terracotta"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm text-charcoal/70">Deskripsi Singkat</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-terracotta"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm text-charcoal/70">Lokasi</label>
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Kota / Kabupaten"
          className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-terracotta"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm text-charcoal/70">Kategori Bisnis</label>
        <input
          disabled
          value="Gerabah / Keramik"
          className="w-full rounded-lg border border-border bg-beige/50 px-3 py-2 text-sm text-charcoal/60"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="mt-2 rounded-full bg-terracotta px-4 py-2 text-sm font-medium text-white hover:bg-terracotta-dark disabled:opacity-60"
      >
        {loading ? "Menyimpan..." : "Mulai Kelola Bisnis"}
      </button>
    </form>
  );
}
