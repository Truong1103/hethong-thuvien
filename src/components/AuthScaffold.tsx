"use client";

import { FadeUp, ScaleIn } from "@/components/motion";
import { Library } from "lucide-react";
import Link from "next/link";

export function AuthScaffold({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-[calc(100dvh-3.5rem)] flex-col items-center justify-center px-4 py-10">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-10 top-10 h-80 w-80 rounded-full bg-teal-400/30 blur-3xl" />
        <div className="absolute -right-10 bottom-10 h-96 w-96 rounded-full bg-indigo-500/25 blur-3xl" />
        <div className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-amber-300/20 blur-3xl" />
      </div>

      <FadeUp delay={0.05}>
        <Link
          href="/"
          className="mb-6 flex items-center gap-2 text-sm font-medium text-zinc-600 transition hover:text-teal-700"
        >
          <Library className="h-5 w-5 text-teal-600" strokeWidth={2} />
          Về trang chủ
        </Link>
      </FadeUp>

      <ScaleIn className="w-full max-w-[440px] rounded-2xl border border-zinc-200/80 bg-white/90 p-8 shadow-xl shadow-zinc-900/5 backdrop-blur-sm">
        {children}
      </ScaleIn>
    </div>
  );
}
