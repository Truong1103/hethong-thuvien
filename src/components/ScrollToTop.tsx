"use client";

import { ArrowUp } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

const SHOW_AFTER_PX = 320;

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > SHOW_AFTER_PX);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Cuộn lên đầu trang"
      title="Lên đầu trang"
      className={`fixed bottom-6 right-5 z-50 flex h-11 w-11 items-center justify-center rounded-full border border-white/50 bg-gradient-to-br from-teal-600 to-emerald-600 text-white shadow-lg shadow-teal-700/30 transition-all duration-300 hover:scale-105 hover:from-teal-500 hover:to-emerald-500 hover:shadow-xl focus:outline-none focus-visible:ring-4 focus-visible:ring-teal-500/40 sm:bottom-8 sm:right-8 sm:h-12 sm:w-12 ${
        visible
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none translate-y-3 opacity-0"
      }`}
    >
      <ArrowUp className="h-5 w-5" strokeWidth={2.5} />
    </button>
  );
}
