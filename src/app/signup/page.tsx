"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthShell } from "@/components/auth-shell";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Gagal mendaftar.");
        return;
      }
      router.push("/onboarding");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Buat Akun"
      subtitle="Gratis, dan datanya hanya bisa dilihat olehmu."
      footer={
        <>
          Sudah punya akun?{" "}
          <Link href="/login" className="font-semibold text-terracotta">
            Masuk
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <label className="block">
          <span className="label mb-1.5 block">Nama</span>
          <input required value={name} onChange={(e) => setName(e.target.value)} className="field" />
        </label>
        <label className="block">
          <span className="label mb-1.5 block">Email</span>
          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="field"
          />
        </label>
        <label className="block">
          <span className="label mb-1.5 block">Nomor HP (opsional)</span>
          <input
            type="tel"
            inputMode="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="08…"
            className="field"
          />
        </label>
        <label className="block">
          <span className="label mb-1.5 block">Kata sandi</span>
          <input
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="field"
          />
          <span className="mt-1 block text-[12px] text-muted">Minimal 8 karakter.</span>
        </label>
        {error && <p className="text-[13px] font-medium text-rose">{error}</p>}
        <button type="submit" disabled={loading} className="btn btn-primary mt-1 w-full disabled:opacity-60">
          {loading ? "Memproses…" : "Daftar"}
        </button>
      </form>
    </AuthShell>
  );
}
