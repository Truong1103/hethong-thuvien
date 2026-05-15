"use client";

import { AuthScaffold } from "@/components/AuthScaffold";
import { GoogleLogo } from "@/components/icons/GoogleLogo";
import { btnGoogleClass, btnPrimaryClass, inputClass } from "@/lib/ui";
import { getOAuthCallbackUrl } from "@/lib/auth-redirect";
import { toast } from "@/lib/toast";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      setDone(true);
      toast.success("Đăng ký thành công. Kiểm tra email xác nhận nếu bật xác thực.");
      router.push("/books");
      router.refresh();
    } catch (err) {
      const m = err instanceof Error ? err.message : "Đăng ký thất bại";
      setError(m);
      toast.error(m);
    } finally {
      setLoading(false);
    }
  }

  async function onGoogleSignUp() {
    setError(null);
    setGoogleLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: getOAuthCallbackUrl("/books"),
        },
      });
      if (error) throw error;
    } catch (err) {
      setGoogleLoading(false);
      const m = err instanceof Error ? err.message : "Đăng ký Google thất bại";
      setError(m);
      toast.error(m);
    }
  }

  return (
    <AuthScaffold>
      <div className="mb-2 flex justify-center">
        <div className="rounded-2xl bg-gradient-to-br from-teal-500/15 to-emerald-500/10 p-3 ring-1 ring-teal-500/20">
          <UserPlus className="h-9 w-9 text-teal-600" strokeWidth={2} />
        </div>
      </div>
      <h1 className="text-center text-2xl font-bold tracking-tight text-zinc-900">Tạo tài khoản</h1>
      <p className="mt-1 text-center text-sm text-zinc-600">Đăng ký bằng email hoặc Google.</p>

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
            minLength={6}
            className={inputClass}
            placeholder="Tối thiểu 6 ký tự"
            autoComplete="new-password"
          />
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {done ? <p className="text-sm text-emerald-700">Tạo tài khoản thành công.</p> : null}

        <button type="submit" disabled={loading} className={btnPrimaryClass}>
          {loading ? "Đang tạo..." : "Đăng ký"}
        </button>
      </form>

      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-zinc-200" />
        <span className="text-xs font-medium uppercase tracking-wide text-zinc-400">hoặc</span>
        <div className="h-px flex-1 bg-zinc-200" />
      </div>

      <button type="button" onClick={onGoogleSignUp} disabled={googleLoading} className={btnGoogleClass}>
        <GoogleLogo className="h-5 w-5 shrink-0" />
        {googleLoading ? "Đang chuyển tới Google..." : "Đăng ký bằng Google"}
      </button>

      <div className="mt-6 text-center text-sm">
        <Link href="/login" className="font-medium text-teal-700 hover:text-teal-800">
          Đã có tài khoản? Đăng nhập
        </Link>
      </div>
    </AuthScaffold>
  );
}
