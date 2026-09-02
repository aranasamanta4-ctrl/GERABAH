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
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Gagal membuat usaha.");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Tidak bisa menyimpan. Periksa koneksi internet lalu coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <label className="block">
        <span className="label mb-1.5 block">Nama usaha</span>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="mis. Gerabah Bu Siti"
          className="field"
        />
      </label>
      <label className="block">
        <span className="label mb-1.5 block">Lokasi</span>
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Desa / Kecamatan / Kabupaten"
          className="field"
        />
      </label>
      <label className="block">
        <span className="label mb-1.5 block">Keterangan singkat</span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Apa saja yang dibuat dan dijual"
          className="field"
        />
      </label>
      {error && <p className="text-[13px] font-medium text-rose">{error}</p>}
      <button type="submit" disabled={loading} className="btn btn-primary mt-1 w-full disabled:opacity-60">
        {loading ? "Menyimpan…" : "Mulai Mencatat"}
      </button>
    </form>
  );
}
