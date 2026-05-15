"use client";

import { AuthScaffold } from "@/components/AuthScaffold";
import { btnPrimaryClass, inputClass } from "@/lib/ui";
import { toast } from "@/lib/toast";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setMessage("Cập nhật mật khẩu thành công.");
      toast.success("Cập nhật mật khẩu thành công.");
      router.push("/books");
      router.refresh();
    } catch (err) {
      const m = err instanceof Error ? err.message : "Cập nhật thất bại";
      setError(m);
      toast.error(m);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthScaffold>
      <div className="mb-2 flex justify-center">
        <div className="rounded-2xl bg-gradient-to-br from-indigo-500/15 to-violet-500/10 p-3 ring-1 ring-indigo-500/20">
          <Lock className="h-9 w-9 text-indigo-600" strokeWidth={2} />
        </div>
      </div>
      <h1 className="text-center text-2xl font-bold tracking-tight text-zinc-900">Đặt lại mật khẩu</h1>
      <p className="mt-1 text-center text-sm text-zinc-600">Nhập mật khẩu mới cho tài khoản.</p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-zinc-700">Mật khẩu mới</label>
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
        {message ? <p className="text-sm text-emerald-700">{message}</p> : null}

        <button type="submit" disabled={loading} className={btnPrimaryClass}>
          {loading ? "Đang cập nhật..." : "Cập nhật"}
        </button>
      </form>
    </AuthScaffold>
  );
}
