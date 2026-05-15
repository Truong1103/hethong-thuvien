"use client";

import { AuthScaffold } from "@/components/AuthScaffold";
import { GoogleLogo } from "@/components/icons/GoogleLogo";
import { btnGoogleClass, btnPrimaryClass, inputClass } from "@/lib/ui";
import { getOAuthCallbackUrl } from "@/lib/auth-redirect";
import { toast } from "@/lib/toast";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { LogIn } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = useMemo(() => {
    const n = searchParams.get("next") ?? "/books";
    return n.startsWith("/") && !n.startsWith("//") ? n : "/books";
  }, [searchParams]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success("Đăng nhập thành công.");
      router.push(nextPath);
      router.refresh();
    } catch (err) {
      const m = err instanceof Error ? err.message : "Đăng nhập thất bại";
      setError(m);
      toast.error(m);
    } finally {
      setLoading(false);
    }
  }

  async function onGoogleSignIn() {
    setError(null);
    setGoogleLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: getOAuthCallbackUrl(nextPath),
        },
      });
      if (error) throw error;
    } catch (err) {
      setGoogleLoading(false);
      const m = err instanceof Error ? err.message : "Đăng nhập Google thất bại";
      setError(m);
      toast.error(m);
    }
  }

  return (
    <>
      <div className="mb-2 flex justify-center">
        <div className="rounded-2xl bg-gradient-to-br from-teal-500/15 to-emerald-500/10 p-3 ring-1 ring-teal-500/20">
          <LogIn className="h-9 w-9 text-teal-600" strokeWidth={2} />
        </div>
      </div>
      <h1 className="text-center text-2xl font-bold tracking-tight text-zinc-900">Đăng nhập</h1>
      <p className="mt-1 text-center text-sm text-zinc-600">Dùng email hoặc tài khoản Google.</p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-zinc-700">Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
            className={inputClass}
            placeholder="you@example.com"
            autoComplete="email"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-zinc-700">Mật khẩu</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
            className={inputClass}
            placeholder="••••••••"
            autoComplete="current-password"
          />
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <button type="submit" disabled={loading} className={btnPrimaryClass}>
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
      </form>

      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-zinc-200" />
        <span className="text-xs font-medium uppercase tracking-wide text-zinc-400">hoặc</span>
        <div className="h-px flex-1 bg-zinc-200" />
      </div>

      <button type="button" onClick={onGoogleSignIn} disabled={googleLoading} className={btnGoogleClass}>
        <GoogleLogo className="h-5 w-5 shrink-0" />
        {googleLoading ? "Đang chuyển tới Google..." : "Đăng nhập bằng Google"}
      </button>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-2 text-sm">
        <Link href="/reset" className="font-medium text-teal-700 hover:text-teal-800">
          Quên mật khẩu?
        </Link>
        <Link href="/signup" className="font-medium text-teal-700 hover:text-teal-800">
          Tạo tài khoản
        </Link>
      </div>
    </>
  );
}

function LoginFallback() {
  return (
    <div className="flex flex-col items-center py-10">
      <div className="h-12 w-12 animate-pulse rounded-2xl bg-zinc-200" />
      <div className="mt-4 h-6 w-40 animate-pulse rounded bg-zinc-200" />
      <div className="mt-8 h-32 w-full animate-pulse rounded-xl bg-zinc-100" />
    </div>
  );
}

export default function LoginPage() {
  return (
    <AuthScaffold>
      <Suspense fallback={<LoginFallback />}>
        <LoginForm />
      </Suspense>
    </AuthScaffold>
  );
}
