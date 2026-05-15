"use client";

import type { LucideIcon } from "lucide-react";
import { LayoutGrid, MessageSquare, Quote, Rss, Sparkles, UserPlus } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { staggerContainer, staggerItem } from "@/lib/motion";
import { useHydrated, useMotionEnabled } from "@/components/motion/useMotionConfig";

export type CommunityNavKey = "hub" | "feed" | "chat" | "challenges" | "quotes" | "suggestions";

const items: { href: string; key: CommunityNavKey; label: string; short: string; icon: LucideIcon }[] = [
  { href: "/community", key: "hub", label: "Tổng quan", short: "Hub", icon: LayoutGrid },
  { href: "/community/feed", key: "feed", label: "Feed", short: "Feed", icon: Rss },
  { href: "/community/chat", key: "chat", label: "Chat AI", short: "Chat", icon: MessageSquare },
  { href: "/community/challenges", key: "challenges", label: "Thử thách", short: "Thử thách", icon: Sparkles },
  { href: "/community/quotes", key: "quotes", label: "Trích dẫn", short: "Trích dẫn", icon: Quote },
  { href: "/community/suggestions", key: "suggestions", label: "Gợi ý theo dõi", short: "Gợi ý", icon: UserPlus },
];

export function CommunitySubnav({ current }: { current: CommunityNavKey }) {
  const hydrated = useHydrated();
  const enabled = useMotionEnabled();

  if (!hydrated || !enabled) {
    return (
      <nav
        className="flex flex-wrap gap-2 rounded-2xl border border-zinc-200/90 bg-white/90 p-2 shadow-sm backdrop-blur-sm"
        aria-label="Cộng đồng"
      >
        {items.map(({ href, key, label, short, icon: Icon }) => {
          const active = key === current;
          return (
            <Link
              key={href}
              href={href}
              title={label}
              className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition sm:px-3.5 ${
                active
                  ? "bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md shadow-teal-600/20"
                  : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
              }`}
            >
              <Icon className={`h-4 w-4 shrink-0 ${active ? "text-white" : "text-teal-600"}`} strokeWidth={2} />
              <span className="hidden sm:inline">{label}</span>
              <span className="sm:hidden">{short}</span>
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <motion.nav
      variants={staggerContainer}
      initial="hidden"
      animate={enabled ? "visible" : false}
      className="flex flex-wrap gap-2 rounded-2xl border border-zinc-200/90 bg-white/90 p-2 shadow-sm backdrop-blur-sm"
      aria-label="Cộng đồng"
    >
      {items.map(({ href, key, label, short, icon: Icon }) => {
        const active = key === current;
        return (
          <motion.div key={href} variants={staggerItem}>
            <Link
              href={href}
              title={label}
              className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition sm:px-3.5 ${
                active
                  ? "bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md shadow-teal-600/20"
                  : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
              }`}
            >
              <Icon className={`h-4 w-4 shrink-0 ${active ? "text-white" : "text-teal-600"}`} strokeWidth={2} />
              <span className="hidden sm:inline">{label}</span>
              <span className="sm:hidden">{short}</span>
            </Link>
          </motion.div>
        );
      })}
    </motion.nav>
  );
}
