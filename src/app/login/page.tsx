"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

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
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Gagal masuk.");
        return;
      }
      router.push(redirect || (data.hasBusiness ? "/dashboard" : "/onboarding"));
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center bg-cream px-6 py-16">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 block text-center font-serif text-xl font-semibold">
          GERABAH
        </Link>
        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
          <h1 className="mb-6 text-center text-lg font-semibold text-charcoal">Masuk</h1>
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <div>
              <label className="mb-1 block text-sm text-charcoal/70">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-terracotta"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-charcoal/70">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-terracotta"
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 rounded-full bg-terracotta px-4 py-2 text-sm font-medium text-white hover:bg-terracotta-dark disabled:opacity-60"
            >
              {loading ? "Memproses..." : "Masuk"}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-charcoal/60">
            Belum punya akun?{" "}
            <Link href="/signup" className="font-medium text-terracotta">
              Daftar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
