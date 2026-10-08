"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { login, logout } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { resolveRedirectTarget, withRedirect } from "@/lib/auth-redirect";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const user = await login(email, password);

      if (user.role !== "customer") {
        await logout();
        setError("Akun ini bukan akun customer. Gunakan halaman login admin.");
        return;
      }

      router.push(resolveRedirectTarget(searchParams.get("redirect")));
      router.refresh();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Tidak dapat terhubung ke server. Periksa koneksi Anda dan coba lagi.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#FBF7F0] px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4 rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="font-[family-name:var(--font-heading)] text-2xl font-semibold text-[#302C27]">
          Masuk
        </h1>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-[#E8DCC8] px-3 py-2 text-sm"
        />
        <input
          type="password"
          required
          placeholder="Kata sandi"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-[#E8DCC8] px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-[#C9A86A] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {loading ? "Memproses..." : "Masuk"}
        </button>
        <p className="text-center text-sm text-[#81786E]">
          Belum punya akun?{" "}
          <Link href={withRedirect("/register", searchParams.get("redirect"))} className="font-medium text-[#302C27] underline">
            Daftar
          </Link>
        </p>
      </form>
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
