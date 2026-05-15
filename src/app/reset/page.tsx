"use client";

import { AuthScaffold } from "@/components/AuthScaffold";
import { btnPrimaryClass, inputClass } from "@/lib/ui";
import { toast } from "@/lib/toast";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { KeyRound } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });
      if (error) throw error;
      const m = "Đã gửi email đặt lại mật khẩu (nếu email tồn tại).";
      setMessage(m);
      toast.success(m);
    } catch (err) {
      const m = err instanceof Error ? err.message : "Gửi email thất bại";
      setError(m);
      toast.error(m);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthScaffold>
      <div className="mb-2 flex justify-center">
        <div className="rounded-2xl bg-gradient-to-br from-amber-500/15 to-orange-500/10 p-3 ring-1 ring-amber-500/20">
          <KeyRound className="h-9 w-9 text-amber-700" strokeWidth={2} />
        </div>
      </div>
      <h1 className="text-center text-2xl font-bold tracking-tight text-zinc-900">Quên mật khẩu</h1>
      <p className="mt-1 text-center text-sm text-zinc-600">Nhập email để nhận link đặt lại mật khẩu.</p>

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

        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {message ? <p className="text-sm text-emerald-700">{message}</p> : null}

        <button type="submit" disabled={loading} className={btnPrimaryClass}>
          {loading ? "Đang gửi..." : "Gửi email"}
        </button>
      </form>

      <div className="mt-6 text-center text-sm">
        <Link href="/login" className="font-medium text-teal-700 hover:text-teal-800">
          Quay lại đăng nhập
        </Link>
      </div>
    </AuthScaffold>
  );
}
