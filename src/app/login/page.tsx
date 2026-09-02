"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { AuthShell } from "@/components/auth-shell";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Gagal masuk.");
        return;
      }
      router.push(redirect || (data.hasBusiness ? "/dashboard" : "/onboarding"));
      router.refresh();
    } catch {
      setError("Tidak bisa masuk. Periksa koneksi internet lalu coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Masuk"
      subtitle="Lanjutkan mencatat keuangan usahamu."
      footer={
        <>
          Belum punya akun?{" "}
          <Link href="/signup" className="font-semibold text-terracotta">
            Daftar
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
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
          <span className="label mb-1.5 block">Kata sandi</span>
          <input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="field"
          />
        </label>
        {error && <p className="text-[13px] font-medium text-rose">{error}</p>}
        <button type="submit" disabled={loading} className="btn btn-primary mt-1 w-full disabled:opacity-60">
          {loading ? "Memproses…" : "Masuk"}
        </button>
      </form>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
